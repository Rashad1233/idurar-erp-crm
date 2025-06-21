const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configure Sequelize
const sequelize = new Sequelize({
  host: 'localhost',
  database: 'idurar',
  username: 'postgres',
  password: 'postgres',
  dialect: 'postgres',
  logging: false
});

// Function to deeply examine the inventory table
async function examineInventory() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');

    // Check if the table exists
    const [tableCheck] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory'
      );
    `);
    
    const tableExists = tableCheck[0].exists;
    
    if (!tableExists) {
      console.error('❌ inventory table does not exist!');
      
      // Check if there's a different table for inventory
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name LIKE '%inventory%' OR table_name LIKE '%stock%'
      `);
      
      if (tables.length > 0) {
        console.log('🔍 Found similar tables:');
        tables.forEach(table => {
          console.log(`  - ${table.table_name}`);
        });
      }
      
      return;
    }
    
    console.log('✅ inventory table exists');

    // Get table columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position
    `);
    
    console.log('\n🔍 inventory table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check for foreign keys
    const [foreignKeys] = await sequelize.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'inventory';
    `);
    
    console.log('\n🔍 Foreign key relationships:');
    if (foreignKeys.length === 0) {
      console.log('  No foreign keys found');
    } else {
      foreignKeys.forEach(fk => {
        console.log(`  - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }
    
    // Check for data
    const [dataCount] = await sequelize.query(`
      SELECT COUNT(*) FROM inventory
    `);
    
    console.log(`\n📊 Records in inventory: ${dataCount[0].count}`);
    
    if (parseInt(dataCount[0].count) > 0) {
      // Fetch a sample record
      const [sampleData] = await sequelize.query(`
        SELECT * FROM inventory LIMIT 1
      `);
      
      console.log('\n📝 Sample record:');
      console.log(JSON.stringify(sampleData[0], null, 2));
    }
    
    // Check for item relationship
    console.log('\n🔍 Checking for item relationship:');
    
    // First check if item table exists
    const [itemTableCheck] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'item'
      );
    `);
    
    if (itemTableCheck[0].exists) {
      console.log('✅ item table exists');
      
      // Check for item_id column in inventory
      const hasItemId = columns.some(col => col.column_name === 'item_id');
      
      if (hasItemId) {
        console.log('✅ inventory has item_id column');
        
        // Check if there's data in the relationship
        if (parseInt(dataCount[0].count) > 0) {
          try {
            const [itemData] = await sequelize.query(`
              SELECT i.*, it.name as item_name 
              FROM inventory i
              LEFT JOIN item it ON i.item_id = it.id
              LIMIT 1
            `);
            
            console.log('\n📝 Sample joined record:');
            console.log(JSON.stringify(itemData[0], null, 2));
          } catch (error) {
            console.error('❌ Error joining inventory with item:', error.message);
          }
        }
      } else {
        console.log('❌ inventory does not have item_id column');
      }
    } else {
      console.log('❌ item table does not exist');
    }
  } catch (error) {
    console.error('❌ Error examining inventory table:', error);
  }
}

// Function to examine the controller
async function examineInventoryController() {
  const controllerPath = path.join(__dirname, 'backend', 'controllers', 'inventoryController.js');
  
  if (!fs.existsSync(controllerPath)) {
    console.error('❌ inventoryController.js not found');
    
    // Look for similar controllers
    const controllersDir = path.join(__dirname, 'backend', 'controllers');
    if (fs.existsSync(controllersDir)) {
      const files = fs.readdirSync(controllersDir);
      const similarFiles = files.filter(file => 
        file.toLowerCase().includes('inventory') || 
        file.toLowerCase().includes('stock')
      );
      
      if (similarFiles.length > 0) {
        console.log('🔍 Found similar controller files:');
        similarFiles.forEach(file => {
          console.log(`  - ${file}`);
        });
      }
    }
    
    return;
  }
  
  try {
    const content = fs.readFileSync(controllerPath, 'utf8');
    console.log('\n🔍 Examining inventoryController.js:');
    
    // Check for route handlers
    const routeHandlers = content.match(/exports\.([a-zA-Z0-9_]+)\s*=\s*async/g) || [];
    console.log('📄 Route handlers:');
    routeHandlers.forEach(handler => {
      const handlerName = handler.replace(/exports\.|=\s*async/g, '').trim();
      console.log(`  - ${handlerName}`);
    });
    
    // Check for model imports
    const modelImports = content.match(/require\(['"]\.\.\/models\/([^'"]+)['"]\)/g) || [];
    console.log('📄 Model imports:');
    modelImports.forEach(modelImport => {
      console.log(`  - ${modelImport}`);
    });
    
    // Look for common error patterns
    console.log('\n🔍 Potential issues:');
    
    if (!content.includes('try {')) {
      console.log('  - ❌ Missing try/catch blocks');
    }
    
    if (content.includes('camelCase') && content.includes('snake_case')) {
      console.log('  - ⚠️ Mixed camelCase and snake_case naming');
    }
    
    // Look for item relationship handling
    if (content.includes('include:') && content.includes('Item')) {
      console.log('  - ✅ Item relationship included in queries');
    } else if (content.includes('Item')) {
      console.log('  - ⚠️ Item model referenced but not included in queries');
    } else {
      console.log('  - ❌ No Item relationship handling');
    }
    
    // Extract list method to analyze
    const listMethodMatch = content.match(/exports\.list\s*=\s*async[^{]*{([^}]*)}/s);
    if (listMethodMatch) {
      const listMethod = listMethodMatch[1];
      console.log('\n📄 List method analysis:');
      
      if (listMethod.includes('where:')) {
        console.log('  - ✅ Where clause used for filtering');
      } else {
        console.log('  - ⚠️ No where clause found');
      }
      
      if (listMethod.includes('pagination')) {
        console.log('  - ✅ Pagination implemented');
      } else {
        console.log('  - ⚠️ No pagination found');
      }
      
      if (listMethod.includes('include:')) {
        console.log('  - ✅ Related models included');
      } else {
        console.log('  - ⚠️ No related models included');
      }
    } else {
      console.log('  - ❌ List method not found or complex pattern');
    }
  } catch (error) {
    console.error('❌ Error reading inventoryController.js:', error.message);
  }
}

// Function to examine the model
async function examineInventoryModel() {
  const modelPath = path.join(__dirname, 'backend', 'models', 'inventory.js');
  
  if (!fs.existsSync(modelPath)) {
    console.error('❌ inventory.js model not found');
    
    // Look for similar models
    const modelsDir = path.join(__dirname, 'backend', 'models');
    if (fs.existsSync(modelsDir)) {
      const files = fs.readdirSync(modelsDir);
      const similarFiles = files.filter(file => 
        file.toLowerCase().includes('inventory') || 
        file.toLowerCase().includes('stock')
      );
      
      if (similarFiles.length > 0) {
        console.log('🔍 Found similar model files:');
        similarFiles.forEach(file => {
          console.log(`  - ${file}`);
        });
      }
    }
    
    return;
  }
  
  try {
    const content = fs.readFileSync(modelPath, 'utf8');
    console.log('\n🔍 Examining inventory.js model:');
    
    // Check for table name definition
    const tableNameMatch = content.match(/tableName:\s*['"]([^'"]+)['"]/);
    if (tableNameMatch) {
      console.log(`📄 Table name: ${tableNameMatch[1]}`);
    } else {
      console.log('❌ No explicit table name defined');
    }
    
    // Check for timestamp settings
    const timestampsMatch = content.match(/timestamps:\s*(true|false)/);
    if (timestampsMatch) {
      console.log(`📄 Timestamps: ${timestampsMatch[1]}`);
    } else {
      console.log('⚠️ Timestamps setting not explicit');
    }
    
    // Check for field definitions
    const fieldMatches = content.match(/([a-zA-Z0-9_]+):\s*{[^}]+}/g) || [];
    const fields = fieldMatches.map(m => m.split(':')[0].trim());
    
    console.log('📄 Defined fields:');
    fields.forEach(field => {
      console.log(`  - ${field}`);
    });
    
    // Check for associations
    console.log('\n🔍 Associations:');
    if (content.includes('associate')) {
      if (content.includes('belongsTo(models.Item')) {
        console.log('  - ✅ belongsTo Item association defined');
      } else {
        console.log('  - ❌ No Item association defined');
      }
    } else {
      console.log('  - ❌ No associations method defined');
    }
    
    // Check for underscoreAll
    if (content.includes('underscoreAll: true') || content.includes('underscored: true')) {
      console.log('✅ Underscored naming strategy enabled');
    } else {
      console.log('⚠️ No underscored naming strategy specified');
    }
  } catch (error) {
    console.error('❌ Error reading inventory.js model:', error.message);
  }
}

