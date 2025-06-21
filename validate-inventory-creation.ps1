# Run the inventory validation script with your current auth token

$authToken = Read-Host -Prompt "Enter your authentication token"
Write-Host "Running inventory validation script..."
node ./validate-inventory-creation.js $authToken

# Keep the window open for review
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
