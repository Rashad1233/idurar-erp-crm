# Script to fix inventory column issues
Write-Host "Starting inventory data fix process..." -ForegroundColor Cyan

# First, fix the naming collision by running the fix-inventory-associations.js script
Write-Host "Running inventory associations fix script..." -ForegroundColor Yellow
cd $PSScriptRoot\backend
node fix-inventory-associations.js

# Check result of the fix script
if ($LASTEXITCODE -eq 0) {
    Write-Host "Inventory associations fix script completed successfully" -ForegroundColor Green
} else {
    Write-Host "Inventory associations fix script failed with exit code $LASTEXITCODE" -ForegroundColor Red
}

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
cd $PSScriptRoot\backend
npm run dev
