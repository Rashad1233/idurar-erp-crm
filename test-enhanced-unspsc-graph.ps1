# Enhanced test script for UNSPSC category graph functionality
# Runs both the backend and frontend tests in sequence

Write-Host "`n==== Testing Enhanced UNSPSC Category Graph Functionality ====" -ForegroundColor Cyan

# Define paths
$frontendPath = Join-Path $PSScriptRoot "frontend"
$backendPath = Join-Path $PSScriptRoot "backend"
$testScript = Join-Path $PSScriptRoot "test-enhanced-unspsc-graph.js"

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Using Node.js $nodeVersion" -ForegroundColor Gray
} catch {
    Write-Host "Error: Node.js is not installed or not in the PATH" -ForegroundColor Red
    exit 1
}

# Check if test script exists
if (-not (Test-Path $testScript)) {
    Write-Host "Error: Test script not found: $testScript" -ForegroundColor Red
    exit 1
}

# Test 1: Verify backend API configuration
Write-Host "`n[Step 1] Checking backend API routes configuration" -ForegroundColor Blue

$routesPath = Join-Path $backendPath "routes\inventoryRoutes.js"
if (Test-Path $routesPath) {
    $routesContent = Get-Content $routesPath -Raw
    
    if ($routesContent -match "\/inventory\/reports\/unspsc-categories") {
        Write-Host "  ✅ Found UNSPSC categories endpoint in routes file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find UNSPSC categories endpoint in routes file" -ForegroundColor Red
    }
    
    if ($routesContent -match "getUnspscCategoryData") {
        Write-Host "  ✅ Found controller function reference in routes file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find controller function reference in routes file" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Routes file not found: $routesPath" -ForegroundColor Red
}

# Test 2: Verify controller implementation
Write-Host "`n[Step 2] Checking backend controller implementation" -ForegroundColor Blue

$controllerPath = Join-Path $backendPath "controllers\inventoryController.js"
if (Test-Path $controllerPath) {
    $controllerContent = Get-Content $controllerPath -Raw
    
    if ($controllerContent -match "exports\.getUnspscCategoryData\s*=") {
        Write-Host "  ✅ Found getUnspscCategoryData implementation in controller" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find getUnspscCategoryData implementation" -ForegroundColor Red
    }
    
    # Check for enhanced features in controller
    $enhancedFeatures = @(
        @{ Name = "Description field"; Pattern = "description\s*:" },
        @{ Name = "Sample items"; Pattern = "sampleItems" },
        @{ Name = "Average per item calculation"; Pattern = "avgPerItem" }
    )
    
    foreach ($feature in $enhancedFeatures) {
        if ($controllerContent -match $feature.Pattern) {
            Write-Host "  ✅ Found enhanced feature: $($feature.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Could not find enhanced feature: $($feature.Name)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ❌ Controller file not found: $controllerPath" -ForegroundColor Red
}

# Test 3: Verify frontend component
Write-Host "`n[Step 3] Checking frontend component implementation" -ForegroundColor Blue

$componentPath = Join-Path $frontendPath "src\pages\Inventory\EnhancedInventoryReporting.jsx"
if (Test-Path $componentPath) {
    $componentContent = Get-Content $componentPath -Raw
    
    if ($componentContent -match "renderUnspscCategoryChart\s*=\s*\(\)\s*=>") {
        Write-Host "  ✅ Found renderUnspscCategoryChart function" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Could not find renderUnspscCategoryChart function" -ForegroundColor Red
    }
    
    # Check for enhanced table features
    $enhancedTableFeatures = @(
        @{ Name = "UNSPSC table styles"; Pattern = "unspscTableStyles" },
        @{ Name = "Row selection"; Pattern = "rowSelection" },
        @{ Name = "Search/filter capability"; Pattern = "filterDropdown" },
        @{ Name = "Table pagination"; Pattern = "showSizeChanger" },
        @{ Name = "Select All button"; Pattern = "Select All" }
    )
    
    foreach ($feature in $enhancedTableFeatures) {
        if ($componentContent -match $feature.Pattern) {
            Write-Host "  ✅ Found enhanced table feature: $($feature.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Could not find enhanced table feature: $($feature.Name)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ❌ Component file not found: $componentPath" -ForegroundColor Red
}

# Test 4: Run the full test with Node.js
Write-Host "`n[Step 4] Running full test script" -ForegroundColor Blue
Write-Host "  This test requires the backend server to be running. Make sure it's started before running."

$runTest = Read-Host "  Do you want to run the full API test now? (y/n)"

if ($runTest -eq "y") {
    try {
        # Check if chalk package is installed
        $chalkInstalled = npm list chalk --silent
        if (-not $chalkInstalled) {
            Write-Host "  Installing chalk package for colored output..." -ForegroundColor Yellow
            npm install chalk --no-save
        }
        
        # Run the Node.js test script
        Write-Host "`n  Running test script..." -ForegroundColor Blue
        node $testScript
    } catch {
        Write-Host "  Error running test script: $_" -ForegroundColor Red
    }
} else {
    Write-Host "  Skipping full API test. You can run it later with: node $testScript" -ForegroundColor Yellow
}

Write-Host "`n==== Test Complete ====" -ForegroundColor Cyan
