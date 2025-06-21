# Restart backend server after all fixes including Item Master UNSPSC fix
Write-Host "Restarting backend server after all fixes..." -ForegroundColor Green

# Navigate to project directory
Set-Location "c:\Users\rasha\Desktop\test erp"

# Check if the backend server is running
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Stopping existing Node.js processes..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Cyan
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host "`nBackend server restarted!" -ForegroundColor Green
Write-Host "Please check the following pages in the frontend to verify all fixes:" -ForegroundColor Green
Write-Host "1. Warehouse page - Storage locations and bin locations should display properly" -ForegroundColor Cyan
Write-Host "2. Inventory page - All columns including storage location, bin location, item numbers, and UNSPSC codes should display properly" -ForegroundColor Cyan
Write-Host "3. Item Master page - UNSPSC codes should now be displayed properly" -ForegroundColor Cyan
