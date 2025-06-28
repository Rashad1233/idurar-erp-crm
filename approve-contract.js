const axios = require('axios');

async function approveContract() {
  try {
    const contractId = '3ef90669-e905-411c-9063-cbc33c52d443';
    
    console.log('=== Approving Contract CTR-2025-809214 ===\n');
    
    // Test both ports to see which server has the endpoint
    for (const port of [3000, 8888]) {
      console.log(`Testing approval on port ${port}...`);
      try {
        const response = await axios.post(`http://localhost:${port}/api/dofa/contracts/${contractId}/approve`, {
          comments: 'Contract approved via API test - All requirements met'
        });
        
        console.log(`✅ SUCCESS on port ${port}:`, response.data);
        
        // Verify the contract was updated
        console.log('\nVerifying contract status...');
        const verifyResponse = await axios.get(`http://localhost:${port}/api/contracts/${contractId}`);
        if (verifyResponse.data.success) {
          const contract = verifyResponse.data.data;
          console.log('Updated contract status:', contract.status);
          console.log('Updated approval status:', contract.approvalStatus);
        }
        
        break; // Exit loop if successful
        
      } catch (error) {
        console.log(`❌ FAILED on port ${port}:`, 
          error.response?.status, 
          error.response?.data?.message || error.message
        );
      }
    }

  } catch (error) {
    console.error('Error in approval process:', error.message);
  }
}

approveContract();
