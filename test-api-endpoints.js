const axios = require('axios');

async function testDofaAPI() {
  try {
    console.log('=== Testing DoFA API Endpoint ===\n');
    
    // Test the DoFA contracts review endpoint on both ports
    for (const port of [3000, 8888]) {
      console.log(`Testing port ${port}...`);
      try {
        const response = await axios.get(`http://localhost:${port}/api/dofa/contracts/review`);
        
        console.log(`✅ Port ${port} response:`, response.data);
        console.log(`Found ${response.data.data?.length || 0} contracts`);
        
        if (response.data.data && response.data.data.length > 0) {
          console.log('Contract details:');
          response.data.data.forEach((contract, index) => {
            console.log(`${index + 1}. ${contract.contractNumber}: ${contract.contractName}`);
            console.log(`   Status: ${contract.status}, Approval: ${contract.approvalStatus}`);
            console.log(`   Supplier: ${contract.supplier?.legalName}`);
          });
        } else {
          console.log('❌ No contracts returned from API');
        }
        
      } catch (error) {
        console.log(`❌ Failed on port ${port}:`, error.response?.status, error.response?.data?.message || error.message);
      }
      console.log('');
    }
    
    // Also test if the frontend configuration is correct
    console.log('=== Frontend Configuration Check ===');
    console.log('The frontend should be calling: http://localhost:3000/api/dofa/contracts/review');
    console.log('Make sure the frontend is pointing to the correct server port.');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDofaAPI();
