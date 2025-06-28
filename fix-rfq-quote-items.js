// Fix RfqQuoteItems table schema
const { sequelize } = require('./backend/models/sequelize');

async function fixRfqQuoteItems() {
  try {
    console.log('🔧 Fixing RfqQuoteItems table...');
    
    // Add missing columns
    const missingColumns = [
      { name: 'itemDescription', type: 'TEXT NOT NULL DEFAULT \'\'', },
      { name: 'quantity', type: 'DECIMAL(15,2) NOT NULL DEFAULT 1.00' },
      { name: 'totalPrice', type: 'DECIMAL(15,2) NOT NULL DEFAULT 0.00' },
      { name: 'currency', type: 'VARCHAR(10) DEFAULT \'USD\'' },
      { name: 'leadTime', type: 'INTEGER' }
    ];
    
    for (const column of missingColumns) {
      try {
        await sequelize.query(`
          ALTER TABLE "RfqQuoteItems" 
          ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type};
        `);
        console.log(`✅ Added ${column.name} column`);
      } catch (error) {
        console.log(`⚠️  ${column.name} column: ${error.message}`);
      }
    }
    
    // Fix rfqItemId to allow null
    try {
      await sequelize.query(`
        ALTER TABLE "RfqQuoteItems" 
        ALTER COLUMN "rfqItemId" DROP NOT NULL;
      `);
      console.log('✅ Updated rfqItemId to allow null');
    } catch (error) {
      console.log('⚠️  rfqItemId update:', error.message);
    }
    
    console.log('\n🎉 RfqQuoteItems table fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixRfqQuoteItems();