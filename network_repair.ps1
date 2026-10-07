<#
.SYNOPSIS
    Recovers the Realtek RTL8852BE Wi-Fi + Bluetooth combo card after it drops,
    without rebooting.

.DESCRIPTION
    Escalates through three levels, stopping as soon as the card comes back:

      1. RESTART  - pnputil /restart-device. Cheapest, a few seconds.
      2. POWER    - Disable-PnpDevice then Enable-PnpDevice. Forces a D3->D0
                    transition, which power-cycles the chip and reloads its
                    firmware. This is the level most likely to actually work.
      3. REINSTALL- pnputil /remove-device then /scan-devices. Tears down the
                    device node entirely; Windows re-detects the card and
                    reinstalls the driver. Only runs with -Full.

    Both radios live on one physical module, so the script resets the Bluetooth
    function and the WLAN function together. Services are restarted afterwards.

    Every run appends a line to a log so you can see how often this works
    versus how often you still end up rebooting.

.PARAMETER Full
    Also try level 3 (remove + rescan) if levels 1 and 2 don't recover it.

.PARAMETER LogPath
    Where to append results. Defaults to your Desktop.

.EXAMPLE
    .\Reset-WirelessCard.ps1
    .\Reset-WirelessCard.ps1 -Full

.NOTES
    NEEDS ADMIN. When this fires your Bluetooth mouse and keyboard will be
    dead too, so you'll be driving with the laptop's built-in keyboard and
    trackpad. Set up the shortcut described at the bottom of this file so
    recovery is a couple of keystrokes rather than a hunt through folders.
#>

[CmdletBinding()]
param(
    [switch]$Full,
    [string]$LogPath = "$env:USERPROFILE\Desktop\wireless-reset-log.txt"
)

$ErrorActionPreference = 'Continue'

