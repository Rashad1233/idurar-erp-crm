$ErrorActionPreference = "Stop"

Write-Host "Starting enhanced UNSPSC test..." -ForegroundColor Green

# Function to check if a node process is running on a specific port
function Test-PortInUse($port) {
    $result = netstat -ano | findstr ":$port "
    return $null -ne $result
}

# First, check if backend is running
Write-Host "Checking if backend server is running..." -ForegroundColor Cyan
$backendRunning = Test-PortInUse 3000

if (-not $backendRunning) {
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -File ./start-backend.ps1" -WindowStyle Normal
    
    # Wait for backend to start
    Write-Host "Waiting for backend server to start (15 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
} else {
    Write-Host "Backend server is already running" -ForegroundColor Green
}

# Try to open the UNSPSC enhanced search page in the browser
Write-Host "Opening UNSPSC enhanced search page..." -ForegroundColor Cyan
Start-Process "http://localhost:3000/unspsc-enhanced-search"

Write-Host "Testing AI-powered UNSPSC search..." -ForegroundColor Cyan
Write-Host "1. Enter a product description in the search box (e.g., 'laptop computer')" -ForegroundColor Yellow
Write-Host "2. View the search results with complete hierarchical information" -ForegroundColor Yellow
Write-Host "3. Click on a result to view detailed information" -ForegroundColor Yellow
Write-Host "4. Try adding a code to favorites" -ForegroundColor Yellow
Write-Host "5. Navigate to Item Master and click on a UNSPSC code" -ForegroundColor Yellow

Write-Host "Enhanced UNSPSC implementation test complete!" -ForegroundColor Green
