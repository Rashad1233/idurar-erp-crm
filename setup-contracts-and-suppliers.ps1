# Initialize Contract and Supplier Integration for Purchase Requisitions

Write-Host "Starting Contract and Supplier Integration for Purchase Requisitions" -ForegroundColor Cyan

# Step 1: Run the integration script to update routes and model relationships
Write-Host "`nStep 1: Updating routes and model relationships..." -ForegroundColor Yellow
node integrate-contract-pricing.js

# Step 2: Create sample contracts if suppliers and items exist
Write-Host "`nStep 2: Creating sample contracts..." -ForegroundColor Yellow
node add-sample-contracts.js

# Step 3: Enhance existing purchase requisitions with contract prices
Write-Host "`nStep 3: Enhancing purchase requisitions with contract pricing..." -ForegroundColor Yellow
node enhance-pr-with-contracts.js

Write-Host "`nContract and Supplier Integration completed!" -ForegroundColor Green
Write-Host "You can now view contract prices in the Purchase Requisition interface." -ForegroundColor Green
