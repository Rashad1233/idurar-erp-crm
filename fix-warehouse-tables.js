const { sequelize } = require('./backend/models/sequelize');

// Function to create a snake_case version of an existing table
async function createSnakeCaseTable(capitalizedTableName, snakeCaseTableName) {
  try {
    console.log(`Checking if ${capitalizedTableName} exists...`);
    
    // Check if the capitalized table exists
    const [capitalizedExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${capitalizedTableName}'
      ) as exists
    `);
    
    if (!capitalizedExists[0].exists) {
      console.log(`❌ Source table ${capitalizedTableName} does not exist!`);
      return false;
    }
    
    console.log(`✅ Source table ${capitalizedTableName} exists`);
    
    // Check if the snake_case table already exists
    const [snakeCaseExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${snakeCaseTableName}'
      ) as exists
    `);
    
    if (snakeCaseExists[0].exists) {
      console.log(`⚠️ Target table ${snakeCaseTableName} already exists, skipping creation`);
      return true;
    }
    
    // Create the snake_case table as a view of the capitalized table
    console.log(`Creating view ${snakeCaseTableName}...`);
    await sequelize.query(`
      CREATE VIEW ${snakeCaseTableName} AS
      SELECT * FROM "${capitalizedTableName}"
    `);
    
    console.log(`✅ Successfully created view ${snakeCaseTableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating view ${snakeCaseTableName}:`, error);
    return false;
  }
}

// Function to fix bin location routes by updating the SQL in simpleWarehouseRoutes.js
async function fixSimpleWarehouseRoutes() {
  console.log('\n==== FIXING SIMPLE WAREHOUSE ROUTES ====');
  
  // Create snake_case views for warehouse tables
  await createSnakeCaseTable('StorageLocations', 'storage_locations');
  await createSnakeCaseTable('BinLocations', 'bin_locations');
  
  console.log('\n==== CREATING SQL HELPER FUNCTION ====');
  
  // Create SQL function to help with column name compatibility
  try {
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION get_column_names(tablename text) 
      RETURNS TABLE(column_name text) AS $$
      BEGIN
        RETURN QUERY SELECT column_name::text
        FROM information_schema.columns
        WHERE table_name = tablename
        AND table_schema = 'public';
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Created SQL helper function for column names');
  } catch (error) {
    console.error('❌ Error creating SQL helper function:', error);
  }
  
  // Check BinLocations table structure
  try {
    const [columns] = await sequelize.query(`SELECT * FROM get_column_names('BinLocations')`);
    console.log('\nBinLocations columns:');
    columns.forEach(c => console.log(` - ${c.column_name}`));
  } catch (error) {
    console.error('❌ Error getting BinLocations columns:', error);
  }
}

// Run the function
fixSimpleWarehouseRoutes()
  .then(() => {
    console.log('\n✅ Completed warehouse fix operations');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error in main function:', error);
    process.exit(1);
  });
