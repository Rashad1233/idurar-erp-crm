// Test script for frontend inventory service to verify it uses simple-inventory route
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Base URL for the API
const API_URL = 'http://localhost:8888/api';

// Function to test the frontend fix
async function testFrontendInventoryFix() {
  console.log('=============================================');
  console.log('TESTING FRONTEND INVENTORY SERVICE FIX');
  console.log('=============================================');
  
  // Check service file for simple-inventory route
  console.log('\n1. Checking inventory service for simple-inventory route...');
  const serviceFilePath = path.join(__dirname, 'frontend', 'src', 'services', 'inventoryService.js');
  
  try {
    const serviceContent = fs.readFileSync(serviceFilePath, 'utf8');
    if (serviceContent.includes('/simple-inventory')) {
      console.log('✅ Frontend service contains simple-inventory route reference');
    } else {
      console.log('❌ Frontend service does NOT contain simple-inventory route');
      console.log('   Please update the frontend/src/services/inventoryService.js file');
    }
  } catch (error) {
    console.error('❌ Error reading service file:', error.message);
  }
  
  // Test backend routes
  console.log('\n2. Testing backend routes...');
  
  // Test simple-inventory route
  try {
    const simpleResponse = await axios.get(`${API_URL}/simple-inventory`);
    console.log(`✅ Simple inventory route returns ${simpleResponse.data.data.length} items`);
  } catch (error) {
    console.error('❌ Simple inventory route failed:', error.message);
  }
  
  // Test regular inventory route
  try {
    const inventoryResponse = await axios.get(`${API_URL}/inventory`);
    console.log(`✅ Regular inventory route returns ${inventoryResponse.data.data.length} items`);
  } catch (error) {
    console.log('ℹ️ Regular inventory route failed (expected if only simple route works)');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n3. Next steps:');
  console.log('   1. Make sure the frontend is rebuilt with the updated service');
  console.log('   2. Restart the frontend dev server');
  console.log('   3. Test the inventory page in the browser');
  console.log('\n4. How to rebuild the frontend:');
  console.log('   cd frontend');
  console.log('   npm run build');
  console.log('\n5. How to restart the frontend:');
  console.log('   cd frontend');
  console.log('   npm start');
}

// Run the test
testFrontendInventoryFix().catch(console.error);
