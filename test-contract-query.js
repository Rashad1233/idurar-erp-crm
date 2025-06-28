const { Contract, Supplier, User } = require('./backend/models/sequelize');

async function testAPI() {
  try {
    console.log('=== Testing Contract Query Logic ===\n');
    
    // Test 1: Check what getPendingContractApprovals logic finds
    const pendingContracts = await Contract.findAll({
      where: {
        status: 'pending_approval',
        approvalStatus: 'pending'
      },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${pendingContracts.length} contracts with status='pending_approval' AND approvalStatus='pending'`);
    
    if (pendingContracts.length > 0) {
      console.log('Contract details:');
      pendingContracts.forEach((contract, index) => {
        console.log(`${index + 1}. ID: ${contract.id}`);
        console.log(`   Contract Number: ${contract.contractNumber}`);
        console.log(`   Name: ${contract.contractName}`);
        console.log(`   Status: '${contract.status}'`);
        console.log(`   Approval Status: '${contract.approvalStatus}'`);
        console.log(`   Supplier: ${contract.supplier?.legalName}`);
        console.log(`   Created By: ${contract.createdBy?.name || 'No creator info'}`);
        console.log('');
      });
    } else {
      console.log('❌ No contracts found matching the query criteria\n');
      
      // Let's check what contracts exist
      const allContracts = await Contract.findAll({
        include: [
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['legalName']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      });
      
      console.log('Recent contracts in database:');
      allContracts.forEach((contract, index) => {
        console.log(`${index + 1}. ID: ${contract.id}`);
        console.log(`   Status: '${contract.status}'`);
        console.log(`   Approval Status: '${contract.approvalStatus}'`);
        console.log(`   Supplier: ${contract.supplier?.legalName}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

testAPI();
