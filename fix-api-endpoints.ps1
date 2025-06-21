# Comprehensive API Endpoints Fix Script

Write-Host "🚀 Starting comprehensive API endpoint fixes..." -ForegroundColor Cyan

# Step 1: Make sure the compatibility layer is in place
Write-Host "Step 1: Ensuring compatibility layer is properly implemented..." -ForegroundColor Yellow
node ./create-compatibility-layer.js

# Step 2: Fix model naming conventions
Write-Host "Step 2: Fixing model naming conventions..." -ForegroundColor Yellow
node ./fix-model-naming.js

# Step 3: Fix controllers
Write-Host "Step 3: Fixing controllers..." -ForegroundColor Yellow
node ./fix-controllers.js

# Step 4: Fix database tables
Write-Host "Step 4: Fixing database tables..." -ForegroundColor Yellow
node ./fix-all-tables.js

# Step 5: Restart the server
Write-Host "Step 5: Restarting the server..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
cd ./backend
npm start &

Write-Host "✅ All fixes have been applied. The server should now be restarting." -ForegroundColor Green
Write-Host "Please test the API endpoints to verify they are working correctly." -ForegroundColor Green
