const { Contract, Supplier } = require('./backend/models/sequelize');

async function checkAllContracts() {
  try {
    const allContracts = await Contract.findAll({
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['legalName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`=== All ${allContracts.length} contracts in database ===\n`);
    
    allContracts.forEach((contract, index) => {
      console.log(`${index + 1}. Contract Number: ${contract.contractNumber}`);
      console.log(`   ID: ${contract.id}`);
      console.log(`   Name: ${contract.contractName}`);
      console.log(`   Status: '${contract.status}'`);
      console.log(`   Approval Status: '${contract.approvalStatus}'`);
      console.log(`   Supplier: ${contract.supplier?.legalName}`);
      console.log(`   Created: ${contract.createdAt}`);
      console.log('');
    });

    // Check for the specific contract shown in screenshot
    const specificContract = allContracts.find(c => c.contractNumber === 'CTR-2025-830120');
    if (specificContract) {
      console.log('=== Contract CTR-2025-830120 (from screenshot) ===');
      console.log(`Status: '${specificContract.status}'`);
      console.log(`Approval Status: '${specificContract.approvalStatus}'`);
      console.log(`Should appear in DoFA review? ${specificContract.status === 'pending_approval' && specificContract.approvalStatus === 'pending' ? 'YES' : 'NO'}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkAllContracts();
