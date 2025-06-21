Write-Host "Opening UNSPSC Enhanced Search..." -ForegroundColor Cyan

# Check if server is running
$serverRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet

if (-not $serverRunning) {
    Write-Host "Starting backend server first..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -File ./start-backend.ps1" -WindowStyle Normal
    
    # Wait for server to start
    Write-Host "Waiting for server to start (15 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

# Open UNSPSC search in browser
Start-Process "http://localhost:3000/unspsc-enhanced-search"

Write-Host "UNSPSC Enhanced Search page opened!" -ForegroundColor Green
