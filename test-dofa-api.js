const axios = require('axios');

async function testDofaAPI() {
  try {
    console.log('=== Testing DoFA Contracts Review API ===\n');
    
    // Test without authentication on both ports
    for (const port of [3000, 8888]) {
      console.log(`\nTesting port ${port}...`);
      try {
        const response = await axios.get(`http://localhost:${port}/api/dofa/contracts/review`);
        console.log(`✅ Success on port ${port}:`, response.data);
        console.log(`Found ${response.data.data?.length || 0} contracts`);
        
        if (response.data.data && response.data.data.length > 0) {
          console.log('\nContract details:');
          response.data.data.forEach((contract, index) => {
            console.log(`${index + 1}. ${contract.contractNumber}: ${contract.contractName}`);
            console.log(`   Status: ${contract.status}, Approval: ${contract.approvalStatus}`);
            console.log(`   Supplier: ${contract.supplier?.legalName}`);
          });
        }
        
      } catch (error) {
        console.log(`❌ Failed on port ${port}:`, error.response?.status, error.response?.data?.message || error.message);
      }
    }

    console.log('\n=== Testing getAllContracts endpoint ===');
    try {
      const response = await axios.get('http://localhost:3000/api/contracts');
      console.log('✅ getAllContracts Success:', response.data);
      console.log(`Found ${response.data.data?.length || 0} contracts`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\nAll contracts:');
        response.data.data.forEach((contract, index) => {
          console.log(`${index + 1}. ${contract.contractNumber}: ${contract.contractName}`);
          console.log(`   Status: ${contract.status}, Approval: ${contract.approvalStatus}`);
          console.log(`   Supplier: ${contract.supplier?.legalName}`);
        });
      }
      
    } catch (error) {
      console.log('❌ getAllContracts failed:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('Error in test:', error.message);
  }
}

testDofaAPI();
