# Test script for inventory lastUpdatedById fix

# Get the auth token from the user
$authToken = Read-Host -Prompt "Enter your authentication token"

# Get the item master ID from the user
$itemMasterId = Read-Host -Prompt "Enter a valid item master ID"

Write-Host "Running inventory lastUpdatedById fix test..." -ForegroundColor Cyan

# Update the test script with the provided values
$testScriptPath = "c:\Users\rasha\Desktop\test erp\backend\test-inventory-lastUpdatedById-fix.js"
$testScriptContent = Get-Content -Path $testScriptPath -Raw
$testScriptContent = $testScriptContent -replace "const authToken = 'YOUR_AUTH_TOKEN_HERE';", "const authToken = '$authToken';"
$testScriptContent = $testScriptContent -replace "itemMasterId: 'YOUR_TEST_ITEM_MASTER_ID',", "itemMasterId: '$itemMasterId',"
$testScriptContent | Set-Content -Path $testScriptPath

# Run the test script
Write-Host "Executing test script..." -ForegroundColor Yellow
node $testScriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nTest execution completed!" -ForegroundColor Green
} else {
    Write-Host "`nTest execution encountered errors. Check the output above for details." -ForegroundColor Red
}

# Restore original test script content
$testScriptContent = $testScriptContent -replace "const authToken = '$authToken';", "const authToken = 'YOUR_AUTH_TOKEN_HERE';"
$testScriptContent = $testScriptContent -replace "itemMasterId: '$itemMasterId',", "itemMasterId: 'YOUR_TEST_ITEM_MASTER_ID',"
$testScriptContent | Set-Content -Path $testScriptPath

Write-Host "`nTest script has been restored to its original state." -ForegroundColor Gray
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
