const { Contract, Notification } = require('./backend/models/sequelize');

async function testNotifications() {
  try {
    console.log('=== Testing Notifications with Correct Table Structure ===\n');
    
    // Get a contract for testing
    const contract = await Contract.findOne({
      order: [['createdAt', 'DESC']]
    });
    
    if (!contract) {
      console.log('❌ No contract found');
      return;
    }
    
    console.log(`📋 Testing with contract: ${contract.contractNumber}`);
    console.log(`📊 Contract ID: ${contract.id}`);
    console.log('');
    
    // Test creating a notification with the correct structure
    console.log('🔄 Creating test notification...');
    
    const testNotification = await Notification.create({
      itemId: contract.id,
      itemNumber: contract.contractNumber,
      shortDescription: 'Contract Approved - Pending Supplier Acceptance',
      notificationType: 'contract_approved',
      actionById: contract.createdById,
      actionAt: new Date(),
      message: `Contract ${contract.contractNumber} has been approved. Waiting for acceptance confirmation from the supplier. An email has been sent to the supplier for contract acceptance.`,
      isRead: false,
      originalItemData: {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        approvedBy: 'Test System',
        status: 'pending_supplier_acceptance'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Test notification created successfully!');
    console.log(`📬 Notification ID: ${testNotification.id}`);
    console.log(`📋 Item Number: ${testNotification.itemNumber}`);
    console.log(`📝 Message: ${testNotification.message}`);
    console.log('');
    
    // Get all notifications for this contract
    console.log('📢 All notifications for this contract:');
    const allNotifications = await Notification.findAll({
      where: { itemId: contract.id },
      order: [['createdAt', 'DESC']]
    });
    
    if (allNotifications.length === 0) {
      console.log('   No notifications found');
    } else {
      allNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.shortDescription}`);
        console.log(`      Type: ${notif.notificationType}`);
        console.log(`      Message: ${notif.message}`);
        console.log(`      Created: ${notif.createdAt.toLocaleString()}`);
        console.log(`      Read: ${notif.isRead ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    // Clean up test notification
    await testNotification.destroy();
    console.log('🧹 Test notification cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing notifications:', error.message);
    console.error('Error details:', error);
  }
}

testNotifications();