
# Restart backend after UNSPSC fix
Write-Host "🔄 Stopping existing backend process..."
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        $_ | Stop-Process -Force
        Write-Host "Stopped process with ID: $($_.Id)"
    }
}

Write-Host "⌛ Waiting for processes to fully terminate..."
Start-Sleep -Seconds 2

Write-Host "🚀 Starting backend server..."
cd "$PSScriptRoot/backend"
Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow

Write-Host "✅ Backend server restarted"
Write-Host "🌐 You can now access the application at http://localhost:3000"
