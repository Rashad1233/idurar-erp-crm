# Restart frontend after making table UI fixes
Write-Host "Restarting frontend after table UI fixes..." -ForegroundColor Green

# Check if npm processes are running and stop them
$npmProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -match "react|vite|webpack|frontend" }
if ($npmProcesses) {
    Write-Host "Stopping npm processes..." -ForegroundColor Yellow
    $npmProcesses | ForEach-Object { Stop-Process -Id $_.Id -Force }
    Start-Sleep -Seconds 2
}

# Navigate to frontend directory and start dev server
Write-Host "Starting frontend development server..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"

# Start the frontend server in a new window
Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow

Write-Host "Frontend restarted successfully!" -ForegroundColor Green
Write-Host "You can now verify the improved table layout at http://localhost:3000/inventory" -ForegroundColor Cyan
