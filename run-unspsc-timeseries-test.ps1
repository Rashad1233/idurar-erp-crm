# PowerShell script to test UNSPSC time-series implementation
Write-Host "Running UNSPSC time-series implementation test script..." -ForegroundColor Cyan
Write-Host ""

# Change to the project directory
Set-Location $PSScriptRoot

# Run the test script
node .\test-unspsc-timeseries.js

# Pause to view results
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
