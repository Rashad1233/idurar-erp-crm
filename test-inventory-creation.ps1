# Test script for inventory creation
param (
    [Parameter(Mandatory=$true)]
    [string]$AuthToken,
    
    [Parameter(Mandatory=$true)]
    [string]$ItemMasterId
)

Write-Host "Running inventory creation test..."
Write-Host "Using auth token: $AuthToken"
Write-Host "Using item master ID: $ItemMasterId"

# Execute the test script
node test-inventory-creation.js $AuthToken $ItemMasterId

if ($LASTEXITCODE -eq 0) {
    Write-Host "Test completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Test failed. Please check the output for details." -ForegroundColor Red
}
