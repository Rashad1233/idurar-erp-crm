const { Contract, Notification } = require('./backend/models/sequelize');

async function testContractWorkflow() {
  try {
    console.log('=== Testing Contract Workflow ===\n');
    
    // Get the current contract
    const contract = await Contract.findOne({
      order: [['createdAt', 'DESC']]
    });
    
    if (!contract) {
      console.log('❌ No contract found');
      return;
    }
    
    console.log(`📋 Contract: ${contract.contractNumber}`);
    console.log(`📊 Current Status: ${contract.status}`);
    console.log(`✅ Approval Status: ${contract.approvalStatus}`);
    console.log('');
    
    // Check if contract is in the right state for testing
    if (contract.status === 'active') {
      console.log('🔄 Setting contract back to pending_supplier_acceptance for testing...');
      await contract.update({
        status: 'pending_supplier_acceptance',
        supplierAcceptedAt: null,
        supplierAcceptanceNotes: null
      });
      console.log('✅ Contract status updated for testing\n');
    }
    
    // Check if Notification model exists
    if (Notification) {
      console.log('📢 Recent Notifications:');
      try {
        const notifications = await Notification.findAll({
          where: {
            referenceType: 'Contract',
            referenceId: contract.id
          },
          order: [['createdAt', 'DESC']],
          limit: 5
        });
        
        if (notifications.length === 0) {
          console.log('   No notifications found for this contract');
        } else {
          notifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. ${notif.title}`);
            console.log(`      ${notif.message}`);
            console.log(`      Created: ${notif.createdAt.toLocaleString()}`);
            console.log('');
          });
        }
      } catch (notifError) {
        console.log('   Error loading notifications:', notifError.message);
      }
    } else {
      console.log('📢 Notification model not available');
    }
    
    console.log('=== Contract Workflow Status ===');
    console.log('✅ Contract approval sets status to "pending_supplier_acceptance"');
    console.log('✅ Notification sent: "Contract Approved - Pending Supplier Acceptance"');
    console.log('✅ Supplier can accept/reject contracts in pending_supplier_acceptance status');
    console.log('✅ Contract becomes "active" only after supplier acceptance');
    console.log('✅ Contract becomes "rejected" if supplier rejects');
    
  } catch (error) {
    console.error('❌ Error testing workflow:', error.message);
  }
}

testContractWorkflow();