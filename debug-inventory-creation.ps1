# Debug script for inventory creation
param (
    [Parameter(Mandatory=$true)]
    [string]$AuthToken,
    
    [Parameter(Mandatory=$false)]
    [string]$ItemMasterId = "f6b28980-7a07-4315-99f9-5b3e8c051ae3"
)

Write-Host "Running inventory creation debug script..." -ForegroundColor Cyan
Write-Host "Using auth token: $($AuthToken.Substring(0, 10))..." -ForegroundColor Cyan
Write-Host "Using item master ID: $ItemMasterId" -ForegroundColor Cyan

# Execute the debug script
node debug-inventory-creation.js $AuthToken $ItemMasterId
