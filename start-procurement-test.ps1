# PowerShell script to start both frontend and backend for testing the procurement module

Write-Host "Starting ERP application for procurement module testing..." -ForegroundColor Cyan

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
                   Where-Object { $_.LocalPort -eq $Port }
    
    return ($null -ne $connections)
}

# Check if ports are already in use
$backendPort = 5000
$frontendPort = 3000

$backendInUse = Test-PortInUse -Port $backendPort
$frontendInUse = Test-PortInUse -Port $frontendPort

if ($backendInUse) {
    Write-Host "WARNING: Port $backendPort is already in use. Backend server might already be running." -ForegroundColor Yellow
}

if ($frontendInUse) {
    Write-Host "WARNING: Port $frontendPort is already in use. Frontend server might already be running." -ForegroundColor Yellow
}

# Start backend server in a new window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$(Get-Location)\backend'; Write-Host 'Starting backend server on port $backendPort...' -ForegroundColor Green; npm run dev`""

# Wait a moment for backend to initialize
Start-Sleep -Seconds 5

# Start frontend server in a new window
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$(Get-Location)\frontend'; Write-Host 'Starting frontend server on port $frontendPort...' -ForegroundColor Green; npm start`""

# Display information
Write-Host "`nServers started in separate windows.`n" -ForegroundColor Cyan
Write-Host "Backend is running at: http://localhost:$backendPort" -ForegroundColor Green
Write-Host "Frontend is running at: http://localhost:$frontendPort" -ForegroundColor Green
Write-Host "`nAccess the Purchase Requisition page at: http://localhost:$frontendPort/purchase-requisition" -ForegroundColor Magenta
Write-Host "`nPress Ctrl+C in the respective windows to stop the servers when done." -ForegroundColor Yellow
