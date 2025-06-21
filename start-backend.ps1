# Start Backend Script
# This script will install the required dependencies and start the backend server

Write-Host "==== Backend Setup and Start Script ====" -ForegroundColor Cyan
Write-Host "This script will install dependencies and start the backend server." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Write-Host "Step 1: Navigating to backend directory..." -ForegroundColor Yellow
Set-Location -Path ".\backend"

# Install dependencies
Write-Host "`nStep 2: Installing backend dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencies installed successfully." -ForegroundColor Green
} catch {
    Write-Host "Error installing dependencies: $_" -ForegroundColor Red
    Write-Host "Please try installing dependencies manually." -ForegroundColor Yellow
    exit 1
}

# Start the backend server
Write-Host "`nStep 3: Starting backend server..." -ForegroundColor Yellow
try {
    # Use nodemon if available, otherwise use node
    if (Get-Command "nodemon" -ErrorAction SilentlyContinue) {
        Write-Host "Starting with nodemon for development..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "nodemon src/index.js"
    } else {
        Write-Host "Starting with node..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "node src/index.js"
    }
    
    Write-Host "Backend server starting in a new window." -ForegroundColor Green
} catch {
    Write-Host "Error starting backend server: $_" -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location -Path ".."

Write-Host "`n==== Backend Setup Complete ====" -ForegroundColor Cyan
Write-Host "The backend server is now running in a separate window." -ForegroundColor Green
Write-Host "`nTo start the frontend:" -ForegroundColor Yellow
Write-Host "1. Navigate to the frontend directory: cd .\frontend" -ForegroundColor White
Write-Host "2. Install dependencies if needed: npm install" -ForegroundColor White
Write-Host "3. Start the frontend server: npm start" -ForegroundColor White
