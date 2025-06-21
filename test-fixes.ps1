# Script to verify fixes to the item-master API endpoint

Write-Host "Running test to verify item-master API endpoint fixes..." -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Verify we fixed the path in the front-end service
Write-Host "`nChecking if all API URLs in inventoryService.js have been fixed..." -ForegroundColor Yellow

$serviceFile = "c:\Users\rasha\Desktop\test erp\frontend\src\services\inventoryService.js"
$content = Get-Content -Path $serviceFile -Raw

# Check for any remaining incorrect URL patterns
$incorrectUrls = @()
if ($content -match "axios\.get\('inventory/") { $incorrectUrls += "GET 'inventory/..." }
if ($content -match "axios\.get\(`inventory/") { $incorrectUrls += "GET `inventory/..." }
if ($content -match "axios\.post\('inventory/") { $incorrectUrls += "POST 'inventory/..." }
if ($content -match "axios\.put\(`inventory/") { $incorrectUrls += "PUT `inventory/..." }
if ($content -match "axios\.delete\(`inventory/") { $incorrectUrls += "DELETE `inventory/..." }
if ($content -match "axios\.get\('warehouse/") { $incorrectUrls += "GET 'warehouse/..." }
if ($content -match "axios\.get\(`warehouse/") { $incorrectUrls += "GET `warehouse/..." }

if ($incorrectUrls.Count -gt 0) {
    Write-Host "❌ Found $($incorrectUrls.Count) URLs missing leading slashes:" -ForegroundColor Red
    foreach ($url in $incorrectUrls) {
        Write-Host "  - $url" -ForegroundColor Red
    }
} else {
    Write-Host "✅ All API URLs have been fixed with proper leading slashes" -ForegroundColor Green
}

# 2. Check if the correct item-master URLs are being used
$correctItemMasterPaths = 0
if ($content -match "axios\.get\('/item-master") { $correctItemMasterPaths++ }
if ($content -match "axios\.post\('/item-master") { $correctItemMasterPaths++ }
if ($content -match "axios\.put\(`/item-master") { $correctItemMasterPaths++ }
if ($content -match "axios\.delete\(`/item-master") { $correctItemMasterPaths++ }

Write-Host "`nChecking if correct item-master paths are being used..." -ForegroundColor Yellow
if ($correctItemMasterPaths -ge 4) {
    Write-Host "✅ Found item-master paths with the correct format (/item-master)" -ForegroundColor Green
} else {
    Write-Host "❌ Some item-master paths may still be incorrect" -ForegroundColor Red
}

# 3. Provide summary information
Write-Host "`nSummary of fixes:" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan
Write-Host "1. Fixed URL format for item-master API calls" -ForegroundColor White
Write-Host "   - Changed from '/inventory/item-master' to '/item-master'" -ForegroundColor White
Write-Host "2. Added leading slashes to all API URLs" -ForegroundColor White
Write-Host "3. Fixed formatting issue in inventoryService.js" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan
Write-Host "1. Restart the frontend application to apply the changes" -ForegroundColor Yellow
Write-Host "2. Test the inventory page to ensure it loads correctly" -ForegroundColor Yellow
Write-Host "3. Verify that the table height and column spacing are adequate" -ForegroundColor Yellow

Write-Host "`nTo restart the frontend:" -ForegroundColor Magenta
Write-Host "cd 'c:\Users\rasha\Desktop\test erp\frontend' && npm run dev" -ForegroundColor White
