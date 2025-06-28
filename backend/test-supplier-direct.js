const { Supplier, sequelize } = require('./models/sequelize');

async function testSupplierFetch() {
  try {
    console.log('🔍 Testing direct supplier fetch...');
    
    // Test 1: Simple count
    const count = await Supplier.count();
    console.log(`📊 Total suppliers in database: ${count}`);
    
    // Test 2: Fetch all suppliers without associations
    const allSuppliers = await Supplier.findAll({
      attributes: ['id', 'legalName', 'contactEmail', 'status'],
      order: [['createdAt', 'DESC']]
    });
    console.log(`📋 All suppliers: ${allSuppliers.length}`);
    allSuppliers.forEach(s => {
      console.log(`  - ${s.legalName} (${s.status}) - ${s.contactEmail}`);
    });
    
    // Test 3: Fetch only active suppliers
    const activeSuppliers = await Supplier.findAll({
      where: { status: 'active' },
      attributes: ['id', 'legalName', 'contactEmail', 'status'],
      order: [['createdAt', 'DESC']]
    });
    console.log(`✅ Active suppliers: ${activeSuppliers.length}`);
    activeSuppliers.forEach(s => {
      console.log(`  - ${s.legalName} (${s.status}) - ${s.contactEmail}`);
    });
    
    // Test 4: Raw SQL query
    const [rawSuppliers] = await sequelize.query(`
      SELECT id, "legalName", "contactEmail", status 
      FROM "Suppliers" 
      WHERE status = 'active'
      ORDER BY "createdAt" DESC
    `);
    console.log(`🔧 Raw SQL active suppliers: ${rawSuppliers.length}`);
    rawSuppliers.forEach(s => {
      console.log(`  - ${s.legalName} (${s.status}) - ${s.contactEmail}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing supplier fetch:', error);
  } finally {
    await sequelize.close();
  }
}

testSupplierFetch();