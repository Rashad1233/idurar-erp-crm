// Check Supplier table schema
const { sequelize } = require('./backend/models/sequelize');

async function checkSupplierTable() {
  try {
    console.log('🔍 Checking Supplier table...');
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Suppliers' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Suppliers columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check for expected columns
    const expectedColumns = ['email', 'phone', 'supplierNumber', 'legalName', 'tradeName'];
    console.log('\n🔍 Expected columns check:');
    expectedColumns.forEach(col => {
      const exists = columns.some(c => c.column_name === col);
      console.log(`  - ${col}: ${exists ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSupplierTable();