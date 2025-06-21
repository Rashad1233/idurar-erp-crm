# This script will apply all fixes and restart the ERP server
# Usage: ./restart-erp-with-fixes.ps1

Write-Host "Starting ERP system with all fixes applied..." -ForegroundColor Green

# Kill any running node processes to ensure clean start
try {
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Stopped existing Node.js processes" -ForegroundColor Yellow
    Start-Sleep -Seconds 1
} catch {
    Write-Host "No Node.js processes to stop" -ForegroundColor Gray
}

# Ensure the middleware directory exists
if (-not (Test-Path -Path "./backend/src/middleware")) {
    Write-Host "Creating middleware directory..." -ForegroundColor Yellow
    New-Item -Path "./backend/src/middleware" -ItemType Directory -Force | Out-Null
}

# Apply database fixes if not already done
if (-not (Test-Path -Path "./fix-applied.flag")) {
    Write-Host "Applying database fixes..." -ForegroundColor Yellow
    node apply-final-fixes.js
    node fix-all-tables.js
    # Create a flag file to indicate fixes have been applied
    "Fixes applied on $(Get-Date)" | Out-File -FilePath "./fix-applied.flag"
    Write-Host "Database fixes applied successfully" -ForegroundColor Green
} else {
    Write-Host "Database fixes already applied" -ForegroundColor Gray
}

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "node" -ArgumentList "./backend/src/server.js" -NoNewWindow
    Write-Host "Backend server started successfully" -ForegroundColor Green
    
    # Wait a moment for backend to initialize
    Start-Sleep -Seconds 3
    
    # Start the frontend development server if needed
    $startFrontend = Read-Host "Would you like to start the frontend server too? (y/n)"
    if ($startFrontend -eq "y") {
        Set-Location -Path "./frontend"
        npm start
    } else {
        Write-Host "Frontend server not started. You can start it manually when needed." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error starting servers: $_" -ForegroundColor Red
}
