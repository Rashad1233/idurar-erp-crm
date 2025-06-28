const { Contract, Supplier, User } = require('./backend/models/sequelize');
const axios = require('axios');

async function testDofaFlow() {
  try {
    console.log('=== Testing DoFA Contract Review Flow ===\n');
    
    // Step 1: Create a test contract
    const supplier = await Supplier.findOne();
    const user = await User.findOne();
    
    if (!supplier) {
      console.log('❌ No supplier found');
      return;
    }
    
    const contractData = {
      contractNumber: `CTR-2025-DOFA-${Date.now()}`,
      contractName: 'DoFA Test Contract',
      description: 'Test contract for DoFA review verification',
      supplierId: supplier.id,
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
      totalValue: 25000.00,
      status: 'pending_approval',
      approvalStatus: 'pending',
      createdById: user?.id || supplier.id,
      updatedById: user?.id || supplier.id,
      terms: 'Standard terms',
      paymentTerms: 'Net 30 days'
    };
    
    const newContract = await Contract.create(contractData);
    console.log('✅ Created test contract:');
    console.log(`   Contract Number: ${newContract.contractNumber}`);
    console.log(`   ID: ${newContract.id}`);
    console.log(`   Status: ${newContract.status}`);
    console.log(`   Approval Status: ${newContract.approvalStatus}`);
    
    // Step 2: Verify it appears in database query
    console.log('\n=== Step 2: Database Query Test ===');
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
    
    console.log(`Database query found: ${pendingContracts.length} contracts`);
    pendingContracts.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.contractNumber} - ${contract.contractName}`);
    });
    
    // Step 3: Test API endpoints
    console.log('\n=== Step 3: API Endpoint Tests ===');
    
    for (const port of [3000, 8888]) {
      console.log(`\nTesting port ${port}:`);
      try {
        const response = await axios.get(`http://localhost:${port}/api/dofa/contracts/review`);
        console.log(`✅ API Success on port ${port}:`);
        console.log(`   Found: ${response.data.data?.length || 0} contracts`);
        console.log(`   Response:`, response.data);
        
        if (response.data.data && response.data.data.length > 0) {
          response.data.data.forEach((contract, index) => {
            console.log(`   ${index + 1}. ${contract.contractNumber} - ${contract.contractName}`);
          });
        }
        
      } catch (error) {
        console.log(`❌ API Failed on port ${port}:`, 
          error.response?.status, 
          error.response?.data?.message || error.message
        );
      }
    }
    
    // Step 4: Test frontend accessibility
    console.log('\n=== Step 4: Frontend Page Test ===');
    try {
      const frontendResponse = await axios.get('http://localhost:3000/dofa/contracts/review');
      console.log('✅ Frontend page accessible');
    } catch (error) {
      console.log('❌ Frontend page error:', error.response?.status || error.message);
    }

  } catch (error) {
    console.error('❌ Error in test:', error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

testDofaFlow();
