const { Contract } = require('./backend/models/sequelize');

async function testApprovalNotification() {
  try {
    console.log('=== Testing Approval Notification ===\n');
    
    // Create a test contract in pending_approval status
    const testContract = await Contract.create({
      contractNumber: `TEST-${Date.now()}`,
      contractName: 'Test Contract for Approval Notification',
      supplierId: '1', // Assuming supplier ID 1 exists
      totalValue: 10000.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: 'pending_approval',
      approvalStatus: 'pending',
      createdById: '1' // Assuming user ID 1 exists
    });
    
    console.log(`📋 Created test contract: ${testContract.contractNumber}`);
    console.log(`📊 Status: ${testContract.status}`);
    console.log(`✅ Approval Status: ${testContract.approvalStatus}`);
    console.log('');
    
    // Now simulate approval using the backend API
    console.log('🔄 Testing contract approval notification...');
    
    // Make HTTP request to approve the contract
    const response = await fetch(`http://localhost:8888/api/contracts/update/${testContract.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You might need to adjust this
      },
      body: JSON.stringify({
        action: 'approve',
        comments: 'Approved for testing notification system'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Contract approval successful');
      console.log('📧 Notification should have been sent with message:');
      console.log('   "Contract approved. Waiting for acceptance confirmation from the supplier."');
    } else {
      console.log('❌ Contract approval failed:', await response.text());
    }
    
    // Clean up - delete the test contract
    await testContract.destroy();
    console.log('🧹 Test contract cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing approval notification:', error.message);
  }
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testApprovalNotification();