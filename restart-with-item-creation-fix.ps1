# Restart ERP Backend Server With Item Creation Fix
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "🔄 Restarting ERP Backend Server with Item Creation Fix..." -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Kill any existing node processes
Write-Host "Stopping any running Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process nodemon -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for processes to terminate
Start-Sleep -Seconds 2

# Display summary of fixes
Write-Host "FIXED ISSUES:" -ForegroundColor Green
Write-Host "1. ✅ Fixed column_name 'description' does not exist in ItemMasters table" -ForegroundColor Green
Write-Host "2. ✅ Fixed foreign key constraint for createdById using a real user ID" -ForegroundColor Green
Write-Host "3. ✅ Added all missing columns from ItemMasters table schema" -ForegroundColor Green
Write-Host "4. ✅ Added reliable-item-route.js route for most robust item creation" -ForegroundColor Green
Write-Host "5. ✅ Created standalone HTML form for direct testing" -ForegroundColor Green
Write-Host ""
Write-Host "READY TO TEST WITH:" -ForegroundColor Cyan
Write-Host "• Standalone HTML Form: reliable-item-creation.html" -ForegroundColor White
Write-Host "• API Endpoint: http://localhost:8888/api/reliable-item-create" -ForegroundColor White
Write-Host ""

# Navigate to the backend directory
Set-Location -Path "$PSScriptRoot\backend"

Write-Host "Starting the backend server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host "======================================================="

# Start the server using nodemon
nodemon src/index.js
