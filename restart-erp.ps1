# Restart Backend and Frontend Script

Write-Host "🔄 Restarting the ERP backend and frontend services..." -ForegroundColor Yellow

# Kill any existing Node.js processes that might be running the backend
Write-Host "🛑 Stopping any existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for the processes to terminate
Start-Sleep -Seconds 2

# Change to backend directory and start the server
Write-Host "🚀 Starting the backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\rasha\Desktop\test erp\backend'; npm start"

# Wait for the backend to initialize
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start the frontend in a new terminal
Write-Host "🚀 Starting the frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\rasha\Desktop\test erp\frontend'; npm start"

# Give the user instructions
Write-Host "`n✅ Services restarted successfully!" -ForegroundColor Green
Write-Host "`nInstructions:" -ForegroundColor Cyan
Write-Host "1. Access the application at http://localhost:3000" -ForegroundColor Cyan
Write-Host "2. Navigate to the Item Master section" -ForegroundColor Cyan
Write-Host "3. Click on the 'Create New (Fixed Form)' button" -ForegroundColor Cyan
Write-Host "4. Fill out the form and submit it" -ForegroundColor Cyan
Write-Host "`nAPI endpoints available:" -ForegroundColor Cyan
Write-Host "- /api/direct-item-create - Main direct creation endpoint" -ForegroundColor Cyan
Write-Host "- /api/item-direct-create - Backup direct creation endpoint" -ForegroundColor Cyan
