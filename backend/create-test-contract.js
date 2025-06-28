// Test script to create a contract and submit it for approval
const { Contract, Supplier, User, sequelize } = require('./models/sequelize');

async function createTestContract() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find a supplier and user
    const supplier = await Supplier.findOne();
    const user = await User.findOne();

    if (!supplier || !user) {
      console.log('❌ Need at least one supplier and user in database');
      return;
    }

    console.log(`Found supplier: ${supplier.legalName}`);
    console.log(`Found user: ${user.name || user.email}`);

    // Create a test contract
    const contractData = {
      contractNumber: `TEST-CONTRACT-${Date.now()}`,
      contractName: 'Test Contract for Approval Workflow',
      description: 'This is a test contract created to test the approval workflow',
      supplierId: supplier.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: 'draft',
      currency: 'USD',
      totalValue: 50000.00,
      paymentTerms: '30 days',
      incoterms: 'DDP',
      notes: 'Test contract for approval workflow testing',
      createdById: user.id,
      updatedById: user.id
    };

    const contract = await Contract.create(contractData);
    console.log(`✅ Created contract: ${contract.contractNumber}`);

    // Submit for approval
    contract.status = 'pending_approval';
    await contract.save();
    console.log(`✅ Contract submitted for approval: ${contract.contractNumber}`);

    console.log(`📋 Contract ID: ${contract.id}`);
    console.log(`📋 Contract Number: ${contract.contractNumber}`);
    console.log(`📋 Status: ${contract.status}`);
    console.log(`📋 Supplier: ${supplier.legalName}`);

  } catch (error) {
    console.error('❌ Error creating test contract:', error);
  } finally {
    await sequelize.close();
  }
}

createTestContract();
