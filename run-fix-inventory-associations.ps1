#!/usr/bin/env pwsh
# run-fix-inventory-associations.ps1
# Script to run the inventory associations fix

Write-Host "Running inventory associations fix script..." -ForegroundColor Green

try {
    # Navigate to the backend directory
    Set-Location -Path "c:\Users\rasha\Desktop\test erp\backend"
    
    # Run the fix script
    Write-Host "Executing fix-inventory-associations.js..." -ForegroundColor Cyan
    node fix-inventory-associations.js
    
    # Check if the script ran successfully
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Inventory associations fix completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Inventory associations fix failed with exit code $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "Error running inventory associations fix: $_" -ForegroundColor Red
}

# Return to the original directory
Set-Location -Path "c:\Users\rasha\Desktop\test erp"
