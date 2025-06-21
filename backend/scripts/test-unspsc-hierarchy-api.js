// Script to test the UNSPSC Hierarchy API
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

// Test the UNSPSC hierarchy API
async function testUnspscHierarchyAPI() {
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

    // Test endpoints
    console.log('\n--- Testing UNSPSC Hierarchy API ---');
    
    // 1. Get segments
    console.log('\nTesting GET /unspsc-hierarchy/by-level/SEGMENT');
    const segmentsResponse = await api.get('/unspsc-hierarchy/by-level/SEGMENT');
    console.log('Response status:', segmentsResponse.status);
    console.log('Response data:', segmentsResponse.data);

    // 2. Get global UNSPSC segments (fallback)
    console.log('\nTesting GET /unspsc/level/SEGMENT');
    const globalSegmentsResponse = await api.get('/unspsc/level/SEGMENT');
    console.log('Response status:', globalSegmentsResponse.status);
    console.log('Global segments count:', globalSegmentsResponse.data.length);
    console.log('First few global segments:', globalSegmentsResponse.data.slice(0, 3));

    // 3. Test saving a hierarchy entry
    console.log('\nTesting POST /unspsc-hierarchy');
    const testEntry = {
      unspscCode: '43000000',
      level: 'SEGMENT',
      title: 'Information Technology Broadcasting and Telecommunications',
      segment: '43'
    };
    const saveResponse = await api.post('/unspsc-hierarchy', testEntry);
    console.log('Response status:', saveResponse.status);
    console.log('Response data:', saveResponse.data);

    // 4. Check if the entry was saved
    console.log('\nVerifying the saved entry');
    const verifyResponse = await api.get('/unspsc-hierarchy/by-level/SEGMENT');
    console.log('Response status:', verifyResponse.status);
    console.log('Response data:', verifyResponse.data);

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
testUnspscHierarchyAPI();
