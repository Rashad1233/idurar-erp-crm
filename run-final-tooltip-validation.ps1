# Final Validation Script for Infinite Loop Fixes
# June 10, 2025

Write-Host "🚀 Running Final Validation for React Infinite Loop Fix" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Check if we're in the right directory
$currentDir = (Get-Location).Path
$rootDir = Join-Path -Path $currentDir -ChildPath "test erp"
$frontendDir = Join-Path -Path $currentDir -ChildPath "frontend"

if (-not (Test-Path $frontendDir)) {
    $frontendDir = Join-Path -Path $currentDir -ChildPath "test erp\frontend"
    if (-not (Test-Path $frontendDir)) {
        Write-Host "❌ Could not find frontend directory. Make sure you're running this from the project root." -ForegroundColor Red
        exit 1
    }
}

# Ensure validation scripts are in the right place
$validationScripts = @(
    "final-validation-tooltip-infinite-loop-fix.js",
    "final-tooltip-fix-test.js",
    "verify-pr-infinite-loop-fixes.js"
)

# Ensure public directory exists
$publicDir = Join-Path -Path $frontendDir -ChildPath "public"
if (-not (Test-Path $publicDir)) {
    Write-Host "Creating public directory in frontend..." -ForegroundColor Yellow
    New-Item -Path $publicDir -ItemType Directory -Force | Out-Null
}

# Copy validation scripts to public directory
foreach ($script in $validationScripts) {
    $scriptPath = Join-Path -Path $currentDir -ChildPath $script
    if (Test-Path $scriptPath) {
        Copy-Item -Path $scriptPath -Destination $publicDir -Force
        Write-Host "✓ Copied $script to public folder" -ForegroundColor Green
    } else {
        # Try alternate path
        $scriptPath = Join-Path -Path $currentDir -ChildPath "test erp\$script"
        if (Test-Path $scriptPath) {
            Copy-Item -Path $scriptPath -Destination $publicDir -Force
            Write-Host "✓ Copied $script to public folder" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Warning: Could not find $script" -ForegroundColor Yellow
        }
    }
}

# Write documentation to console
Write-Host "`n📋 TESTING INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "1. When the app starts, navigate to Purchase Requisition page" -ForegroundColor White
Write-Host "2. Open your browser's developer console (F12)" -ForegroundColor White
Write-Host "3. Run one of these validation scripts:" -ForegroundColor White
Write-Host "   A. Comprehensive validation:" -ForegroundColor White
Write-Host "      fetch('/final-validation-tooltip-infinite-loop-fix.js').then(r => r.text()).then(t => eval(t))" -ForegroundColor Yellow
Write-Host "   B. Quick tooltip test:" -ForegroundColor White  
Write-Host "      fetch('/final-tooltip-fix-test.js').then(r => r.text()).then(t => eval(t))" -ForegroundColor Yellow
Write-Host "   C. Full verification suite:" -ForegroundColor White
Write-Host "      fetch('/verify-pr-infinite-loop-fixes.js').then(r => r.text()).then(t => eval(t))" -ForegroundColor Yellow
Write-Host "      FixVerifier.verifyAllFixes()" -ForegroundColor Yellow
Write-Host "4. The validation scripts will run automatically and report results in the console" -ForegroundColor White
Write-Host "5. Look for ✅ SUCCESS or ❌ FAILURE messages in the console output" -ForegroundColor White

# Check which node modules are installed
Set-Location -Path $frontendDir
$hasNodeModules = Test-Path (Join-Path -Path $frontendDir -ChildPath "node_modules")

if (-not $hasNodeModules) {
    Write-Host "`n📦 Installing node modules for frontend..." -ForegroundColor Yellow
    npm install
}

# Start the frontend
Write-Host "`n🚀 Starting frontend development server..." -ForegroundColor Green
npm run dev
