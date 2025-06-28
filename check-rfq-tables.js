// Check RFQ tables in database
const { sequelize } = require('./backend/models/sequelize');

async function checkRFQTables() {
  try {
    console.log('🔍 Checking RFQ tables in database...');
    
    // Check if tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name ILIKE '%rfq%'
      ORDER BY table_name;
    `);
    
    console.log('📋 RFQ-related tables found:', tables.map(t => t.table_name));
    
    // Check RequestForQuotations table
    if (tables.some(t => t.table_name === 'RequestForQuotations')) {
      console.log('\n🔍 RequestForQuotations table structure:');
      const [rfqColumns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'RequestForQuotations' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      rfqColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Check RfqSuppliers table
    if (tables.some(t => t.table_name === 'RfqSuppliers')) {
      console.log('\n🔍 RfqSuppliers table structure:');
      const [supplierColumns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'RfqSuppliers' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      supplierColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Check RfqItems table
    if (tables.some(t => t.table_name === 'RfqItems')) {
      console.log('\n🔍 RfqItems table structure:');
      const [itemColumns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'RfqItems' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      itemColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkRFQTables();