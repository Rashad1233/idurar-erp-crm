# Test script for inventory controller
param (
    [Parameter(Mandatory=$true)]
    [string]$AuthToken,
    
    [Parameter(Mandatory=$false)]
    [string]$ItemMasterId = "f6b28980-7a07-4315-99f9-5b3e8c051ae3"
)

Write-Host "Running inventory controller test..." -ForegroundColor Cyan
Write-Host "Using auth token: $($AuthToken.Substring(0, 10))..." -ForegroundColor Cyan
Write-Host "Using item master ID: $ItemMasterId" -ForegroundColor Cyan

# Execute the test script
node test-inventory-controller.js $AuthToken $ItemMasterId
