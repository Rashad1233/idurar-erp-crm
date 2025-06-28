// Check RfqQuoteItems table schema
const { sequelize } = require('./backend/models/sequelize');

async function checkRfqQuoteItems() {
  try {
    console.log('🔍 Checking RfqQuoteItems table...');
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'RfqQuoteItems' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 RfqQuoteItems columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if itemDescription exists
    const hasItemDescription = columns.some(col => col.column_name === 'itemDescription');
    console.log(`\n🔍 itemDescription column exists: ${hasItemDescription}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkRfqQuoteItems();