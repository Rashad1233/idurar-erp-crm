# Restart backend server after warehouse display fixes
Write-Host "Restarting backend server after warehouse display fixes..." -ForegroundColor Green

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
Write-Host "Please check the Warehouse page in the frontend to verify the fixes." -ForegroundColor Green
