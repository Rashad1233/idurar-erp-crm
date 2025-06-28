const { PurchaseRequisition, PurchaseRequisitionItem, sequelize } = require('./models/sequelize');

async function checkPRs() {
  try {
    console.log('🔍 Checking Purchase Requisitions...');
    
    // Get all PRs
    const prs = await PurchaseRequisition.findAll({
      attributes: [
        'id', 
        'prNumber', 
        'description', 
        'status', 
        'totalAmount', 
        'currency',
        'costCenter',
        'contractId',
        'requestorId',
        'approverId',
        'createdAt'
      ],
      order: [['id', 'ASC']]
    });
    
    console.log(`📋 Found ${prs.length} Purchase Requisitions:`);
    
    prs.forEach(pr => {
      console.log(`\n📄 PR: ${pr.prNumber}`);
      console.log(`   ID: ${pr.id}`);
      console.log(`   Description: ${pr.description}`);
      console.log(`   Status: ${pr.status}`);
      console.log(`   Total Amount: ${pr.totalAmount} ${pr.currency}`);
      console.log(`   Cost Center: ${pr.costCenter}`);
      console.log(`   Contract ID: ${pr.contractId || 'None'}`);
      console.log(`   Created: ${pr.createdAt}`);
    });
    
    // Check for approved PRs specifically
    const approvedPRs = await PurchaseRequisition.findAll({
      where: { status: 'approved' },
      attributes: ['id', 'prNumber', 'description', 'status', 'contractId'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`\n✅ Found ${approvedPRs.length} APPROVED PRs (eligible for RFQ):`);
    approvedPRs.forEach(pr => {
      console.log(`   - ${pr.prNumber}: ${pr.description} (Contract: ${pr.contractId ? 'Yes' : 'No'})`);
    });
    
    // Check PR items for approved PRs
    if (approvedPRs.length > 0) {
      console.log('\n📦 Checking items for approved PRs...');
      for (const pr of approvedPRs) {
        try {
          const items = await PurchaseRequisitionItem.findAll({
            where: { purchaseRequisitionId: pr.id },
            attributes: ['id', 'itemName', 'description', 'quantity', 'unitPrice', 'totalPrice']
          });
          console.log(`   ${pr.prNumber} has ${items.length} items:`);
          items.forEach(item => {
            console.log(`     - ${item.itemName}: ${item.quantity} @ ${item.unitPrice} = ${item.totalPrice}`);
          });
        } catch (err) {
          console.log(`     Error fetching items for ${pr.prNumber}: ${err.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking PRs:', error);
  } finally {
    await sequelize.close();
  }
}

checkPRs();