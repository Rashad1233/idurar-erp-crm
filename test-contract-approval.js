const axios = require('axios');

// First, create a test contract
async function createTestContract() {
  try {
    const createResponse = await axios.post('http://localhost:8888/api/contract', {
      contractName: 'Test Contract for Approval',
      supplierId: 1,
      contractType: 'purchase',
      currency: 'USD',
      totalValue: 5000,
      startDate: '2025-06-25',
      endDate: '2025-12-25',
      status: 'pending_approval',
      approvalStatus: 'pending',
      createdById: 1,
      updatedById: 1
    });
    
    console.log('✅ Contract created:', createResponse.data);
    return createResponse.data.data;
  } catch (error) {
    console.error('❌ Error creating contract:', error.response?.data || error.message);
    return null;
  }
}

// Test the approve endpoint
async function testApproveContract(contractId) {
  try {
    const approveResponse = await axios.post(`http://localhost:8888/api/dofa/contracts/${contractId}/approve`, {
      action: 'approve',
      comments: 'Test approval comment'
    });
    
    console.log('✅ Contract approved:', approveResponse.data);
  } catch (error) {
    console.error('❌ Error approving contract:', error.response?.data || error.message);
  }
}

// Test the reject endpoint
async function testRejectContract(contractId) {
  try {
    const rejectResponse = await axios.post(`http://localhost:8888/api/dofa/contracts/${contractId}/reject`, {
      action: 'reject',
      comments: 'Test rejection comment',
      reason: 'Testing rejection workflow'
    });
    
    console.log('✅ Contract rejected:', rejectResponse.data);
  } catch (error) {
    console.error('❌ Error rejecting contract:', error.response?.data || error.message);
  }
}

// Main test function
async function runTest() {
  console.log('🧪 Testing Contract Approval Workflow...');
  
  // Create a test contract
  const contract = await createTestContract();
  if (!contract) {
    console.log('❌ Failed to create test contract, stopping test');
    return;
  }
  
  console.log(`📋 Created contract with ID: ${contract.id}`);
  
  // Test approval (comment out one of these)
  await testApproveContract(contract.id);
  // await testRejectContract(contract.id);
}

runTest();
