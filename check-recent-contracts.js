const { Contract, Supplier } = require('./backend/models/sequelize');

async function checkAllContracts() {
  try {
    const contracts = await Contract.findAll({
      include: [{ model: Supplier, as: 'supplier', attributes: ['legalName'] }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`Found ${contracts.length} recent contracts:`);
    contracts.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.contractNumber}: ${contract.status}/${contract.approvalStatus} (${contract.supplier?.legalName})`);
    });
    
    // Look specifically for the contract number you mentioned
    const specificContract = contracts.find(c => c.contractNumber === 'CTR-2025-809214');
    if (specificContract) {
      console.log('\n✅ Found CTR-2025-809214:');
      console.log('Status:', specificContract.status);
      console.log('Approval Status:', specificContract.approvalStatus);
    } else {
      console.log('\n❌ CTR-2025-809214 not found in recent contracts');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkAllContracts();
