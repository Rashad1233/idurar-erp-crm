const { Contract, Supplier } = require('./backend/models/sequelize');

async function checkContracts() {
  try {
    const contracts = await Contract.findAll({
      include: [{ model: Supplier, as: 'supplier', attributes: ['legalName'] }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    console.log('Recent contracts:');
    contracts.forEach(contract => {
      console.log(`ID: ${contract.id}, Status: '${contract.status}', Approval Status: '${contract.approvalStatus}', Supplier: ${contract.supplier?.legalName}`);
    });
    
    // Check specifically for pending approval contracts
    const pendingContracts = await Contract.findAll({
      where: {
        status: 'pending_approval',
        approvalStatus: 'pending'
      },
      include: [{ model: Supplier, as: 'supplier', attributes: ['legalName'] }]
    });
    
    console.log(`\nContracts with status='pending_approval' AND approvalStatus='pending': ${pendingContracts.length}`);
    pendingContracts.forEach(contract => {
      console.log(`- ID: ${contract.id}, Supplier: ${contract.supplier?.legalName}`);
    });
    
    // Check for PENDING_APPROVAL status (case mismatch)
    const pendingContractsUpperCase = await Contract.findAll({
      where: {
        status: 'PENDING_APPROVAL'
      },
      include: [{ model: Supplier, as: 'supplier', attributes: ['legalName'] }]
    });
    
    console.log(`\nContracts with status='PENDING_APPROVAL': ${pendingContractsUpperCase.length}`);
    pendingContractsUpperCase.forEach(contract => {
      console.log(`- ID: ${contract.id}, Status: '${contract.status}', ApprovalStatus: '${contract.approvalStatus}', Supplier: ${contract.supplier?.legalName}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkContracts();
