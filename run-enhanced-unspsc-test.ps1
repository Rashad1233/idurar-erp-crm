# Start and test the enhanced UNSPSC graph implementation

# Define paths
$frontendPath = Join-Path $PSScriptRoot "frontend"
$backendPath = Join-Path $PSScriptRoot "backend"
$testScript = Join-Path $PSScriptRoot "test-enhanced-unspsc-graph.js"

# Function to check if a process is running
function Test-ProcessRunning($processName) {
    $process = Get-Process -Name $processName -ErrorAction SilentlyContinue
    return $null -ne $process
}

Write-Host "`n==== Enhanced UNSPSC Graph Test Runner ====" -ForegroundColor Cyan

# Step 1: Start backend if not already running
Write-Host "`n[Step 1] Checking backend server status" -ForegroundColor Blue
$backendRunning = Test-ProcessRunning "node"

if ($backendRunning) {
    Write-Host "  Backend server appears to be running" -ForegroundColor Green
} else {
    Write-Host "  Starting backend server..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell" -ArgumentList "-ExecutionPolicy Bypass -File ./start-backend.ps1" -WindowStyle Normal
    
    # Wait for backend to start
    Write-Host "  Waiting for backend server to start (10 seconds)..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
}

# Step 2: Start frontend if not already running
Write-Host "`n[Step 2] Checking frontend server status" -ForegroundColor Blue
$frontendRunning = Test-ProcessRunning "npm"

if ($frontendRunning) {
    Write-Host "  Frontend server appears to be running" -ForegroundColor Green
} else {
    Write-Host "  Starting frontend server..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell" -ArgumentList "-ExecutionPolicy Bypass -File ./start-frontend.ps1" -WindowStyle Normal
    
    # Wait for frontend to start
    Write-Host "  Waiting for frontend server to start (10 seconds)..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
}

# Step 3: Run our test script
Write-Host "`n[Step 3] Running UNSPSC category graph test" -ForegroundColor Blue

$runTest = Read-Host "  Ready to run the UNSPSC graph test? (y/n)"

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
    Write-Host "  Skipping API test. You can run it later with: node $testScript" -ForegroundColor Yellow
}

# Step 4: Open the application in browser
Write-Host "`n[Step 4] Opening application in browser" -ForegroundColor Blue
$openBrowser = Read-Host "  Do you want to open the application in browser to test manually? (y/n)"

if ($openBrowser -eq "y") {
    Start-Process "http://localhost:3000/admin/inventory/enhanced-reporting"
    Write-Host "  Browser opened. Navigate to the Trends tab to see the UNSPSC category graph." -ForegroundColor Green
    Write-Host "  Look for the 'Inventory by UNSPSC Category' section in the Trends tab." -ForegroundColor Green
}

Write-Host "`n==== Test Runner Complete ====" -ForegroundColor Cyan
Write-Host "  Manual verification recommended:" -ForegroundColor Yellow
Write-Host "  1. Check UNSPSC table has advanced filtering and selection options" -ForegroundColor Yellow
Write-Host "  2. Verify selected categories update the chart visualization" -ForegroundColor Yellow
Write-Host "  3. Test the 'Select All', 'Clear All', and prefix selection options" -ForegroundColor Yellow
