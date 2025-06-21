# Final Comprehensive Fix Script

Write-Host "🚀 Starting final comprehensive ERP system fixes..." -ForegroundColor Cyan

# Step 1: Install any missing dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install dotenv cors express helmet morgan pg pg-hstore sequelize bcrypt jsonwebtoken

# Step 2: Apply comprehensive compatibility middleware
Write-Host "Step 2: Applying comprehensive compatibility middleware..." -ForegroundColor Yellow
# (Already done by creating the middleware file)

# Step 3: Fix controller model references
Write-Host "Step 3: Fixing controller model references..." -ForegroundColor Yellow
node ./fix-controller-model-references.js

# Step 4: Fix any remaining table issues
Write-Host "Step 4: Fixing any remaining table issues..." -ForegroundColor Yellow
node ./fix-all-tables.js

# Step 5: Restart the server
Write-Host "Step 5: Restarting the server..." -ForegroundColor Yellow
$nodePids = Get-Process -Name "node" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id
if ($nodePids) {
    $nodePids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "Stopped existing Node.js processes"
}
Start-Sleep -Seconds 2

Write-Host "Starting backend server..." -ForegroundColor Yellow
Set-Location -Path "./backend"
Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow

Write-Host "✅ All fixes have been applied. The server should now be restarting." -ForegroundColor Green
Write-Host "✅ Please test the API endpoints to verify they are working correctly." -ForegroundColor Green
Write-Host "✅ If issues persist, check the server logs for detailed error messages." -ForegroundColor Green
