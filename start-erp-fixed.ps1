$ErrorActionPreference = "Stop"

Write-Host "Starting the ERP system..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path -Path "./package.json")) {
    Write-Host "Error: package.json not found. Make sure you're in the project root directory." -ForegroundColor Red
    exit 1
}

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "node" -ArgumentList "./backend/src/server.js" -NoNewWindow
    Write-Host "Backend server started successfully on port 8888." -ForegroundColor Green
} catch {
    Write-Host "Error starting backend server: $_" -ForegroundColor Red
    exit 1
}

# Wait a moment to ensure backend starts
Start-Sleep -Seconds 2

# Start the frontend development server
Write-Host "Starting frontend server..." -ForegroundColor Yellow
try {
    Set-Location -Path "./frontend"
    npm start
} catch {
    Write-Host "Error starting frontend server: $_" -ForegroundColor Red
    exit 1
}