// Function to examine the router file
async function examineInventoryRouter() {
  const routesDir = path.join(__dirname, 'backend', 'routes');
  
  if (!fs.existsSync(routesDir)) {
    console.error('❌ routes directory not found');
    return;
  }
  
  // Look for inventory route file
  const files = fs.readdirSync(routesDir);
  const routeFile = files.find(file => 
    file.toLowerCase().includes('inventory')
  );
  
  if (!routeFile) {
    console.error('❌ Inventory route file not found');
    
    // Check for inventory routes in other files
    console.log('🔍 Searching for inventory routes in other files...');
    
    for (const file of files) {
      const filePath = path.join(routesDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('/inventory')) {
          console.log(`✅ Found inventory routes in ${file}`);
          
          // Extract inventory routes
          const inventoryRoutes = content.match(/router\.(get|post|put|delete)\(['"][^'"]*inventory[^'"]*['"][^)]+\)/g) || [];
          
          console.log('📄 Inventory routes:');
          inventoryRoutes.forEach(route => {
            console.log(`  - ${route}`);
          });
          
          break;
        }
      } catch (error) {
        console.error(`❌ Error reading ${file}:`, error.message);
      }
    }
    
    return;
  }
  
  const routePath = path.join(routesDir, routeFile);
  
  try {
    const content = fs.readFileSync(routePath, 'utf8');
    console.log(`\n🔍 Examining ${routeFile}:`);
    
    // Extract routes
    const routes = content.match(/router\.(get|post|put|delete)\([^)]+\)/g) || [];
    
    console.log('📄 Defined routes:');
    routes.forEach(route => {
      console.log(`  - ${route}`);
    });
    
    // Check if controller is properly imported
    const controllerImport = content.match(/require\(['"]\.\.\/controllers\/([^'"]+)['"]\)/);
    if (controllerImport) {
      console.log(`📄 Controller import: ${controllerImport[1]}`);
    } else {
      console.log('❌ No controller import found');
    }
  } catch (error) {
    console.error(`❌ Error reading ${routeFile}:`, error.message);
  }
}

// Function to examine item model and relationship
async function examineItemRelationship() {
  const modelPath = path.join(__dirname, 'backend', 'models', 'item.js');
  
  if (!fs.existsSync(modelPath)) {
    console.error('❌ item.js model not found');
    return;
  }
  
  try {
    const content = fs.readFileSync(modelPath, 'utf8');
    console.log('\n🔍 Examining item.js model for inventory relationship:');
    
    // Check for hasMany inventory association
    if (content.includes('hasMany(models.Inventory')) {
      console.log('✅ hasMany Inventory association defined in Item model');
    } else {
      console.log('❌ No Inventory association defined in Item model');
    }
    
    // Check if item table exists and has data
    try {
      const [itemCount] = await sequelize.query(`
        SELECT COUNT(*) FROM item
      `);
      
      console.log(`\n📊 Records in item table: ${itemCount[0].count}`);
      
      if (parseInt(itemCount[0].count) > 0) {
        // Sample item data
        const [sampleItem] = await sequelize.query(`
          SELECT * FROM item LIMIT 1
        `);
        
        console.log('\n📝 Sample item record:');
        console.log(JSON.stringify(sampleItem[0], null, 2));
      }
    } catch (error) {
      console.error('❌ Error checking item table:', error.message);
    }
  } catch (error) {
    console.error('❌ Error reading item.js model:', error.message);
  }
}

// Function to test the API endpoint
async function testInventoryAPI() {
  const BASE_URL = 'http://localhost:8888/api';
  
  console.log('\n🔍 Testing inventory API endpoint:');
  
  try {
    // Login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@demo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Successfully logged in and obtained token');
    
    // Test the endpoint with full request details
    try {
      console.log('\n🔍 Testing GET /api/inventory');
      
      const response = await axios.get(`${BASE_URL}/inventory`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        validateStatus: false // Allow any status code
      });
      
      console.log(`📄 Status: ${response.status}`);
      console.log(`📄 Status Text: ${response.statusText}`);
      console.log(`📄 Headers: ${JSON.stringify(response.headers)}`);
      
      if (response.status === 200) {
        console.log(`📄 Response data structure: ${JSON.stringify(Object.keys(response.data))}`);
        if (response.data.result) {
          console.log(`📄 Result count: ${response.data.result.length}`);
          if (response.data.result.length > 0) {
            console.log(`📄 First result: ${JSON.stringify(response.data.result[0])}`);
          }
        }
      } else {
        console.log(`📄 Error response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log('❌ Error testing inventory endpoint:');
      console.log(`📄 Error message: ${error.message}`);
      
      if (error.response) {
        console.log(`📄 Status: ${error.response.status}`);
        console.log(`📄 Status Text: ${error.response.statusText}`);
        console.log(`📄 Error details: ${JSON.stringify(error.response.data)}`);
        console.log(`📄 Headers: ${JSON.stringify(error.response.headers)}`);
      }
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    if (error.response) {
      console.error(`📄 Status: ${error.response.status}`);
      console.error(`📄 Error details: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Inventory debugging');
  await examineInventory();
  await examineInventoryController();
  await examineInventoryModel();
  await examineInventoryRouter();
  await examineItemRelationship();
  await testInventoryAPI();
  console.log('\n✅ Debugging complete');
  sequelize.close();
}

main().catch(console.error);
