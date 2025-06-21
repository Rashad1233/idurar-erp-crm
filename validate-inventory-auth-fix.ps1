# Validate the inventory authentication fix
param (
    [Parameter(Mandatory=$true)]
    [string]$AuthToken,
    
    [Parameter(Mandatory=$true)]
    [string]$ItemMasterId
)

Write-Host "Running inventory authentication fix validation..."
Write-Host "Using auth token: $AuthToken"
Write-Host "Using item master ID: $ItemMasterId"

# Execute the validation script
node validate-inventory-auth-fix.js $AuthToken $ItemMasterId

if ($LASTEXITCODE -eq 0) {
    Write-Host "Validation completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Validation failed. Please check the output for details." -ForegroundColor Red
}
