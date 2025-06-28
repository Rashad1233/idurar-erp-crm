const { Contract, Supplier, User } = require('./backend/models/sequelize');

async function createAndTestContract() {
  try {
    console.log('=== Creating Test Contract ===\n');
    
    // Find a supplier and user
    const supplier = await Supplier.findOne();
    const user = await User.findOne();
    
    if (!supplier) {
      console.log('❌ No supplier found');
      return;
    }
    
    // Create a new contract with pending approval status
    const contractData = {
      contractNumber: `CTR-2025-TEST-${Date.now()}`,
      contractName: 'Test Contract for DoFA Review',
      description: 'Test contract to verify DoFA approval workflow',
      supplierId: supplier.id,
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
      totalValue: 25000.00,
      status: 'pending_approval',
      approvalStatus: 'pending',
      createdById: user?.id || supplier.id,
      updatedById: user?.id || supplier.id,
      terms: 'Standard terms and conditions',
      deliveryTerms: 'FOB Destination',
      paymentTerms: 'Net 30 days'
    };
    
    const newContract = await Contract.create(contractData);
    
    console.log('✅ Created contract:');
    console.log(`   Contract Number: ${newContract.contractNumber}`);
    console.log(`   ID: ${newContract.id}`);
    console.log(`   Status: ${newContract.status}`);
    console.log(`   Approval Status: ${newContract.approvalStatus}`);
    console.log(`   Supplier: ${supplier.legalName}`);
    
    console.log('\n=== Testing DoFA Query ===');
    
    // Test the exact query used by the DoFA endpoint
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
    
    console.log(`Query found ${pendingContracts.length} pending contracts:`);
    pendingContracts.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.contractNumber}: ${contract.contractName}`);
      console.log(`   Status: ${contract.status}, Approval: ${contract.approvalStatus}`);
      console.log(`   Supplier: ${contract.supplier?.legalName}`);
      console.log(`   Created By: ${contract.createdBy?.name || 'Unknown'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

createAndTestContract();
