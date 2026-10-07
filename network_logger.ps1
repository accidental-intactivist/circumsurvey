<#
.SYNOPSIS
    Builds a single merged timeline of Wi-Fi, Bluetooth, PnP, power and
    hardware-error events, so you can see whether both radios die together.

.DESCRIPTION
    Pulls from several logs at once and sorts everything by timestamp:

      * Microsoft-Windows-WLAN-AutoConfig/Operational  - Wi-Fi connect/disconnect
      * System / BTHUSB                                 - Bluetooth radio failures
      * System / Kernel-PnP                             - device start/stop/surprise-removal
      * System / Kernel-Power                           - sleep, wake, unexpected shutdown
      * System / WHEA-Logger                            - corrected/uncorrected hardware errors
      * System / NDIS, Tcpip                            - miniport resets, IP-layer complaints

    The point is correlation. If a Bluetooth failure and a Wi-Fi disconnect
    share a timestamp, the fault is below both drivers (shared silicon, the
    PCIe link, or power to the M.2 slot) rather than being two separate bugs.

.PARAMETER Days
    How far back to look. Default 3.

.PARAMETER OutputPath
    Where to write the CSV. Defaults to your Desktop.

.EXAMPLE
    .\Get-WirelessDropTimeline.ps1
    .\Get-WirelessDropTimeline.ps1 -Days 7

.NOTES
    Run from an ELEVATED PowerShell window (right-click > Run as administrator).
    If the script is blocked, run this first in the same window:
        Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#>

[CmdletBinding()]
param(
    [int]$Days = 3,
    [string]$OutputPath = "$env:USERPROFILE\Desktop\wireless-drop-timeline.csv"
)

$ErrorActionPreference = 'Stop'
$start = (Get-Date).AddDays(-$Days)

# --- Are we elevated? -------------------------------------------------------
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Warning "Not running as administrator. Some logs will be unreadable."
    Write-Warning "Close this and re-open PowerShell with 'Run as administrator'."
}

Write-Host ""
Write-Host "Collecting events since $($start.ToString('yyyy-MM-dd HH:mm'))..." -ForegroundColor Cyan
Write-Host ""

$events = New-Object System.Collections.Generic.List[object]

# Wrapper so a log with zero matching events doesn't abort the run.
function Get-EventsSafely {
    param($FilterHashtable, [string]$Category)

    try {
        Get-WinEvent -FilterHashtable $FilterHashtable -ErrorAction Stop |
            ForEach-Object {
                [PSCustomObject]@{
                    Time     = $_.TimeCreated
                    Category = $Category
                    Log      = $_.LogName
                    Source   = $_.ProviderName
                    Id       = $_.Id
                    Level    = $_.LevelDisplayName
                    Message  = ($_.Message -replace '\s+', ' ').Trim()
                }
            }
    }
    catch [Exception] {
        # "No events were found" is the normal case for a quiet provider.
        if ($_.Exception.Message -notmatch 'No events were found') {
            Write-Warning "$Category : $($_.Exception.Message)"
        }
    }
}

# --- Wi-Fi ------------------------------------------------------------------
# 8001 connected | 8002 connect failed | 8003 disconnected
# 4003 limited connectivity / auto-recovery | 11004/11005 association
# 12013 auth failure
$wifi = Get-EventsSafely -Category 'WIFI' -FilterHashtable @{
    LogName   = 'Microsoft-Windows-WLAN-AutoConfig/Operational'
    StartTime = $start
    Id        = 8001, 8002, 8003, 4003, 11004, 11005, 11010, 12013
}
if ($wifi) { $events.AddRange(@($wifi)) }

# --- Bluetooth --------------------------------------------------------------
# 7 vendor hardware error | 16 auth failure | 17 adapter failed, driver unloaded
$bt = Get-EventsSafely -Category 'BLUETOOTH' -FilterHashtable @{
    LogName      = 'System'
    StartTime    = $start
    ProviderName = 'BTHUSB', 'BthPort', 'BthLEEnum', 'BthMini'
}
if ($bt) { $events.AddRange(@($bt)) }

# --- Device stop/start ------------------------------------------------------
# 219 driver loaded | 411 device failed to start | 225/441 removal
$pnp = Get-EventsSafely -Category 'DEVICE' -FilterHashtable @{
    LogName      = 'System'
    StartTime    = $start
    ProviderName = 'Microsoft-Windows-Kernel-PnP'
}
if ($pnp) { $events.AddRange(@($pnp)) }

