# Update Inventory Routes with Fixed Storage and Bin Locations
Write-Host "Updating Inventory Routes with Fixed Storage and Bin Locations..." -ForegroundColor Green

# Copy the fixed version to the correct location
Copy-Item -Path "$PSScriptRoot\fix-inventory-locations.js" -Destination "$PSScriptRoot\backend\routes\simpleInventoryRoutes.js" -Force

# Restart backend server
Write-Host "Restarting backend server..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Navigate to backend directory and start server
Set-Location -Path "$PSScriptRoot\backend"
Start-Process -FilePath "node" -ArgumentList "src/index.js" -NoNewWindow

Write-Host "Backend server restarted with fixed inventory locations!" -ForegroundColor Green
Write-Host "You can now verify that storage and bin locations are correctly displayed at http://localhost:3000/inventory" -ForegroundColor Cyan
