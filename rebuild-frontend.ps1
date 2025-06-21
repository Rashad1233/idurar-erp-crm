# Rebuild Frontend with Inventory Fixes
Write-Host "Rebuilding frontend with inventory fixes..." -ForegroundColor Cyan

Set-Location -Path .\frontend
Write-Host "Running npm install..." -ForegroundColor Yellow
npm install

Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

Write-Host "Frontend rebuild complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Please restart your frontend development server with:" -ForegroundColor Cyan
Write-Host "cd frontend" -ForegroundColor White
Write-Host "npm start" -ForegroundColor White
Write-Host ""
Write-Host "Then test the inventory page in the browser." -ForegroundColor Cyan

Read-Host -Prompt "Press Enter to continue"
