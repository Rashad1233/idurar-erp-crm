# Simple script to start the standalone inventory server and open the HTML form

# Start the server in a new terminal window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\rasha\Desktop\test erp'; node standalone-inventory-server.js"

# Wait for the server to start up
Start-Sleep -Seconds 3

# Open the HTML form in the default browser
Start-Process "C:\Users\rasha\Desktop\test erp\simple-inventory.html"

Write-Host "✅ Started the standalone inventory server and opened the HTML form"
Write-Host "Server is running on port 5555"
Write-Host "You can create and view inventory items directly without using the complex ERP system"
