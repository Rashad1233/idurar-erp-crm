// Test script to verify the UNSPSC code lookup endpoint
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User } = require('../models/sequelize');

// Helper function to generate a test token
async function generateTestToken() {
  try {
    const user = await User.findOne({
      where: { email: 'admin@erp.com' }
    });

    if (!user) {
      console.error('Admin user not found');
      return null;
    }

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

async function testUnspscCodeLookup() {
  try {
    const token = await generateTestToken();
    
    if (!token) {
      console.error('Failed to generate test token');
      return;
    }

    const api = axios.create({
      baseURL: `http://localhost:${process.env.PORT || 8888}/api`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Test the new code lookup endpoint
    console.log('\n--- Testing UNSPSC Code Lookup ---');
    
    // Test with a known code
    const testCode = '51161500';
    console.log(`\nTesting GET /unspsc/code/${testCode}`);
    
    const response = await api.get(`/unspsc/code/${testCode}`);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Test with another code
    const testCode2 = '31151700';
    console.log(`\nTesting GET /unspsc/code/${testCode2}`);
    
    const response2 = await api.get(`/unspsc/code/${testCode2}`);
    console.log('Response status:', response2.status);
    console.log('Response data:', JSON.stringify(response2.data, null, 2));
    
    // Test with non-existent code
    const nonExistentCode = '99999999';
    console.log(`\nTesting GET /unspsc/code/${nonExistentCode} (should return 404)`);
    
    try {
      const response3 = await api.get(`/unspsc/code/${nonExistentCode}`);
      console.log('Unexpected success:', response3.status);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Expected 404 error:', error.response.data.message);
      } else {
        console.error('Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n--- Test completed ---');
  } catch (error) {
    console.error('Test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testUnspscCodeLookup();
