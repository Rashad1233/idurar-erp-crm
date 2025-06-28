# PowerShell script to restart backend with email functionality
Write-Host "===== Restarting Backend with Email Functionality =====" -ForegroundColor Green
Write-Host ""

Write-Host "Stopping any existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Starting backend with email functionality..." -ForegroundColor Yellow
Set-Location backend
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal

Write-Host ""
Write-Host "Backend restarted! The email functionality is now active." -ForegroundColor Green
Write-Host "Check the new window for backend logs." -ForegroundColor Green
Write-Host ""
Write-Host "You can now test email sending from the frontend!" -ForegroundColor Cyan
Read-Host "Press Enter to continue..."
