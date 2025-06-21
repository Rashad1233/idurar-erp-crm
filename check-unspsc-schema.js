/**
 * Script to check the schema of the UnspscCodes table
 */
const { sequelize } = require('./backend/models/sequelize');

async function checkUnspscSchema() {
  try {
    console.log('Checking UnspscCodes table schema...');
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'UnspscCodes'
      ORDER BY ordinal_position;
    `);
    
    console.log('UnspscCodes table columns:');
    console.table(columns);
    
    // Check if there are any rows in the table
    const [count] = await sequelize.query(`
      SELECT COUNT(*) AS count FROM "UnspscCodes"
    `);
    
    console.log(`Total UNSPSC codes in database: ${count[0].count}`);
    
    if (parseInt(count[0].count) > 0) {
      // Get a sample row
      const [sample] = await sequelize.query(`
        SELECT * FROM "UnspscCodes" LIMIT 1
      `);
      
      console.log('Sample UNSPSC code:');
      console.log(JSON.stringify(sample[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error checking UnspscCodes schema:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkUnspscSchema();
