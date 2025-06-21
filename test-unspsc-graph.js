/**
 * Test script to verify UNSPSC category graph functionality
 * 
 * This script tests:
 * 1. The backend API endpoint for UNSPSC categories
 * 2. The frontend service function for fetching UNSPSC category data
 * 3. The rendering of UNSPSC category data in the trends tab
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const API_ENDPOINT = '/inventory/reports/unspsc-categories';
const TOKEN = process.env.ERP_TEST_TOKEN; // Set this as an environment variable or replace with a valid token

async function testUnspscCategoryEndpoint() {
  console.log('Testing UNSPSC Category API Endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'x-auth-token': TOKEN
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data Sample:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
    if (response.data && response.data.success) {
      console.log('✅ API endpoint returned success');
      console.log(`✅ Found ${response.data.data.length} UNSPSC categories`);
      
      // Save sample data for verification
      const sampleData = response.data;
      fs.writeFileSync(
        path.join(__dirname, 'unspsc-categories-sample.json'), 
        JSON.stringify(sampleData, null, 2)
      );
      console.log('✅ Saved sample data to unspsc-categories-sample.json');
    } else {
      console.error('❌ API endpoint returned failure');
    }
  } catch (error) {
    console.error('❌ Error testing UNSPSC category endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function checkFrontendService() {
  console.log('\nChecking frontend service file for UNSPSC category function...');
  
  const servicePath = path.join(__dirname, 'frontend', 'src', 'services', 'inventoryService.js');
  
  try {
    const fileContent = fs.readFileSync(servicePath, 'utf8');
    
    if (fileContent.includes('getUnspscCategoryInventoryData')) {
      console.log('✅ Found getUnspscCategoryInventoryData function in inventoryService.js');
    } else {
      console.error('❌ Could not find getUnspscCategoryInventoryData function');
    }
    
    if (fileContent.includes('/inventory/reports/unspsc-categories')) {
      console.log('✅ Service is using the correct API endpoint');
    } else {
      console.error('❌ Service is not using the correct API endpoint');
    }
  } catch (error) {
    console.error('❌ Error checking frontend service file:', error.message);
  }
}

async function checkRendererFunction() {
  console.log('\nChecking frontend renderer for UNSPSC category chart...');
  
  const componentPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Inventory', 'EnhancedInventoryReporting.jsx');
  
  try {
    const fileContent = fs.readFileSync(componentPath, 'utf8');
    
    if (fileContent.includes('renderUnspscCategoryChart')) {
      console.log('✅ Found renderUnspscCategoryChart function in EnhancedInventoryReporting.jsx');
    } else {
      console.error('❌ Could not find renderUnspscCategoryChart function');
    }
    
    if (fileContent.includes('Inventory by UNSPSC Category')) {
      console.log('✅ Found UNSPSC category title in component');
    } else {
      console.error('❌ Could not find UNSPSC category title');
    }
    
    // Check if UNSPSC chart is integrated in the trends tab
    if (fileContent.includes('<h3>{translate(\'Inventory Trends Over Time\')}</h3>') && 
        fileContent.includes('<h3>{translate(\'Inventory by UNSPSC Category\')}</h3>')) {
      console.log('✅ UNSPSC category chart is integrated in the trends tab');
    } else {
      console.error('❌ UNSPSC category chart might not be integrated in the trends tab');
    }
  } catch (error) {
    console.error('❌ Error checking frontend component file:', error.message);
  }
}

async function runTests() {
  console.log('==== Testing UNSPSC Category Graph Functionality ====\n');
  
  console.log('Step 1: Verifying backend API...');
  await testUnspscCategoryEndpoint();
  
  console.log('\nStep 2: Verifying frontend service...');
  await checkFrontendService();
  
  console.log('\nStep 3: Verifying frontend component...');
  await checkRendererFunction();
  
  console.log('\n==== Test Complete ====');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
