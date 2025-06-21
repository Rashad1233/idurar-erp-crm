const axios = require('axios');

async function testUnspscEndpoints() {
  console.log('=== Testing UNSPSC Endpoints ===');
  
  const baseURL = 'http://localhost:3001/api';
  const code = '40141800';
  
  try {
    // Test 1: Direct database lookup
    console.log(`\n1. Testing GET /unspsc/code/${code}`);
    try {
      const response = await axios.get(`${baseURL}/unspsc/code/${code}`);
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Error:', error.response?.data || error.message);
    }
    
    // Test 2: Direct creation endpoint
    console.log(`\n2. Testing POST /unspsc/direct with input: ${code}`);
    try {
      const response = await axios.post(`${baseURL}/unspsc/direct`, { input: code });
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Error:', error.response?.data || error.message);
    }
    
    // Test 3: What we know exists in database
    const { UnspscCode } = require('./models/sequelize');
    const dbCode = await UnspscCode.findOne({ where: { code } });
    console.log(`\n3. Direct database lookup for code ${code}:`);
    console.log('Database result:', dbCode ? dbCode.toJSON() : 'NOT FOUND');
    
  } catch (error) {
    console.error('Error in test:', error);
  }
  
  process.exit(0);
}

testUnspscEndpoints();
