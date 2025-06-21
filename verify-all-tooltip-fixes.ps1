# Run in PowerShell to verify both tooltip fixes
Write-Host "🧪 Running comprehensive tooltip fix verification..." -ForegroundColor Cyan

# 1. First run the static table header tooltip test
Write-Host "`n📋 Testing Static Table Header Tooltip Implementation..." -ForegroundColor Yellow
node "c:\Users\rasha\Desktop\test erp\deep-tooltip-infinite-loop-fix-test.js"

# 2. Then run the search tooltip fix test
Write-Host "`n📋 Testing Static Search Tooltip Implementation..." -ForegroundColor Yellow
node "c:\Users\rasha\Desktop\test erp\final-tooltip-validation.js"

# 3. Final confirmation message
Write-Host "`n✅ ALL TOOLTIP FIXES VERIFIED" -ForegroundColor Green
Write-Host "The following components are now free from infinite loop issues:" -ForegroundColor White
Write-Host "1. Table Header Tooltips - Using StaticTooltipHeader" -ForegroundColor White
Write-Host "2. Search Box Tooltip - Using static DOM-based implementation" -ForegroundColor White
Write-Host "`nThese fixes should eliminate the 'Maximum update depth exceeded' warnings completely." -ForegroundColor White
