# PowerShell script to restart the backend server
Write-Host "🔄 Restarting ERP system with updated item master functionality..." -ForegroundColor Cyan

# Kill any running Node.js processes
try {
    Write-Host "🛑 Stopping any running Node.js processes..." -ForegroundColor Yellow
    Stop-Process -Name "node" -ErrorAction SilentlyContinue
    Write-Host "✅ Node processes stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No Node.js processes found or could not stop them" -ForegroundColor Yellow
}

# Wait a moment to ensure processes are fully terminated
Start-Sleep -Seconds 2

# Start the backend server
try {
    Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
    Start-Process -FilePath "node" -ArgumentList "backend/src/server.js" -NoNewWindow
    Write-Host "✅ Backend server started" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start backend server: $_" -ForegroundColor Red
    exit 1
}

# Wait for backend to initialize
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅✅✅ ERP system restarted successfully" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 You can now access:"
Write-Host "   - Item Master list: http://localhost:3000/item-master"
Write-Host "   - Item Master Create: http://localhost:3000/item/create-new-item-master"
Write-Host ""
Write-Host "📝 You can now view, edit, and delete items from the item master list."
Write-Host ""
