# Script to restart ERP servers for Android access after configuration changes
Write-Host "Restarting ERP servers with Android configuration..." -ForegroundColor Cyan

# Kill existing processes on ports 3000 and 8888
Write-Host "Stopping existing servers..." -ForegroundColor Yellow

# Find and kill processes using port 3000
$port3000 = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq 3000 }
if ($port3000) {
    $processId3000 = $port3000.OwningProcess
    Write-Host "Stopping process on port 3000 (PID: $processId3000)" -ForegroundColor Yellow
    Stop-Process -Id $processId3000 -Force -ErrorAction SilentlyContinue
}

# Find and kill processes using port 8888
$port8888 = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq 8888 }
if ($port8888) {
    $processId8888 = $port8888.OwningProcess
    Write-Host "Stopping process on port 8888 (PID: $processId8888)" -ForegroundColor Yellow
    Stop-Process -Id $processId8888 -Force -ErrorAction SilentlyContinue
}

# Wait a moment for ports to be released
Start-Sleep -Seconds 3

# Start backend server in a new window
Write-Host "Starting backend server for network access..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$(Get-Location)\backend'; Write-Host 'Backend server starting on 0.0.0.0:8888...' -ForegroundColor Green; npm run dev`""

# Wait for backend to initialize
Start-Sleep -Seconds 5

# Start frontend server with Android configuration in a new window
Write-Host "Starting frontend server for network access..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$(Get-Location)\frontend'; Write-Host 'Frontend server starting on 0.0.0.0:3000...' -ForegroundColor Green; `$env:VITE_ANDROID_MODE='true'; npm run dev`""

# Display access information
Write-Host "`nServers restarted successfully!" -ForegroundColor Green
Write-Host "`nAccess URLs:" -ForegroundColor Cyan
Write-Host "Frontend: http://192.168.0.200:3000" -ForegroundColor Green
Write-Host "Backend:  http://192.168.0.200:8888" -ForegroundColor Green

Write-Host "`nAndroid Device Setup:" -ForegroundColor Magenta
Write-Host "1. Make sure your Android device is on the same WiFi network" -ForegroundColor Yellow
Write-Host "2. Open browser and go to: http://192.168.0.200:3000" -ForegroundColor Yellow
Write-Host "3. If you still can't access it, run 'setup-firewall-rules.ps1' as Administrator" -ForegroundColor Yellow
