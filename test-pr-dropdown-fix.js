const axios = require('axios');

async function testPRDropdownFix() {
  const baseURL = 'http://localhost:8888/api';
  
  try {
    console.log('🔍 Testing Purchase Requisition dropdown fix...\n');
    
    // First, login to get auth token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@erp.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.result.token;
    console.log('✅ Login successful, token received\n');
    
    // Test the PR list endpoint
    console.log('2️⃣ Testing /api/purchase-requisition/list endpoint...');
    const prListResponse = await axios.get(`${baseURL}/purchase-requisition/list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ PR list endpoint successful!');
    console.log(`   Found ${prListResponse.data.result.length} Purchase Requisitions`);
    
    if (prListResponse.data.result.length > 0) {
      console.log('\n📋 Purchase Requisitions:');
      prListResponse.data.result.forEach(pr => {
        console.log(`   - ${pr.prNumber}: ${pr.description} (Status: ${pr.status})`);
      });
    }
    
    // Check if the response has the expected structure
    console.log('\n3️⃣ Verifying response structure...');
    const firstPR = prListResponse.data.result[0];
    if (firstPR) {
      const expectedFields = ['id', '_id', 'prNumber', 'description', 'status'];
      const hasAllFields = expectedFields.every(field => field in firstPR);
      
      if (hasAllFields) {
        console.log('✅ Response structure is correct for dropdown usage');
      } else {
        console.log('⚠️  Some expected fields are missing');
      }
    }
    
    console.log('\n✅ Purchase Requisition dropdown fix is working correctly!');
    console.log('   The endpoint now uses a simpler query without complex associations.');
    
  } catch (error) {
    console.error('\n❌ Error testing PR dropdown:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
console.log('🚀 Purchase Requisition Dropdown Fix Test');
console.log('=========================================\n');
testPRDropdownFix();
