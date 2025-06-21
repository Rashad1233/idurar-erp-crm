const { sequelize } = require('./backend/models/sequelize');

async function getTableStructure() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Query the database for table structure
    const result = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'ItemMasters'
      ORDER BY 
        ordinal_position;
    `, { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    console.log('\n🔍 ITEM MASTERS TABLE STRUCTURE:');
    console.table(result);
    console.log('\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

// Run the function
getTableStructure();
