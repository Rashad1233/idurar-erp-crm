# Start the ERP application for Android device access

Write-Host "Starting ERP application for Android device access..." -ForegroundColor Cyan
Write-Host "Your local IP address is 192.168.0.200" -ForegroundColor Green

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
$backendPort = 8888
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
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$(Get-Location)\backend'; Write-Host 'Starting backend server for Android access on 0.0.0.0:$backendPort...' -ForegroundColor Green; npm run dev`""

# Wait a moment for backend to initialize
Start-Sleep -Seconds 5

# Start frontend server with Android configuration
Write-Host "Starting frontend server for Android access..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$(Get-Location)\frontend'; Write-Host 'Starting frontend server with Android configuration...' -ForegroundColor Green; `$env:VITE_ANDROID_MODE='true'; npm run dev`""

# Display information
Write-Host "`nServers started in separate windows.`n" -ForegroundColor Cyan
Write-Host "Backend is running at: http://192.168.0.200:$backendPort" -ForegroundColor Green
Write-Host "Frontend is running at: http://192.168.0.200:$frontendPort" -ForegroundColor Green

Write-Host "`nOn your Android device:" -ForegroundColor Magenta
Write-Host "1. Make sure you're connected to the same WiFi network as this computer" -ForegroundColor Yellow
Write-Host "2. Open a web browser on your Android device" -ForegroundColor Yellow
Write-Host "3. Navigate to: http://192.168.0.200:$frontendPort" -ForegroundColor Yellow
Write-Host "`nFor the Purchase Requisition page, navigate to: http://192.168.0.200:$frontendPort/purchase-requisition" -ForegroundColor Magenta
Write-Host "`nPress Ctrl+C in the respective windows to stop the servers when done." -ForegroundColor Yellow
