const { Sequelize } = require('sequelize');

async function fixAllColumnNames() {
  try {
    // Create a direct Sequelize connection
    const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      logging: false // Set to true if you want to see all SQL
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    
    // Get all columns from Users table
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      AND table_schema = 'public';
    `);
    
    const columnNames = columns.map(col => col.column_name);
    console.log('Current columns:', columnNames);
    
    // List of all camelCase to snake_case mappings to check
    const columnMappings = [
      { camel: 'firstName', snake: 'first_name' },
      { camel: 'lastName', snake: 'last_name' },
      { camel: 'isActive', snake: 'is_active' },
      { camel: 'lastLogin', snake: 'last_login' },
      { camel: 'createdAt', snake: 'created_at' },
      { camel: 'updatedAt', snake: 'updated_at' }
    ];
    
    // Create any missing snake_case columns
    for (const mapping of columnMappings) {
      // If only camelCase exists, create the snake_case version
      if (columnNames.includes(mapping.camel) && !columnNames.includes(mapping.snake)) {
        console.log(`Adding ${mapping.snake} column as duplicate of ${mapping.camel}...`);
        
        // Determine the column type based on the camelCase column
        const [columnInfo] = await sequelize.query(`
          SELECT data_type, character_maximum_length, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'Users'
          AND table_schema = 'public'
          AND column_name = '${mapping.camel}';
        `);
        
        if (columnInfo.length > 0) {
          let dataType = columnInfo[0].data_type.toUpperCase();
          
          // Add length for VARCHAR
          if (dataType === 'CHARACTER VARYING' && columnInfo[0].character_maximum_length) {
            dataType = `VARCHAR(${columnInfo[0].character_maximum_length})`;
          }
          
          // Add NULL/NOT NULL
          const nullable = columnInfo[0].is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          
          // Add the column
          await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN ${mapping.snake} ${dataType} ${nullable};
          `);
          
          // Copy data from camelCase to snake_case
          console.log(`Copying data from ${mapping.camel} to ${mapping.snake}...`);
          await sequelize.query(`
            UPDATE "Users"
            SET ${mapping.snake} = "${mapping.camel}";
          `);
        }
      }
      
      // If only snake_case exists, create the camelCase version
      else if (!columnNames.includes(mapping.camel) && columnNames.includes(mapping.snake)) {
        console.log(`Adding ${mapping.camel} column as duplicate of ${mapping.snake}...`);
        
        // Determine the column type based on the snake_case column
        const [columnInfo] = await sequelize.query(`
          SELECT data_type, character_maximum_length, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'Users'
          AND table_schema = 'public'
          AND column_name = '${mapping.snake}';
        `);
        
        if (columnInfo.length > 0) {
          let dataType = columnInfo[0].data_type.toUpperCase();
          
          // Add length for VARCHAR
          if (dataType === 'CHARACTER VARYING' && columnInfo[0].character_maximum_length) {
            dataType = `VARCHAR(${columnInfo[0].character_maximum_length})`;
          }
          
          // Add NULL/NOT NULL
          const nullable = columnInfo[0].is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          
          // Add the column
          await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN "${mapping.camel}" ${dataType} ${nullable};
          `);
          
          // Copy data from snake_case to camelCase
          console.log(`Copying data from ${mapping.snake} to ${mapping.camel}...`);
          await sequelize.query(`
            UPDATE "Users"
            SET "${mapping.camel}" = ${mapping.snake};
          `);
        }
      }
      
      // If neither exists, create both with default values
      else if (!columnNames.includes(mapping.camel) && !columnNames.includes(mapping.snake)) {
        console.log(`Neither ${mapping.camel} nor ${mapping.snake} exists. Creating both...`);
        
        // Determine appropriate data type and default value based on column name
        let dataType = 'VARCHAR(255)';
        let defaultValue = '';
        
        if (mapping.snake === 'is_active') {
          dataType = 'BOOLEAN';
          defaultValue = 'DEFAULT true';
        } else if (mapping.snake === 'created_at' || mapping.snake === 'updated_at' || mapping.snake === 'last_login') {
          dataType = 'TIMESTAMP';
          defaultValue = mapping.snake === 'last_login' ? '' : 'DEFAULT NOW()';
        }
        
        // Add snake_case column
        await sequelize.query(`
          ALTER TABLE "Users" 
          ADD COLUMN ${mapping.snake} ${dataType} ${defaultValue};
        `);
        
        // Add camelCase column
        await sequelize.query(`
          ALTER TABLE "Users" 
          ADD COLUMN "${mapping.camel}" ${dataType} ${defaultValue};
        `);
        
        // Set default values for timestamps
        if (mapping.snake === 'created_at' || mapping.snake === 'updated_at') {
          console.log(`Setting default values for ${mapping.snake} and ${mapping.camel}...`);
          await sequelize.query(`
            UPDATE "Users"
            SET ${mapping.snake} = NOW(), "${mapping.camel}" = NOW()
            WHERE ${mapping.snake} IS NULL;
          `);
        }
      }
    }
    
    console.log('All column name fixes completed!');
    
    // Check admin user to make sure it looks correct
    const [adminUser] = await sequelize.query(`
      SELECT id, email, username, first_name, last_name, is_active, last_login, created_at, updated_at 
      FROM "Users" 
      WHERE email = 'admin@erp.com';
    `);
    
    if (adminUser.length > 0) {
      console.log('Admin user details:', adminUser[0]);
    } else {
      console.log('Admin user not found!');
    }
    
  } catch (error) {
    console.error('Error fixing column names:', error);
  }
}

fixAllColumnNames();
