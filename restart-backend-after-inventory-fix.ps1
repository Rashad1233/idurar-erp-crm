# Restart backend server after inventory fix
Write-Host "Restarting backend server after inventory fix..." -ForegroundColor Green

# Stop any running node processes
Write-Host "Stopping any running node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot"

# Check if the simple routes are registered in the backend
Write-Host "Checking if simple routes are registered..." -ForegroundColor Cyan
$indexJsPath = "$PSScriptRoot\backend\src\index.js"
$indexContent = Get-Content $indexJsPath -Raw

$missingRoutes = @()
if (-not ($indexContent -match "simpleInventoryRoutes")) {
    $missingRoutes += "simpleInventoryRoutes"
}
if (-not ($indexContent -match "simpleWarehouseRoutes")) {
    $missingRoutes += "simpleWarehouseRoutes"
}
if (-not ($indexContent -match "simpleItemMasterRoutes")) {
    $missingRoutes += "simpleItemMasterRoutes"
}

if ($missingRoutes.Count -gt 0) {
    Write-Host "Missing routes found: $($missingRoutes -join ', ')" -ForegroundColor Red
    
    # Find where to insert the route registration code
    $insertPattern = "// Register routes"
    $insertPosition = $indexContent.IndexOf($insertPattern)
    
    if ($insertPosition -eq -1) {
        $insertPattern = "app.use('/api'"
        $insertPosition = $indexContent.IndexOf($insertPattern)
    }
    
    if ($insertPosition -ne -1) {
        $routeRegistrationCode = ""
        
        foreach ($route in $missingRoutes) {
            $routeName = $route.Replace("Routes", "")
            $routeRegistrationCode += @"

// Register $routeName routes
const $route = require('../routes/$route');
app.use('/api', $route);
console.log('✅ $routeName routes registered');

"@
        }
        
        $updatedContent = $indexContent.Insert($insertPosition, $routeRegistrationCode)
        Set-Content -Path $indexJsPath -Value $updatedContent
        Write-Host "✅ Added missing routes to index.js" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not find a suitable position to add route registrations" -ForegroundColor Red
    }
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\backend"
Start-Process -FilePath "node" -ArgumentList "src/index.js" -NoNewWindow

Write-Host "Backend server restarted successfully!" -ForegroundColor Green
Write-Host "You should now be able to access inventory at http://localhost:3000/inventory" -ForegroundColor Cyan
