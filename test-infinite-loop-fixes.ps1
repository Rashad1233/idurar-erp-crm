# Start ERP Frontend with Infinite Loop Fix Verification
Write-Host "🚀 Starting ERP Frontend with Infinite Loop Fix Verification" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Navigate to the frontend directory
$frontendPath = Join-Path -Path $PSScriptRoot -ChildPath "frontend"
Write-Host "📂 Navigating to: $frontendPath" -ForegroundColor Yellow

if (Test-Path $frontendPath) {
    Set-Location -Path $frontendPath
    
    # Verify node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 node_modules not found, running npm install..." -ForegroundColor Yellow
        npm install
    }    # Copy the verification scripts to the public folder for easy access
    $scripts = @(
        "verify-pr-infinite-loop-fixes.js",
        "test-tooltip-fixes.js",
        "final-tooltip-fix-test.js",
        "comprehensive-tooltip-fix-test.js",
        "deep-tooltip-infinite-loop-fix-test.js",
        "ultimate-tooltip-fix-test.js"
    )
    
    $publicPath = Join-Path -Path $frontendPath -ChildPath "public"
    
    foreach ($script in $scripts) {
        $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath $script
        if (Test-Path $scriptPath) {
            Copy-Item -Path $scriptPath -Destination $publicPath -Force
            Write-Host "✅ Copied $script to public folder" -ForegroundColor Green
        } else {
            Write-Host "❌ Script not found at: $scriptPath" -ForegroundColor Red
        }
    }
    
    # Instructions for testing
    Write-Host "`n📋 TESTING INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "1. When the app loads, navigate to the Purchase Requisition page" -ForegroundColor White
    Write-Host "2. Open your browser's developer console (F12)" -ForegroundColor White
    Write-Host "3. Execute one of these scripts to test different aspects:" -ForegroundColor White
    Write-Host "   A. Load general verification tools:" -ForegroundColor White
    Write-Host "      fetch('/verify-pr-infinite-loop-fixes.js').then(r => r.text()).then(t => eval(t))" -ForegroundColor Yellow
    Write-Host "   B. Test tooltip specifically:" -ForegroundColor White
    Write-Host "      fetch('/test-tooltip-fixes.js').then(r => r.text()).then(t => eval(t))" -ForegroundColor Yellow    Write-Host "   D. Run comprehensive tooltip test (tests both search and table header tooltips):" -ForegroundColor White
    Write-Host "      fetch('/comprehensive-tooltip-fix-test.js').then(r => r.text()).then(t => eval(t))" -ForegroundColor Yellow
    Write-Host "   E. Run deep tooltip infinite loop test (thorough):" -ForegroundColor White
    Write-Host "      fetch('/deep-tooltip-infinite-loop-fix-test.js').then(r => r.text()).then(t => eval(t))" -ForegroundColor Yellow
    Write-Host "   F. Run ULTIMATE tooltip fix test (tests static implementation):" -ForegroundColor White
    Write-Host "      fetch('/ultimate-tooltip-fix-test.js').then(r => r.text()).then(t => eval(t))" -ForegroundColor Yellow
    Write-Host "4. Check the console for results and verification status" -ForegroundColor White
    
    # Start the frontend
    Write-Host "`n🚀 Starting frontend development server..." -ForegroundColor Green
    npm run dev
    
} else {
    Write-Host "❌ Frontend directory not found at: $frontendPath" -ForegroundColor Red
    Write-Host "Please make sure you're running this script from the root of the ERP project" -ForegroundColor Red
}
