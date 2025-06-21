// Script to test item creation API
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

// Test the item creation API
async function testItemCreation() {
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

    // Test data that matches the frontend form structure
    const testItemData = {
      shortDescription: 'Test Item',
      longDescription: 'This is a test item for API validation',
      standardDescription: 'Standard test description',
      manufacturerName: 'Test Manufacturer',
      manufacturerPartNumber: 'TEST-123',
      equipmentCategory: 'Electronics',
      equipmentSubCategory: 'Computer',
      unspscCodeId: null, // Will be null initially
      uom: 'Each',
      equipmentTag: 'TEST-TAG-001',
      serialNumber: 'N',
      criticality: 'NO',
      stockItem: 'N',
      plannedStock: 'N'
    };

    console.log('\n--- Testing Item Creation API ---');
    console.log('Sending data:', JSON.stringify(testItemData, null, 2));
    
    // Test POST /api/item
    console.log('\nTesting POST /api/item');
    const response = await api.post('/item', testItemData);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    console.log('\n--- Test completed successfully ---');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', error.response.headers);
    }
  }
}

// Run the test
testItemCreation();
