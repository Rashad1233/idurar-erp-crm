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

// Function to deeply examine the supplier table
async function examineSupplier() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');

    // Check if the table exists
    const [tableCheck] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'supplier'
      );
    `);
    
    const tableExists = tableCheck[0].exists;
    
    if (!tableExists) {
      console.error('❌ supplier table does not exist!');
      
      // Check if there's a different table for suppliers
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name LIKE '%supplier%' OR table_name LIKE '%vendor%'
      `);
      
      if (tables.length > 0) {
        console.log('🔍 Found similar tables:');
        tables.forEach(table => {
          console.log(`  - ${table.table_name}`);
        });
      }
      
      return;
    }
    
    console.log('✅ supplier table exists');

    // Get table columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'supplier'
      ORDER BY ordinal_position
    `);
    
    console.log('\n🔍 supplier table columns:');
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
      AND tc.table_name = 'supplier';
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
      SELECT COUNT(*) FROM supplier
    `);
    
    console.log(`\n📊 Records in supplier: ${dataCount[0].count}`);
    
    if (parseInt(dataCount[0].count) > 0) {
      // Fetch a sample record
      const [sampleData] = await sequelize.query(`
        SELECT * FROM supplier LIMIT 1
      `);
      
      console.log('\n📝 Sample record:');
      console.log(JSON.stringify(sampleData[0], null, 2));
    }
    
    // Check for indexes
    const [indexes] = await sequelize.query(`
      SELECT
        i.relname AS index_name,
        a.attname AS column_name
      FROM
        pg_class t,
        pg_class i,
        pg_index ix,
        pg_attribute a
      WHERE
        t.oid = ix.indrelid
        AND i.oid = ix.indexrelid
        AND a.attrelid = t.oid
        AND a.attnum = ANY(ix.indkey)
        AND t.relkind = 'r'
        AND t.relname = 'supplier'
      ORDER BY
        i.relname
    `);
    
    console.log('\n🔍 Indexes on supplier:');
    if (indexes.length === 0) {
      console.log('  No indexes found');
    } else {
      const indexMap = {};
      indexes.forEach(idx => {
        if (!indexMap[idx.index_name]) {
          indexMap[idx.index_name] = [];
        }
        indexMap[idx.index_name].push(idx.column_name);
      });
      
      Object.entries(indexMap).forEach(([indexName, columns]) => {
        console.log(`  - ${indexName}: ${columns.join(', ')}`);
      });
    }

    // Check if suppliers vs supplier tables exist
    const [suppliersTable] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'suppliers'
      );
    `);
    
    if (suppliersTable[0].exists) {
      console.log('\n⚠️ Both "supplier" and "suppliers" tables exist in the database!');
      
      // Compare column structure
      const [suppliersColumns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'suppliers'
        ORDER BY ordinal_position
      `);
      
      console.log('\n🔍 suppliers table columns:');
      suppliersColumns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      // Check data in suppliers table
      const [suppliersCount] = await sequelize.query(`
        SELECT COUNT(*) FROM suppliers
      `);
      
      console.log(`\n📊 Records in suppliers: ${suppliersCount[0].count}`);
      
      if (parseInt(suppliersCount[0].count) > 0) {
        // Fetch a sample record
        const [sampleSuppliers] = await sequelize.query(`
          SELECT * FROM suppliers LIMIT 1
        `);
        
        console.log('\n📝 Sample record from suppliers:');
        console.log(JSON.stringify(sampleSuppliers[0], null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Error examining supplier table:', error);
  }
}

// Function to examine the controller
async function examineSupplierController() {
  const controllerPath = path.join(__dirname, 'backend', 'controllers', 'supplierController.js');
  
  if (!fs.existsSync(controllerPath)) {
    console.error('❌ supplierController.js not found');
    
    // Look for similar controllers
    const controllersDir = path.join(__dirname, 'backend', 'controllers');
    if (fs.existsSync(controllersDir)) {
      const files = fs.readdirSync(controllersDir);
      const similarFiles = files.filter(file => 
        file.toLowerCase().includes('supplier') || 
        file.toLowerCase().includes('vendors')
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
    console.log('\n🔍 Examining supplierController.js:');
    
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
    
    // Check for table name references
    console.log('\n🔍 Table name references:');
    if (content.includes('supplier') && content.includes('suppliers')) {
      console.log('⚠️ Mixed references to "supplier" and "suppliers" tables');
    } else if (content.includes('suppliers')) {
      console.log('📄 References "suppliers" table');
    } else if (content.includes('supplier')) {
      console.log('📄 References "supplier" table');
    } else {
      console.log('❌ No direct table name references found');
    }
    
    // Look for common error patterns
    console.log('\n🔍 Potential issues:');
    
    if (!content.includes('try {')) {
      console.log('  - ❌ Missing try/catch blocks');
    }
    
    if (content.includes('camelCase') && content.includes('snake_case')) {
      console.log('  - ⚠️ Mixed camelCase and snake_case naming');
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
    } else {
      console.log('  - ❌ List method not found or complex pattern');
    }
  } catch (error) {
    console.error('❌ Error reading supplierController.js:', error.message);
  }
}

// Function to examine the model
async function examineSupplierModel() {
  const modelPath = path.join(__dirname, 'backend', 'models', 'supplier.js');
  
  if (!fs.existsSync(modelPath)) {
    console.error('❌ supplier.js model not found');
    
    // Look for similar models
    const modelsDir = path.join(__dirname, 'backend', 'models');
    if (fs.existsSync(modelsDir)) {
      const files = fs.readdirSync(modelsDir);
      const similarFiles = files.filter(file => 
        file.toLowerCase().includes('supplier') || 
        file.toLowerCase().includes('vendor')
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
    console.log('\n🔍 Examining supplier.js model:');
    
    // Check for table name definition
    const tableNameMatch = content.match(/tableName:\s*['"]([^'"]+)['"]/);
    if (tableNameMatch) {
      console.log(`📄 Table name: ${tableNameMatch[1]}`);
      
      if (tableNameMatch[1] === 'suppliers') {
        console.log('⚠️ Model defines table name as "suppliers" but may be using "supplier" in database');
      }
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
    
    // Check for underscoreAll
    if (content.includes('underscoreAll: true') || content.includes('underscored: true')) {
      console.log('✅ Underscored naming strategy enabled');
    } else {
      console.log('⚠️ No underscored naming strategy specified');
    }
  } catch (error) {
    console.error('❌ Error reading supplier.js model:', error.message);
  }
}

// Function to examine the router file
async function examineSupplierRouter() {
  const routesDir = path.join(__dirname, 'backend', 'routes');
  
  if (!fs.existsSync(routesDir)) {
    console.error('❌ routes directory not found');
    return;
  }
  
  // Look for supplier route file
  const files = fs.readdirSync(routesDir);
  const routeFile = files.find(file => 
    file.toLowerCase().includes('supplier') || 
    file.toLowerCase().includes('vendor')
  );
  
  if (!routeFile) {
    console.error('❌ Supplier route file not found');
    
    // Look for procurement routes
    const procurementRouteFile = files.find(file => 
      file.toLowerCase().includes('procurement')
    );
    
    if (procurementRouteFile) {
      console.log(`🔍 Found procurement route file: ${procurementRouteFile}`);
      
      // Check if supplier routes are defined in procurement routes
      const procurementRoutePath = path.join(routesDir, procurementRouteFile);
      const content = fs.readFileSync(procurementRoutePath, 'utf8');
      
      if (content.includes('supplier')) {
        console.log('✅ Supplier routes found in procurement routes');
        
        // Extract supplier routes
        const supplierRoutes = content.match(/router\.(get|post|put|delete)\(['"][^'"]*supplier[^'"]*['"][^)]+\)/g) || [];
        
        console.log('📄 Supplier routes:');
        supplierRoutes.forEach(route => {
          console.log(`  - ${route}`);
        });
      } else {
        console.log('❌ Supplier routes not found in procurement routes');
      }
    } else {
      console.log('❌ No procurement route file found');
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

// Function to test the API endpoint
async function testSupplierAPI() {
  const BASE_URL = 'http://localhost:8888/api';
  
  console.log('\n🔍 Testing supplier API endpoint:');
  
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
      console.log('\n🔍 Testing GET /api/procurement/supplier');
      
      const response = await axios.get(`${BASE_URL}/procurement/supplier`, {
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
      console.log('❌ Error testing supplier endpoint:');
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
  console.log('🚀 Starting Supplier debugging');
  await examineSupplier();
  await examineSupplierController();
  await examineSupplierModel();
  await examineSupplierRouter();
  await testSupplierAPI();
  console.log('\n✅ Debugging complete');
  sequelize.close();
}

main().catch(console.error);