# --- Power transitions ------------------------------------------------------
# 41 unexpected shutdown | 42 entering sleep | 107 resumed from sleep
$power = Get-EventsSafely -Category 'POWER' -FilterHashtable @{
    LogName      = 'System'
    StartTime    = $start
    ProviderName = 'Microsoft-Windows-Kernel-Power', 'Microsoft-Windows-Power-Troubleshooter'
}
if ($power) { $events.AddRange(@($power)) }

# --- Hardware errors --------------------------------------------------------
# WHEA 17 = corrected hardware error, often a PCIe link issue. If these cluster
# around your dropouts, suspect the card seating or the slot, not the driver.
$whea = Get-EventsSafely -Category 'HARDWARE' -FilterHashtable @{
    LogName      = 'System'
    StartTime    = $start
    ProviderName = 'Microsoft-Windows-WHEA-Logger'
}
if ($whea) { $events.AddRange(@($whea)) }

# --- Network stack ----------------------------------------------------------
$net = Get-EventsSafely -Category 'NETWORK' -FilterHashtable @{
    LogName      = 'System'
    StartTime    = $start
    ProviderName = 'Microsoft-Windows-NDIS', 'Tcpip', 'Dhcp-Client', 'e1dexpress', 'rtwlane', 'rtwlane01', 'RtkBtfilter'
}
if ($net) { $events.AddRange(@($net)) }

# --- Report -----------------------------------------------------------------
if ($events.Count -eq 0) {
    Write-Host "No matching events found in the last $Days day(s)." -ForegroundColor Yellow
    Write-Host "Either things have been quiet, or the logs have rolled over."
    return
}

$sorted = $events | Sort-Object Time

Write-Host "=== SUMMARY ===" -ForegroundColor Green
$sorted | Group-Object Category |
    Sort-Object Count -Descending |
    Format-Table @{N='Category'; E={$_.Name}}, Count -AutoSize

Write-Host "=== EVENTS BY ID ===" -ForegroundColor Green
$sorted | Group-Object Category, Id |
    Sort-Object Count -Descending |
    Select-Object -First 20 |
    Format-Table @{N='Category / Event ID'; E={$_.Name}}, Count -AutoSize

# The headline test: do Wi-Fi and Bluetooth failures share a moment?
Write-Host "=== CO-OCCURRENCE CHECK (within 30 seconds) ===" -ForegroundColor Green
$wifiDrops = $sorted | Where-Object { $_.Category -eq 'WIFI' -and $_.Id -in 8002, 8003, 4003 }
$btFails   = $sorted | Where-Object { $_.Category -eq 'BLUETOOTH' -and $_.Id -in 7, 17 }

$pairs = foreach ($w in $wifiDrops) {
    foreach ($b in $btFails) {
        $gap = [math]::Abs(($w.Time - $b.Time).TotalSeconds)
        if ($gap -le 30) {
            [PSCustomObject]@{
                WifiTime  = $w.Time
                WifiId    = $w.Id
                BtTime    = $b.Time
                BtId      = $b.Id
                GapSecs   = [math]::Round($gap, 1)
            }
        }
    }
}

if ($pairs) {
    $pairs | Sort-Object WifiTime | Format-Table -AutoSize
    Write-Host "Wi-Fi and Bluetooth are failing together." -ForegroundColor Yellow
    Write-Host "That points BELOW both drivers - shared radio silicon, the PCIe" -ForegroundColor Yellow
    Write-Host "link, or power delivery to the M.2 slot." -ForegroundColor Yellow
} else {
    Write-Host "No Wi-Fi/Bluetooth failures found within 30s of each other." -ForegroundColor Yellow
    Write-Host "If both really do drop at once, the radio may be failing without" -ForegroundColor Yellow
    Write-Host "logging it - check the DEVICE and POWER rows around the outage." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== WI-FI DISCONNECT REASONS ===" -ForegroundColor Green
$sorted | Where-Object { $_.Id -eq 8003 } |
    Select-Object -Last 15 Time, @{N='Reason'; E={
        if ($_.Message -match 'Reason:\s*(.+?)(?:\s{2,}|$)') { $matches[1] } else { $_.Message.Substring(0, [Math]::Min(90, $_.Message.Length)) }
    }} | Format-Table -AutoSize -Wrap

$sorted | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8

Write-Host ""
Write-Host "Full timeline written to:" -ForegroundColor Cyan
Write-Host "  $OutputPath"
Write-Host "  ($($sorted.Count) events)"
Write-Host ""
Write-Host "Next time it drops, note the clock time, re-run this, and look at" -ForegroundColor Cyan
Write-Host "everything within a minute either side of it." -ForegroundColor Cyan
Write-Host ""