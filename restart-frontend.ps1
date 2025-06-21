# PowerShell script to restart the frontend
Write-Host "🔄 Restarting frontend with updated item master routes..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "frontend"

# Kill any running npm processes
try {
    Write-Host "🛑 Stopping any running npm processes..." -ForegroundColor Yellow
    Stop-Process -Name "npm" -ErrorAction SilentlyContinue
    Write-Host "✅ npm processes stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No npm processes found or could not stop them" -ForegroundColor Yellow
}

# Start the frontend
try {
    Write-Host "🚀 Starting frontend..." -ForegroundColor Cyan
    Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow
    Write-Host "✅ Frontend started" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start frontend: $_" -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location -Path ".."

Write-Host ""
Write-Host "✅✅✅ Frontend restarted successfully" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 You can now access:"
Write-Host "   - Item Master list: http://localhost:3000/item-master"
Write-Host "   - Item Create: http://localhost:3000/item/create-new-item-master"
Write-Host "   - Item View: http://localhost:3000/item-master/read/:id"
Write-Host "   - Item Edit: http://localhost:3000/item-master/update/:id"
Write-Host ""
Write-Host "📝 View, edit, and delete functionality should now work correctly."
Write-Host ""
