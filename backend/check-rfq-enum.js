const { sequelize } = require('./models/sequelize');

async function checkEnum() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'RequestForQuotations'
      AND column_name = 'status';
    `);
    
    console.log('Column info:', results);
    
    // Get enum values
    const [enumValues] = await sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_RequestForQuotations_status'
      );
    `);
    
    console.log('\nCurrent enum values:');
    enumValues.forEach(row => console.log('-', row.enumlabel));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkEnum();
