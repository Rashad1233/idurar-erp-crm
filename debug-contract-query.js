const { sequelize } = require('./backend/models/sequelize');

async function debugContractQuery() {
  try {
    console.log('=== Raw SQL Query Test ===\n');
    
    // Raw SQL query to check contracts directly
    const [results] = await sequelize.query(`
      SELECT 
        c.id, 
        c."contractNumber", 
        c."contractName",
        c.status, 
        c."approvalStatus",
        s."legalName" as supplier_name
      FROM "Contracts" c
      LEFT JOIN "Suppliers" s ON c."supplierId" = s.id
      ORDER BY c."createdAt" DESC;
    `);
    
    console.log(`Found ${results.length} contracts in database:`);
    results.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.contractNumber}: ${contract.contractName}`);
      console.log(`   Status: '${contract.status}', Approval: '${contract.approvalStatus}'`);
      console.log(`   Supplier: ${contract.supplier_name}`);
      console.log(`   Should show in DoFA? ${contract.status === 'pending_approval' && contract.approvalStatus === 'pending' ? 'YES' : 'NO'}`);
      console.log('');
    });
    
    // Raw SQL query for pending approvals specifically
    const [pendingResults] = await sequelize.query(`
      SELECT 
        c.id, 
        c."contractNumber", 
        c."contractName",
        c.status, 
        c."approvalStatus",
        s."legalName" as supplier_name
      FROM "Contracts" c
      LEFT JOIN "Suppliers" s ON c."supplierId" = s.id
      WHERE c.status = 'pending_approval' AND c."approvalStatus" = 'pending'
      ORDER BY c."createdAt" DESC;
    `);
    
    console.log(`\n=== Contracts matching pending approval criteria: ${pendingResults.length} ===`);
    pendingResults.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.contractNumber}: ${contract.contractName}`);
      console.log(`   Status: '${contract.status}', Approval: '${contract.approvalStatus}'`);
      console.log(`   Supplier: ${contract.supplier_name}`);
    });
    
    // Let's also test the Sequelize query manually
    console.log('\n=== Testing Sequelize Query ===');
    const { Contract, Supplier, User, ContractItem } = require('./backend/models/sequelize');
    
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
    
    console.log(`Sequelize found ${pendingContracts.length} contracts`);
    pendingContracts.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.contractNumber}: ${contract.contractName}`);
      console.log(`   Status: '${contract.status}', Approval: '${contract.approvalStatus}'`);
      console.log(`   Supplier: ${contract.supplier?.legalName}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

debugContractQuery();
