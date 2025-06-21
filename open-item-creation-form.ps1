# Open the reliable item creation HTML form
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "🌐 Opening the Reliable Item Creation HTML Form..." -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

# Get the path to the HTML file
$htmlPath = Join-Path -Path $PSScriptRoot -ChildPath "reliable-item-creation.html"

# Check if the file exists
if (Test-Path $htmlPath) {
    Write-Host "Opening $htmlPath in your default browser..." -ForegroundColor Green
    Start-Process $htmlPath
} else {
    Write-Host "Error: Could not find $htmlPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "NOTE: Make sure the backend server is running on port 8888" -ForegroundColor Yellow
Write-Host "You can start it with: ./restart-with-item-creation-fix.ps1" -ForegroundColor Yellow
