# Enhanced AI Assistant Test Script
# Tests all the new AI features including comprehensive generation and supplier emails

Write-Host "🤖 Enhanced AI Assistant Test Suite" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if backend is running
Write-Host "`n🔍 Checking backend server status..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8888/api/test" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is not responding. Please start the backend first." -ForegroundColor Red
    Write-Host "Run: npm start or node src/index.js in the backend folder" -ForegroundColor Yellow
    exit 1
}

# Test comprehensive AI generation
Write-Host "`n🤖 Testing Comprehensive AI Generation..." -ForegroundColor Yellow

$testItems = @(
    @{ name = "Industrial Pump"; description = "Centrifugal pump for water transfer" },
    @{ name = "Ball Valve"; description = "Stainless steel ball valve for pipeline control" },
    @{ name = "Electric Motor"; description = "AC motor 5HP for industrial equipment" },
    @{ name = "Office Printer"; description = "Laser printer for office documents" }
)

foreach ($item in $testItems) {
    Write-Host "`n📝 Testing: $($item.name)" -ForegroundColor White
    
    try {
        $body = @{
            itemDescription = $item.description
            additionalInfo = @{
                manufacturer = ""
                category = ""
                specifications = ""
            }
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:8888/api/ai/generate-comprehensive-details" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "  ✅ Generation successful" -ForegroundColor Green
            Write-Host "  📋 Short: $($response.data.shortDescription)" -ForegroundColor Gray
            Write-Host "  🏭 Category: $($response.data.equipmentCategory)" -ForegroundColor Gray
            Write-Host "  🔍 UNSPSC: $($response.data.unspscSuggestion.code)" -ForegroundColor Gray
            Write-Host "  📦 UOM: $($response.data.recommendedUOM)" -ForegroundColor Gray
            Write-Host "  ⚠️ Criticality: $($response.data.criticalityLevel)" -ForegroundColor Gray
            Write-Host "  🏭 Manufacturers: $($response.data.manufacturerSuggestions -join ', ')" -ForegroundColor Gray
        } else {
            Write-Host "  ❌ Failed: $($response.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test supplier email generation
Write-Host "`n📧 Testing Supplier Email Generation..." -ForegroundColor Yellow

try {
    $emailBody = @{
        itemData = @{
            shortDescription = "PUMP, CENTRIFUGAL: Industrial water transfer"
            longDescription = "High-efficiency centrifugal pump for industrial applications"
            unspscCode = "40101702"
            manufacturerName = "Grundfos"
        }
        requestDetails = @{
            quantity = "5 units"
            urgency = "Standard"
            specialRequirements = "Explosion-proof rating required"
        }
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "http://localhost:8888/api/ai/generate-supplier-email" -Method POST -Body $emailBody -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Email generation successful" -ForegroundColor Green
        Write-Host "📧 Subject: $($response.data.subject)" -ForegroundColor Gray
        Write-Host "📝 Body length: $($response.data.body.Length) characters" -ForegroundColor Gray
        Write-Host "📎 Attachments: $($response.data.attachmentRequests -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test UNSPSC search
Write-Host "`n🔍 Testing Enhanced UNSPSC Search..." -ForegroundColor Yellow

$searchQueries = @("industrial pump", "ball valve", "electric motor")

foreach ($query in $searchQueries) {
    Write-Host "`n🔍 Searching: $query" -ForegroundColor White
    
    try {
        $searchBody = @{ query = $query } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:8888/api/unspsc/search" -Method POST -Body $searchBody -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "  ✅ Found $($response.results.Count) results" -ForegroundColor Green
            foreach ($result in $response.results | Select-Object -First 2) {
                Write-Host "    $($result.unspscCode) - $($result.fullTitle)" -ForegroundColor Gray
                Write-Host "    Confidence: $([math]::Round($result.confidence * 100))%" -ForegroundColor Gray
            }
        } else {
            Write-Host "  ❌ Failed: $($response.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Enhanced AI Assistant Test Suite Completed!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Instructions for using the AI assistant
Write-Host "`n📚 How to use the Enhanced AI Assistant:" -ForegroundColor Cyan
Write-Host "1. Navigate to the Item Master form in the frontend" -ForegroundColor White
Write-Host "2. Look for the 'Smart AI Assistant' section" -ForegroundColor White
Write-Host "3. Enter a simple item description (e.g., 'industrial pump')" -ForegroundColor White
Write-Host "4. Click 'Generate All Details' to get comprehensive information" -ForegroundColor White
Write-Host "5. Use the tabs to review and apply specific details:" -ForegroundColor White
Write-Host "   - Descriptions: Short, long, and standard descriptions" -ForegroundColor Gray
Write-Host "   - Classification: UNSPSC codes and categories" -ForegroundColor Gray
Write-Host "   - Manufacturers: Suggested manufacturers and part numbers" -ForegroundColor Gray
Write-Host "   - Suppliers & Specs: Suppliers, UOM, and criticality" -ForegroundColor Gray
Write-Host "6. Click 'Apply All' to populate the entire form" -ForegroundColor White
Write-Host "7. Click 'Generate Email' to create supplier RFQ emails" -ForegroundColor White
