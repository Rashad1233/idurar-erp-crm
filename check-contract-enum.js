const { sequelize } = require('./backend/models/sequelize');

async function checkEnum() {
  try {
    const result = await sequelize.query(`
      SELECT typname FROM pg_type WHERE typname LIKE '%status%';
    `);
    console.log('Status enums:', result[0]);
    
    // Also check the contracts table structure
    const contractsTable = await sequelize.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'contracts' AND column_name = 'status';
    `);
    console.log('Contracts status column:', contractsTable[0]);
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkEnum();