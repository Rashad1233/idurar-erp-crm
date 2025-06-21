# Restart the ERP system with the new routes applied
Write-Host "💥 Restarting ERP backend..." -ForegroundColor Cyan

# Check if there are existing node processes running
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "🛑 Stopping existing Node.js processes..." -ForegroundColor Yellow
    Stop-Process -Name node -Force
    Start-Sleep -Seconds 2
}

# Start backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Start-Process -NoNewWindow powershell -ArgumentList "-Command cd '$PSScriptRoot\backend' ; npm start"

Write-Host "⏱️ Waiting for backend to initialize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "✅ Backend server restarted successfully!" -ForegroundColor Green
Write-Host "🌐 Try the new register-item-master.html form to create items" -ForegroundColor Cyan
