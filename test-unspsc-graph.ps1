# Test UNSPSC Category Graph Integration

Write-Host "Testing UNSPSC Category Graph Integration" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Step 1: Verify the backend controller function
Write-Host "`nStep 1: Verifying backend controller function..." -ForegroundColor Yellow

$controllerPath = ".\backend\controllers\inventoryController.js"
$routesPath = ".\backend\routes\inventoryRoutes.js"

if (Test-Path $controllerPath) {
    $controllerContent = Get-Content $controllerPath -Raw
    if ($controllerContent -match "exports.getUnspscCategoryData\s*=\s*async") {
        Write-Host "  ✅ Found getUnspscCategoryData function in controller" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find getUnspscCategoryData function in controller" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Could not find controller file: $controllerPath" -ForegroundColor Red
}

if (Test-Path $routesPath) {
    $routesContent = Get-Content $routesPath -Raw
    if ($routesContent -match "\/inventory\/reports\/unspsc-categories") {
        Write-Host "  ✅ Found UNSPSC categories route in routes file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find UNSPSC categories route in routes file" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Could not find routes file: $routesPath" -ForegroundColor Red
}

# Step 2: Verify the frontend service function
Write-Host "`nStep 2: Verifying frontend service function..." -ForegroundColor Yellow

$servicePath = ".\frontend\src\services\inventoryService.js"

if (Test-Path $servicePath) {
    $serviceContent = Get-Content $servicePath -Raw
    if ($serviceContent -match "getUnspscCategoryInventoryData\s*:\s*async") {
        Write-Host "  ✅ Found getUnspscCategoryInventoryData function in service file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find getUnspscCategoryInventoryData function in service file" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Could not find service file: $servicePath" -ForegroundColor Red
}

# Step 3: Verify the frontend component
Write-Host "`nStep 3: Verifying frontend component..." -ForegroundColor Yellow

$componentPath = ".\frontend\src\pages\Inventory\EnhancedInventoryReporting.jsx"

if (Test-Path $componentPath) {
    $componentContent = Get-Content $componentPath -Raw
    
    # Check for UNSPSC data state and loading function
    $hasUnspscState = $componentContent -match "\[unspscCategoryData,\s*setUnspscCategoryData\]\s*=\s*useState"
    $hasLoadFunction = $componentContent -match "loadUnspscCategoryData\s*=\s*async"
    
    if ($hasUnspscState) {
        Write-Host "  ✅ Found UNSPSC category data state" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find UNSPSC category data state" -ForegroundColor Red
    }
    
    if ($hasLoadFunction) {
        Write-Host "  ✅ Found loadUnspscCategoryData function" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find loadUnspscCategoryData function" -ForegroundColor Red
    }
    
    # Check for rendering function
    if ($componentContent -match "renderUnspscCategoryChart\s*=\s*\(\)\s*=>") {
        Write-Host "  ✅ Found renderUnspscCategoryChart function" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find renderUnspscCategoryChart function" -ForegroundColor Red
    }
    
    # Check for integration in trends tab
    if ($componentContent -match "Inventory by UNSPSC Category" -and 
        $componentContent -match "Inventory Trends Over Time") {
        Write-Host "  ✅ Found UNSPSC category chart in trends tab" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not confirm UNSPSC category chart is in trends tab" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Could not find component file: $componentPath" -ForegroundColor Red
}

Write-Host "`nVerification Complete" -ForegroundColor Cyan
Write-Host "`nTo test the actual functionality:"
Write-Host "1. Start the backend:    .\start-backend.ps1"
Write-Host "2. Start the frontend:   .\start-frontend.ps1"
Write-Host "3. Navigate to the Inventory Reporting page and check the Trends tab"
