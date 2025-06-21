# Start ERP System Script
# This script will start both the backend and frontend servers

Write-Host "==== ERP System Startup Script ====" -ForegroundColor Cyan
Write-Host "This script will start both the backend and frontend servers." -ForegroundColor Cyan
Write-Host ""

# Start the backend server
Write-Host "Step 1: Starting backend server..." -ForegroundColor Yellow
try {
    # Use PowerShell Start-Process to run the backend script in a new window
    Start-Process powershell -ArgumentList "-File", ".\start-backend.ps1"
    Write-Host "Backend startup initiated. Wait for the backend to initialize before starting the frontend." -ForegroundColor Green
    
    # Give the backend a moment to start
    Start-Sleep -Seconds 5
} catch {
    Write-Host "Error starting backend: $_" -ForegroundColor Red
    exit 1
}

# Start the frontend server
Write-Host "`nStep 2: Starting frontend server..." -ForegroundColor Yellow
try {
    # Use PowerShell Start-Process to run the frontend script in a new window
    Start-Process powershell -ArgumentList "-File", ".\start-frontend.ps1"
    Write-Host "Frontend startup initiated." -ForegroundColor Green
} catch {
    Write-Host "Error starting frontend: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n==== ERP System Started ====" -ForegroundColor Cyan
Write-Host "Both backend and frontend servers should now be running in separate windows." -ForegroundColor Green
Write-Host "`nAccess the application at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "API endpoints are available at: http://localhost:8888/api" -ForegroundColor Yellow
