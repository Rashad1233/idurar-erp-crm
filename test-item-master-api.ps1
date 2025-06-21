# Test Item Master API Connection
# This script tests the connection to the item master API endpoints

$ErrorActionPreference = "Stop"

Write-Host "🔍 Testing Item Master API Connection..." -ForegroundColor Cyan

# Check if backend is running
$backendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "server.js" }
if (-not $backendProcess) {
    Write-Host "⚠️ Warning: Backend server doesn't appear to be running!" -ForegroundColor Yellow
    $startBackend = Read-Host "Would you like to start the backend server? (y/n)"
    if ($startBackend -eq "y") {
        Start-Process powershell -ArgumentList "-File start-backend.ps1" -WorkingDirectory (Get-Location)
        Write-Host "Starting backend server, please wait 10 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

# Configuration
$apiBaseUrl = "http://localhost:8888/api"
$testItemMasterId = "" # Replace with a valid item master ID from your system
$authToken = "" # Replace with a valid authentication token
$testScript = @"
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load config
const configPath = path.join(__dirname, 'backend', 'config', 'config.js');
const config = require(configPath);

// Use the API URL from config
const API_URL = config.development.baseUrl || 'http://localhost:5000/api';

// Test function
async function testItemMasterAPI() {
    try {
        console.log('Testing item master API endpoints...');
        console.log(`API URL: ${API_URL}`);
        
        // Try to load a token from a saved session if available
        let token = null;
        try {
            if (fs.existsSync('./temp/auth-token.json')) {
                const tokenData = JSON.parse(fs.readFileSync('./temp/auth-token.json'));
                token = tokenData.token;
                console.log('Using saved auth token');
            }
        } catch (e) {
            console.log('No saved token found, will try without authentication');
        }
        
        // Setup headers
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            headers['x-auth-token'] = token;
        }
        
        // Test endpoints
        const endpoints = [
            '/inventory/item-master',
            '/inventory/item-master?limit=1',
            '/warehouse/storage-location'
        ];
        
        const results = {};
        
        for (const endpoint of endpoints) {
            console.log(`Testing ${endpoint}...`);
            try {
                const response = await axios.get(`${API_URL}${endpoint}`, { headers });
                results[endpoint] = {
                    status: response.status,
                    success: response.data.success,
                    dataCount: Array.isArray(response.data.data) ? response.data.data.length : 'N/A'
                };
                console.log(`✅ Success: Status ${response.status}, Items: ${results[endpoint].dataCount}`);
            } catch (error) {
                results[endpoint] = {
                    status: error.response?.status || 'Connection failed',
                    error: error.message,
                    details: error.response?.data || {}
                };
                console.log(`❌ Failed: ${error.message}`);
                if (error.response) {
                    console.log(`   Status: ${error.response.status}`);
                    console.log(`   Details:`, error.response.data);
                }
            }
        }
        
        console.log('\nSummary of results:');
        console.table(results);
        
        return results;
    } catch (error) {
        console.error('Test failed with error:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the test
testItemMasterAPI()
    .then(() => {
        console.log('\nTest completed.');
    })
    .catch(error => {
        console.error('Test script failed:', error);
    });
"@

# Save the test script to a temporary file
$testScriptPath = "./temp/test-item-master-api.js"
New-Item -Path "./temp" -ItemType Directory -Force | Out-Null
Set-Content -Path $testScriptPath -Value $testScript

# Run the script with Node.js
Write-Host "Executing test script..." -ForegroundColor Cyan
node $testScriptPath

Write-Host "`nTest completed. If you see any errors, verify:" -ForegroundColor Cyan
Write-Host "1. Backend server is running" -ForegroundColor White
Write-Host "2. Database connection is working" -ForegroundColor White
Write-Host "3. Item master data exists in the database" -ForegroundColor White

# Check if frontend is running - we'll need to test the UI connection separately
$frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "vite" }
if (-not $frontendProcess) {
    Write-Host "`n⚠️ Note: Frontend server doesn't appear to be running." -ForegroundColor Yellow
    Write-Host "To fully test the frontend integration, start the frontend server with 'start-frontend.ps1'" -ForegroundColor Yellow
}
