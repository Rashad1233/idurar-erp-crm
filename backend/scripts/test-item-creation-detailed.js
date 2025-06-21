// Script to test the Item Creation API in detail
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/sequelize');

// Helper function to generate a test token
async function generateTestToken() {
  try {
    // Find the admin user
    const user = await User.findOne({
      where: { email: 'admin@erp.com' }
    });

    if (!user) {
      console.error('Admin user not found');
      return null;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return token;
  } catch (error) {
    console.error('Error generating test token:', error);
    return null;
  }
}

// Test the Item Creation API
async function testItemCreationAPI() {
  try {
    // Generate a test token
    const token = await generateTestToken();
    
    if (!token) {
      console.error('Failed to generate test token');
      return;
    }

    console.log('Test token generated successfully');

    // Create axios instance with the token
    const api = axios.create({
      baseURL: `http://localhost:${process.env.PORT || 8888}/api`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n--- Testing Item Creation API ---');
      // Test data that matches what the frontend sends
    const testItemData = {
      shortDescription: 'Test Item',
      longDescription: 'This is a test item for validation',
      standardDescription: 'Standard test description',
      manufacturerName: 'Test Manufacturer',
      manufacturerPartNumber: 'TEST-123',
      equipmentCategory: 'ELECTRICAL',
      equipmentSubCategory: 'CABLES',
      unspscCodeId: null, // Fixed: null instead of empty string
      uom: 'EA',
      equipmentTag: 'TEST-TAG-001',
      serialNumber: 'N',
      criticality: 'NO',
      stockItem: 'N',
      plannedStock: 'N'
    };

    console.log('\nSending POST request to /item with data:');
    console.log(JSON.stringify(testItemData, null, 2));

    try {
      const response = await api.post('/item', testItemData);
      console.log('\n✅ SUCCESS!');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('\n❌ FAILED!');
      console.log('Error status:', error.response?.status);
      console.log('Error message:', error.response?.data);
      console.log('Full error:', error.message);
      
      if (error.response?.data) {
        console.log('\nDetailed error response:');
        console.log(JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n--- Test completed ---');
  } catch (error) {
    console.error('Test setup failed:', error);
  }
}

// Run the test
testItemCreationAPI();
