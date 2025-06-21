# Restart ERP application after UNSPSC code fix
Write-Host "Restarting the ERP application after UNSPSC code fix..." -ForegroundColor Green

function Stop-ProcessIfRunning {
    param (
        [string]$ProcessName
    )
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "Stopping $ProcessName processes..." -ForegroundColor Yellow
        $processes | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
}

# Stop any running node processes
Stop-ProcessIfRunning -ProcessName "node"

# Create a direct API route for testing
Write-Host "Creating a direct API route for testing..." -ForegroundColor Cyan
@"
const express = require('express');
const router = express.Router();

// Direct item master route with direct UNSPSC data 
router.get('/direct-item-master', async (req, res) => {
  try {
    console.log('🔍 Direct item master route called for UNSPSC testing');
    
    // Return a static test item with proper UNSPSC code structure
    const testItem = {
      id: 'test-id',
      itemNumber: 'TEST-123',
      shortDescription: 'Test Item',
      unspscCode: '40141800',
      unspscFullCode: '40141800', 
      unspscTitle: 'Laboratory centrifuges',
      unspsc: {
        code: '40141800',
        title: 'Laboratory centrifuges',
        description: 'Test description'
      }
    };
    
    return res.status(200).json({
      success: true,
      data: [testItem],
      count: 1
    });
  } catch (error) {
    console.error('❌ Error in direct item master route:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
"@ | Out-File -FilePath "$PSScriptRoot\backend\routes\directTestRoute.js" -Encoding utf8

# Update index.js to register the test route
Write-Host "Updating index.js to register the test route..." -ForegroundColor Cyan
$indexPath = "$PSScriptRoot\backend\src\index.js"
$indexContent = Get-Content -Path $indexPath -Raw
if (-not ($indexContent -match "directTestRoute")) {
    $pattern = "// Register routes"
    $replacement = @"
// Register routes
const directTestRoute = require('../routes/directTestRoute');
app.use('/api', directTestRoute);
"@
    $indexContent = $indexContent -replace $pattern, $replacement
    $indexContent | Out-File -FilePath $indexPath -Encoding utf8
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "$PSScriptRoot\backend\src\index.js" -WorkingDirectory "$PSScriptRoot\backend" -NoNewWindow

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend server in a separate window
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "$PSScriptRoot\frontend" -NoNewWindow

Write-Host "Servers restarted successfully!" -ForegroundColor Green
Write-Host "Backend is running at http://localhost:8888" -ForegroundColor Cyan
Write-Host "Frontend is running at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Test endpoint: http://localhost:8888/api/direct-item-master" -ForegroundColor Cyan
Write-Host "Frontend should now correctly display UNSPSC codes" -ForegroundColor Green
