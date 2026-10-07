$ErrorActionPreference = "Stop"

$inventoryDir = "C:\work\circumsurvey\advocacy-shell\pipeline_staging\inventory"
$scriptsDir = "C:\work\circumsurvey\advocacy-shell\scripts"

# Find all base inventory files (exclude the _stage* generated ones)
$inventories = Get-ChildItem -Path $inventoryDir -Filter "*_inventory.json" | Where-Object { $_.Name -notmatch "_stage" } | Select-Object -ExpandProperty FullName

Write-Host "Found $($inventories.Count) collections to process."

foreach ($inv in $inventories) {
    Write-Host "=========================================================="
    Write-Host "Processing Inventory: $inv"
    Write-Host "=========================================================="
    # Stage 2 (generates _inventory_stage2.json)
    $stage2Json = $inv.Replace("_inventory.json", "_inventory_stage2.json")
    if (-not (Test-Path $stage2Json)) {
        Write-Host "`n--- Running Stage 2 (OCR & Text Extraction) ---"
        python "$scriptsDir\pipeline_stage2_process.py" "$inv"
    } else { Write-Host "`n--- Skipping Stage 2 (Already exists) ---" }

    # Stage 3a (generates _inventory_stage3a.json)
    $stage3aJson = $inv.Replace("_inventory.json", "_inventory_stage3a.json")
    if (-not (Test-Path $stage3aJson)) {
        Write-Host "`n--- Running Stage 3a (Thumbnails & Resizing) ---"
        python "$scriptsDir\pipeline_stage3a_images.py" "$stage2Json"
    } else { Write-Host "`n--- Skipping Stage 3a (Already exists) ---" }

    # Stage 3b (generates _inventory_stage3b.json)
    $stage3bJson = $inv.Replace("_inventory.json", "_inventory_stage3b.json")
    if (-not (Test-Path $stage3bJson)) {
        Write-Host "`n--- Running Stage 3b (AI Enrichment) ---"
        python "$scriptsDir\pipeline_stage3b_enrich.py" "$stage3aJson"
    } else { Write-Host "`n--- Skipping Stage 3b (Already exists) ---" }

    # Stage 3c (Uploads to R2 and writes to D1)
    Write-Host "`n--- Running Stage 3c (Upload to R2 & DB Insert) ---"
    python "$scriptsDir\pipeline_stage3c_upload.py" "$stage3bJson"
    
    # Move to completed if successful
    if ($LASTEXITCODE -eq 0) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($inv)
        Move-Item -Path "$inventoryDir\$baseName*" -Destination "$inventoryDir\completed"
        Write-Host "`nFinished processing $inv and moved to completed`n"
    } else {
        Write-Host "`nFailed processing $inv`n"
    }
}

Write-Host "All pipelines completed successfully!"
