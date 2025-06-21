# Restart the backend server
Write-Host "Restarting the backend server..." -ForegroundColor Green

# Kill any existing node processes
Write-Host "Stopping any running Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process nodemon -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for processes to terminate
Start-Sleep -Seconds 2

# Navigate to the backend directory
Set-Location -Path "$PSScriptRoot\backend"

Write-Host "Starting the backend server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host "======================================================="

# Start the server using nodemon
nodemon src/index.js
