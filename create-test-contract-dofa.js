const { Contract, Supplier, User } = require('./backend/models/sequelize');

async function createTestContract() {
  try {
    console.log('=== Creating Test Contract for DoFA Review ===\n');
    
    // Find a supplier to use
    const supplier = await Supplier.findOne();
    if (!supplier) {
      console.log('❌ No supplier found. Creating one...');
      return;
    }
    
    // Find a user to use as creator
    const user = await User.findOne();
    
    // Create a new contract with pending approval status
    const contractData = {
      contractNumber: `CTR-2025-TEST-${Date.now()}`,
      contractName: 'Test Contract for DoFA Review',
      description: 'This is a test contract created to verify DoFA approval workflow',
      supplierId: supplier.id,
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
      totalValue: 15000.00,
      status: 'pending_approval',
      approvalStatus: 'pending',
      createdById: user?.id || supplier.id, // Use user ID or fallback to supplier ID
      updatedById: user?.id || supplier.id, // Add required updatedById field
      terms: 'Standard terms and conditions apply',
      deliveryTerms: 'FOB Destination',
      paymentTerms: 'Net 30 days'
    };
    
    const newContract = await Contract.create(contractData);
    
    console.log('✅ Created test contract:');
    console.log(`   ID: ${newContract.id}`);
    console.log(`   Contract Number: ${newContract.contractNumber}`);
    console.log(`   Name: ${newContract.contractName}`);
    console.log(`   Status: ${newContract.status}`);
    console.log(`   Approval Status: ${newContract.approvalStatus}`);
    console.log(`   Supplier: ${supplier.legalName}`);
    
    // Verify it shows up in the query
    console.log('\n=== Verifying contract appears in DoFA query ===');
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
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Query found ${pendingContracts.length} pending contracts`);
    pendingContracts.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.contractNumber}: ${contract.contractName}`);
      console.log(`   Status: ${contract.status}, Approval: ${contract.approvalStatus}`);
      console.log(`   Supplier: ${contract.supplier?.legalName}`);
    });

  } catch (error) {
    console.error('❌ Error creating test contract:', error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

createTestContract();
