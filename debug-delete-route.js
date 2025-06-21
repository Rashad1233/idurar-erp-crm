const express = require('express');
const axios = require('axios');

console.log('🔍 DEBUG: Testing DELETE route registration and accessibility');

// Test 1: Check if routes are properly loaded
console.log('\n1. Loading inventory routes...');
try {
  const inventoryRoutes = require('./backend/routes/inventoryRoutes.js');
  console.log('✅ Inventory routes loaded successfully');
  
  // Check if the routes export is a function (router)
  console.log('Route export type:', typeof inventoryRoutes);
  
  // Try to get the router stack
  if (inventoryRoutes && inventoryRoutes.stack) {
    console.log('Route stack length:', inventoryRoutes.stack.length);
    
    // Log all registered routes
    inventoryRoutes.stack.forEach((layer, index) => {
      if (layer.route) {
        console.log(`Route ${index}: ${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
      }
    });
  }
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// Test 2: Check if the deleteInventory function exists
console.log('\n2. Checking deleteInventory function...');
try {
  const inventoryController = require('./backend/controllers/inventoryController.js');
  console.log('Delete function exists:', typeof inventoryController.deleteInventory);
  console.log('Available controller functions:', Object.keys(inventoryController));
} catch (error) {
  console.error('❌ Error loading controller:', error.message);
}

// Test 3: Test direct API calls
console.log('\n3. Testing API endpoints...');

async function testApiEndpoints() {
  const baseUrl = 'http://localhost:8888/api';
  
  try {
    // Test basic API endpoint
    console.log('Testing basic API endpoint...');
    const basicResponse = await axios.get(`${baseUrl}/`);
    console.log('✅ Basic API response:', basicResponse.data);
    
    // Test inventory GET endpoint
    console.log('Testing inventory GET endpoint...');
    const getResponse = await axios.get(`${baseUrl}/inventory`);
    console.log('✅ Inventory GET response:', {
      success: getResponse.data.success,
      itemCount: getResponse.data.data ? getResponse.data.data.length : 0
    });
    
    // Test if we have any inventory items to work with
    if (getResponse.data.data && getResponse.data.data.length > 0) {
      const testItem = getResponse.data.data[0];
      console.log('Test item ID:', testItem.id);
      
      // Test DELETE endpoint with OPTIONS first
      console.log('Testing DELETE endpoint with OPTIONS...');
      try {
        const optionsResponse = await axios.options(`${baseUrl}/inventory/${testItem.id}`);
        console.log('✅ OPTIONS response:', optionsResponse.status);
      } catch (optError) {
        console.log('❌ OPTIONS failed:', optError.response?.status || optError.message);
      }
      
      // Test DELETE endpoint (this should work or give us better error info)
      console.log('Testing DELETE endpoint...');
      try {
        const deleteResponse = await axios.delete(`${baseUrl}/inventory/${testItem.id}`, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU',
            'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU'
          }
        });
        console.log('✅ DELETE response:', deleteResponse.status, deleteResponse.data);
      } catch (deleteError) {
        console.log('❌ DELETE failed:', {
          status: deleteError.response?.status,
          data: deleteError.response?.data,
          message: deleteError.message
        });
      }
    } else {
      console.log('❌ No inventory items found to test DELETE');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testApiEndpoints();
