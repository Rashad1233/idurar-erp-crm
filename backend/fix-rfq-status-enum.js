const { sequelize } = require('./models/sequelize');

async function fixRFQStatusEnum() {
  try {
    console.log('Adding approved_by_supplier to RFQ status enum...');
    
    // Add the new enum value
    await sequelize.query(`
      ALTER TYPE "enum_RequestForQuotations_status" ADD VALUE IF NOT EXISTS 'approved_by_supplier';
    `);
    
    console.log('✅ Successfully added approved_by_supplier to enum');
    
    // Verify the change
    const [enumValues] = await sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_RequestForQuotations_status'
      );
    `);
    
    console.log('\nUpdated enum values:');
    enumValues.forEach(row => console.log('-', row.enumlabel));
    
  } catch (error) {
    console.error('Error fixing RFQ status enum:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixRFQStatusEnum();
