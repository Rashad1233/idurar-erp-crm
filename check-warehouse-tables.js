const { sequelize } = require('./backend/models/sequelize');

async function listTables() {
  try {
    console.log('Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    
    // Query for all tables in the public schema
    console.log('Querying for tables...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Log results
    console.log('\nAvailable tables:');
    results.forEach(r => console.log(` - ${r.table_name}`));
    
    // Specifically look for storage and bin related tables
    console.log('\nWarehouse related tables:');
    const warehouseTables = results.filter(r => 
      r.table_name.toLowerCase().includes('storage') || 
      r.table_name.toLowerCase().includes('bin') ||
      r.table_name.toLowerCase().includes('warehouse')
    );
    
    if (warehouseTables.length > 0) {
      warehouseTables.forEach(t => console.log(` - ${t.table_name}`));
    } else {
      console.log(' No warehouse related tables found!');
    }
    
    // Check for specific tables
    console.log('\nChecking for specific warehouse tables:');
    const specificTables = [
      'StorageLocations', 
      'storage_locations',
      'BinLocations', 
      'bin_locations'
    ];
    
    for (const tableName of specificTables) {
      try {
        const [tableCheck] = await sequelize.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          ) as exists
        `);
        console.log(` - ${tableName}: ${tableCheck[0].exists ? 'EXISTS' : 'MISSING'}`);
      } catch (error) {
        console.error(` - Error checking for ${tableName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the function
listTables();
