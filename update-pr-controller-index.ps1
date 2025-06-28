# PowerShell script to update the Purchase Requisition controller index file

$prControllerPath = "backend/src/controllers/appControllers/procurementControllers/purchaseRequisitionController"

# Check if the directory exists
if (Test-Path $prControllerPath) {
    Write-Host "Found PR controller directory" -ForegroundColor Green
    
    # Check if index-updated.js exists
    $updatedFile = Join-Path $prControllerPath "index-updated.js"
    $indexFile = Join-Path $prControllerPath "index.js"
    $backupFile = Join-Path $prControllerPath "index-old.js"
    
    if (Test-Path $updatedFile) {
        Write-Host "Found index-updated.js" -ForegroundColor Green
        
        # Backup current index.js if it exists
        if (Test-Path $indexFile) {
            Write-Host "Backing up current index.js to index-old.js" -ForegroundColor Yellow
            Move-Item -Path $indexFile -Destination $backupFile -Force
        }
        
        # Rename index-updated.js to index.js
        Write-Host "Renaming index-updated.js to index.js" -ForegroundColor Yellow
        Move-Item -Path $updatedFile -Destination $indexFile -Force
        
        Write-Host "Successfully updated the PR controller index file!" -ForegroundColor Green
    } else {
        Write-Host "index-updated.js not found!" -ForegroundColor Red
    }
} else {
    Write-Host "PR controller directory not found!" -ForegroundColor Red
}
