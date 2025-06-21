# Start Frontend Script
# This script will install the required dependencies and start the frontend development server

Write-Host "==== Frontend Setup and Start Script ====" -ForegroundColor Cyan
Write-Host "This script will install dependencies and start the frontend development server." -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Write-Host "Step 1: Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location -Path ".\frontend"

# Install dependencies
Write-Host "`nStep 2: Installing frontend dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencies installed successfully." -ForegroundColor Green
} catch {
    Write-Host "Error installing dependencies: $_" -ForegroundColor Red
    Write-Host "Please try installing dependencies manually." -ForegroundColor Yellow
    exit 1
}

# Start the frontend development server
Write-Host "`nStep 3: Starting frontend development server..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    Write-Host "Frontend development server starting in a new window." -ForegroundColor Green
} catch {
    Write-Host "Error starting frontend server: $_" -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location -Path ".."

Write-Host "`n==== Frontend Setup Complete ====" -ForegroundColor Cyan
Write-Host "The frontend development server is now running in a separate window." -ForegroundColor Green
Write-Host "`nMake sure the backend server is also running. If not, run:" -ForegroundColor Yellow
Write-Host ".\start-backend.ps1" -ForegroundColor White
