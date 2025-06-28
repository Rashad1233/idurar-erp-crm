Write-Host "🔄 Restarting Backend Server to Load PR List Fix..." -ForegroundColor Cyan

# Find and kill existing backend process on port 8888
Write-Host "Stopping existing backend server..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 8888 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "✅ Backend server stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Navigate to backend directory and start server
Write-Host "Starting backend server with PR list fix..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test the API endpoint
Write-Host "`n📡 Testing PR API endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8888/api/purchase-requisition/list" -Method GET
    Write-Host "✅ API is working! Response:" -ForegroundColor Green
    Write-Host "Success: $($response.success)" -ForegroundColor White
    Write-Host "Result count: $($response.result.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ API test failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ Backend server restarted with PR list fix!" -ForegroundColor Green
Write-Host "You can now test the Purchase Order create page at http://localhost:3000/purchase-order/create" -ForegroundColor Cyan
