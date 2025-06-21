# Script to test the inventory creation fix

$authToken = Read-Host -Prompt "Enter your authentication token"

# First, run the validation script to test different field combinations
Write-Host "Running validation tests to identify working combinations..." -ForegroundColor Cyan
node ./validate-inventory-creation.js $authToken

# After seeing results, prompt user to test with the test-inventory-creation script
Write-Host "`nDo you want to test with our standard test script? (y/n)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'y') {
    Write-Host "Running standard inventory creation test..." -ForegroundColor Cyan
    
    # Optionally get item master ID
    Write-Host "Do you want to provide a specific item master ID? (y/n)" -ForegroundColor Yellow
    $useCustomId = Read-Host
    
    if ($useCustomId -eq 'y') {
        $itemMasterId = Read-Host -Prompt "Enter item master ID"
        node ./test-inventory-creation.js $authToken $itemMasterId
    } else {
        node ./test-inventory-creation.js $authToken
    }
}

# Keep the window open
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
