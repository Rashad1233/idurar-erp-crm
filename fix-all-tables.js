const { Sequelize } = require('sequelize');

async function checkAndFixAllTables() {
  try {
    // Create a direct Sequelize connection
    const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      logging: false
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connection established successfully.');
    
    // Get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const tableNames = tables.map(table => table.table_name);
    console.log(`📋 Found ${tableNames.length} tables in the database:`);
    console.log(tableNames.join(', '));
    
    // Common timestamp column names that might be missing in snake_case
    const timestampColumns = [
      { camel: 'createdAt', snake: 'created_at' },
      { camel: 'updatedAt', snake: 'updated_at' }
    ];
    
    // Process each table
    for (const tableName of tableNames) {
      console.log(`\n🔍 Checking table: ${tableName}`);
      
      // Get all columns for this table
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
        AND table_schema = 'public';
      `);
      
      const columnNames = columns.map(col => col.column_name);
      console.log(`📋 Columns: ${columnNames.join(', ')}`);
      
      // Check and fix timestamp columns for each table
      for (const col of timestampColumns) {
        if (columnNames.includes(col.camel) && !columnNames.includes(col.snake)) {
          console.log(`⏳ Adding ${col.snake} column to ${tableName}...`);
          
          try {
            // Get the data type of the camelCase column
            const [columnInfo] = await sequelize.query(`
              SELECT data_type, is_nullable
              FROM information_schema.columns
              WHERE table_name = '${tableName}'
              AND table_schema = 'public'
              AND column_name = '${col.camel}';
            `);
            
            if (columnInfo.length > 0) {
              const dataType = columnInfo[0].data_type.toUpperCase();
              const nullable = columnInfo[0].is_nullable === 'YES' ? '' : 'NOT NULL';
              
              // Add the snake_case column
              await sequelize.query(`
                ALTER TABLE "${tableName}" 
                ADD COLUMN ${col.snake} ${dataType} ${nullable} DEFAULT NOW();
              `);
              
              // Copy data from camelCase to snake_case
              await sequelize.query(`
                UPDATE "${tableName}"
                SET ${col.snake} = "${col.camel}";
              `);
              
              console.log(`✅ Added and populated ${col.snake} column in ${tableName}.`);
            }
          } catch (err) {
            console.error(`❌ Error adding ${col.snake} to ${tableName}:`, err.message);
          }
        } else if (columnNames.includes(col.snake) && !columnNames.includes(col.camel)) {
          console.log(`⚠️ Table ${tableName} has ${col.snake} but not ${col.camel}.`);
        } else if (columnNames.includes(col.snake) && columnNames.includes(col.camel)) {
          console.log(`✅ Table ${tableName} has both ${col.snake} and ${col.camel}.`);
        } else {
          console.log(`⚠️ Table ${tableName} is missing both ${col.snake} and ${col.camel}.`);
          
          // Add both columns if neither exists
          try {
            await sequelize.query(`
              ALTER TABLE "${tableName}" 
              ADD COLUMN ${col.snake} TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              ADD COLUMN "${col.camel}" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            `);
            console.log(`✅ Added both ${col.snake} and ${col.camel} to ${tableName}.`);
          } catch (err) {
            console.error(`❌ Error adding timestamp columns to ${tableName}:`, err.message);
          }
        }
      }
      
      // Check for other common naming issues
      const commonColumns = [
        { camel: 'isActive', snake: 'is_active', type: 'BOOLEAN DEFAULT true' },
        { camel: 'isDeleted', snake: 'is_deleted', type: 'BOOLEAN DEFAULT false' },
        { camel: 'lastUpdated', snake: 'last_updated', type: 'TIMESTAMP WITH TIME ZONE' }
      ];
      
      for (const col of commonColumns) {
        if (columnNames.includes(col.camel) && !columnNames.includes(col.snake)) {
          console.log(`⏳ Adding ${col.snake} column to ${tableName}...`);
          
          try {
            await sequelize.query(`
              ALTER TABLE "${tableName}" 
              ADD COLUMN ${col.snake} ${col.type};
            `);
            
            await sequelize.query(`
              UPDATE "${tableName}"
              SET ${col.snake} = "${col.camel}";
            `);
            
            console.log(`✅ Added and populated ${col.snake} column in ${tableName}.`);
          } catch (err) {
            console.error(`❌ Error adding ${col.snake} to ${tableName}:`, err.message);
          }
        }
      }
    }
    
    console.log('\n🎉 Database check and fix complete!');
    
  } catch (error) {
    console.error('❌ Error checking/fixing tables:', error);
  }
}

checkAndFixAllTables();
