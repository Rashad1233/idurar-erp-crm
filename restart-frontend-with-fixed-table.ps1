# Restart frontend after fixing table styles
Write-Host "Restarting frontend to apply table style fixes..." -ForegroundColor Green

# Find and stop any running npm processes for the frontend
Write-Host "Stopping any running frontend processes..." -ForegroundColor Yellow
$processList = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*vite*" }
if ($processList) {
    $processList | ForEach-Object { Stop-Process -Id $_.Id -Force }
    Write-Host "Stopped frontend processes" -ForegroundColor Green
} else {
    Write-Host "No frontend processes found to stop" -ForegroundColor Yellow
}

# Wait a moment for processes to completely terminate
Start-Sleep -Seconds 2

# Start the frontend in a new window
Write-Host "Starting frontend..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\frontend"
Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow

Write-Host "Frontend restarted with fixed table styles!" -ForegroundColor Green
Write-Host "You can now check the table at http://localhost:3000/inventory" -ForegroundColor Cyan