# --- Elevation check --------------------------------------------------------
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script needs to run as administrator." -ForegroundColor Red
    Write-Host "Re-launching elevated..." -ForegroundColor Yellow
    $argList = "-ExecutionPolicy Bypass -File `"$PSCommandPath`""
    if ($Full) { $argList += " -Full" }
    Start-Process powershell -Verb RunAs -ArgumentList $argList
    return
}

function Write-Log {
    param([string]$Text, [string]$Color = 'Gray')
    Write-Host $Text -ForegroundColor $Color
    Add-Content -Path $LogPath -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $Text" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Log "=== Wireless card reset started ===" 'Cyan'

# --- Locate the two functions of the combo card -----------------------------
function Get-TargetDevices {
    $wlan = Get-PnpDevice -Class Net -ErrorAction SilentlyContinue |
        Where-Object { $_.FriendlyName -match 'RTL8852|Realtek.*(Wi-?Fi|Wireless)' }

    $bt = Get-PnpDevice -Class Bluetooth -ErrorAction SilentlyContinue |
        Where-Object { $_.FriendlyName -match 'Realtek Bluetooth' -and $_.InstanceId -match '^USB' }

    # Fall back to any Realtek Bluetooth node if the USB-rooted one isn't there
    if (-not $bt) {
        $bt = Get-PnpDevice -Class Bluetooth -ErrorAction SilentlyContinue |
            Where-Object { $_.FriendlyName -match 'Realtek' }
    }
    return @{ Wlan = $wlan; Bt = $bt }
}

$dev = Get-TargetDevices

if (-not $dev.Wlan) {
    Write-Log "WARNING: no Realtek WLAN device found in Device Manager at all." 'Red'
    Write-Log "The card may have fully de-enumerated. A reboot is likely required." 'Red'
}

foreach ($d in @($dev.Wlan) + @($dev.Bt)) {
    if ($d) { Write-Log "Found: $($d.FriendlyName)  [Status: $($d.Status)]" 'White' }
}

# --- Did it come back? ------------------------------------------------------
function Test-Recovered {
    Start-Sleep -Seconds 6
    $d = Get-TargetDevices
    $wlanOk = $d.Wlan -and ($d.Wlan | Where-Object { $_.Status -eq 'OK' })
    if (-not $wlanOk) { return $false }
    # Adapter present and not disabled/disconnected at the NDIS layer
    $nic = Get-NetAdapter -ErrorAction SilentlyContinue |
        Where-Object { $_.InterfaceDescription -match 'RTL8852|Realtek.*(Wi-?Fi|Wireless)' }
    return [bool]($nic | Where-Object { $_.Status -in 'Up','Disconnected' })
}

# =============================== LEVEL 1 ====================================
Write-Log "--- Level 1: restart device ---" 'Yellow'
foreach ($d in @($dev.Bt) + @($dev.Wlan)) {
    if (-not $d) { continue }
    Write-Log "  pnputil /restart-device on $($d.FriendlyName)"
    & pnputil /restart-device "$($d.InstanceId)" 2>&1 | Out-String | Write-Verbose
}

if (Test-Recovered) {
    Write-Log "RECOVERED at level 1 (device restart)." 'Green'
    $recovered = $true
}

# =============================== LEVEL 2 ====================================
if (-not $recovered) {
    Write-Log "--- Level 2: power cycle (D3 -> D0) ---" 'Yellow'
    $dev = Get-TargetDevices

    # Bluetooth down first, then WLAN - reverse of how they fail.
    foreach ($d in @($dev.Bt) + @($dev.Wlan)) {
        if (-not $d) { continue }
        Write-Log "  Disabling $($d.FriendlyName)"
        Disable-PnpDevice -InstanceId $d.InstanceId -Confirm:$false -ErrorAction SilentlyContinue
    }

    Write-Log "  Holding 8s in D3 to let the chip fully drop..."
    Start-Sleep -Seconds 8

    $dev = Get-TargetDevices
    foreach ($d in @($dev.Wlan) + @($dev.Bt)) {
        if (-not $d) { continue }
        Write-Log "  Enabling $($d.FriendlyName)"
        Enable-PnpDevice -InstanceId $d.InstanceId -Confirm:$false -ErrorAction SilentlyContinue
    }

    if (Test-Recovered) {
        Write-Log "RECOVERED at level 2 (power cycle)." 'Green'
        $recovered = $true
    }
}

# =============================== LEVEL 3 ====================================
if (-not $recovered -and $Full) {
    Write-Log "--- Level 3: remove device node and rescan ---" 'Yellow'
    Write-Log "  (this reinstalls the driver from the local driver store)"
    $dev = Get-TargetDevices

    foreach ($d in @($dev.Bt) + @($dev.Wlan)) {
        if (-not $d) { continue }
        Write-Log "  Removing node: $($d.FriendlyName)"
        & pnputil /remove-device "$($d.InstanceId)" 2>&1 | Out-String | Write-Verbose
    }

    Start-Sleep -Seconds 4
    Write-Log "  Rescanning for hardware changes..."
    & pnputil /scan-devices 2>&1 | Out-String | Write-Verbose
    Start-Sleep -Seconds 10

    if (Test-Recovered) {
        Write-Log "RECOVERED at level 3 (remove + rescan)." 'Green'
        $recovered = $true
    }
}
elseif (-not $recovered -and -not $Full) {
    Write-Log "Levels 1-2 did not recover it. Re-run with -Full to try remove+rescan." 'Yellow'
}

# --- Services ---------------------------------------------------------------
if ($recovered) {
    Write-Log "--- Restarting wireless services ---" 'Yellow'
    foreach ($svc in 'WlanSvc','bthserv','BTAGService') {
        $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
        if ($s -and $s.Status -eq 'Running') {
            Write-Log "  Restarting $svc"
            Restart-Service -Name $svc -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 5
}

# --- Result -----------------------------------------------------------------
Write-Host ""
if ($recovered) {
    $nic = Get-NetAdapter -ErrorAction SilentlyContinue |
        Where-Object { $_.InterfaceDescription -match 'RTL8852|Realtek.*(Wi-?Fi|Wireless)' }
    foreach ($n in $nic) { Write-Log "Adapter '$($n.Name)' status: $($n.Status)" 'Green' }
    Write-Log "=== SUCCESS - no reboot needed ===" 'Green'
    Write-Host ""
    Write-Host "Your Bluetooth mouse/keyboard may take 10-20s to re-pair." -ForegroundColor Cyan
} else {
    Write-Log "=== FAILED - card did not come back; reboot required ===" 'Red'
    Write-Host ""
    Write-Host "The firmware is likely hard-hung and unreachable over PCIe." -ForegroundColor Red
    Write-Host "Nothing in software can reset it from this state. Reboot." -ForegroundColor Red
}

Write-Host ""
Write-Host "Log: $LogPath" -ForegroundColor DarkGray
Write-Host ""

<#
================================ SETUP =====================================
Make this reachable when your mouse and keyboard are dead:

 1. Save this file somewhere permanent, e.g. C:\Tools\Reset-WirelessCard.ps1
 2. Right-click the Desktop > New > Shortcut
 3. Target:
      powershell.exe -ExecutionPolicy Bypass -File "C:\Tools\Reset-WirelessCard.ps1" -Full
 4. Name it "Fix WiFi"
 5. Right-click the shortcut > Properties > Advanced > tick "Run as administrator"
 6. Properties > Shortcut key > press Ctrl+Alt+W

Then when it drops: Ctrl+Alt+W on the BUILT-IN keyboard, approve the UAC
prompt with the trackpad, and wait about 30 seconds.
============================================================================
#>