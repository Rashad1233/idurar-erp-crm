# PROCUREMENT MODULE - VALIDATION RUNNER
# This script helps run the complete procurement validation test

Write-Host "🚀 PROCUREMENT MODULE - FINAL VALIDATION" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js to run validation." -ForegroundColor Red
    exit 1
}

# Check if backend server is running
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8888/api" -Method Get -TimeoutSec 5
    if ($response.message -eq "ERP API is running") {
        Write-Host "✅ Backend server is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend server response unexpected" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend server not running on port 8888" -ForegroundColor Red
    Write-Host "💡 Please start the backend server first:" -ForegroundColor Yellow
    Write-Host "   cd backend && npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 BEFORE RUNNING VALIDATION:" -ForegroundColor Yellow
Write-Host "1. Make sure you are logged into the frontend application" -ForegroundColor White
Write-Host "2. Open browser DevTools (F12)" -ForegroundColor White
Write-Host "3. Go to Application -> Local Storage" -ForegroundColor White
Write-Host "4. Find the JWT token and copy it" -ForegroundColor White
Write-Host "5. Open procurement-final-validation.js and replace 'YOUR_JWT_TOKEN_HERE'" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Have you updated the JWT token in the validation script? (y/n)"

if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "❌ Please update the JWT token first, then run this script again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🧪 Starting procurement validation tests..." -ForegroundColor Cyan

# Run the validation
try {
    node procurement-final-validation.js
    
    if (Test-Path "procurement-validation-results.json") {
        Write-Host ""
        Write-Host "📊 Validation results saved to: procurement-validation-results.json" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error running validation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Validation complete! Check the output above for results." -ForegroundColor Green
