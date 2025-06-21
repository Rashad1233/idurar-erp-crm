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

// Function to check database tables and their columns
async function checkTables() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');

    // Get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('📋 Tables in database:');
    console.log(tables.map(t => t.table_name).join(', '));

    // Check critical tables
    const criticalTables = ['purchase_requisition', 'inventory', 'supplier', 'user'];
    for (const table of criticalTables) {
      try {
        const [columns] = await sequelize.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = '${table}'
        `);
        
        console.log(`\n🔍 Table '${table}' columns:`);
        columns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      } catch (error) {
        console.error(`❌ Error checking table '${table}':`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

// Function to check API endpoints
async function checkEndpoints() {
  const BASE_URL = 'http://localhost:8888/api';
  const endpoints = [
    '/procurement/purchase-requisition',
    '/inventory',
    '/procurement/supplier',
    '/item',
    '/rfq/list',
    '/purchase-order/list'
  ];

  console.log('\n🔍 Checking API endpoints:');
  
  // First get a token by logging in
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@demo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Successfully logged in and obtained token');

    // Check each endpoint
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Testing endpoint: ${endpoint}`);
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Status: ${response.status}`);
        console.log(`📊 Data structure: ${JSON.stringify(Object.keys(response.data))}`);
        console.log(`🔢 Items count: ${response.data.result ? response.data.result.length : 'N/A'}`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
          console.log(`📄 Status: ${error.response.status}`);
          console.log(`📄 Error details: ${JSON.stringify(error.response.data)}`);
        }
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

// Function to debug the backend controller files
async function examineControllers() {
  const backendDir = path.join(__dirname, 'backend');
  const controllersDir = path.join(backendDir, 'controllers');
  
  console.log('\n🔍 Examining controller files:');
  
  const criticalControllers = [
    'purchaseRequisitionController.js',
    'inventoryController.js',
    'supplierController.js',
    'itemController.js'
  ];
  
  for (const controllerFile of criticalControllers) {
    const filePath = path.join(controllersDir, controllerFile);
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`\n📄 ${controllerFile}:`);
        
        // Look for potential issues in the controller
        const modelNames = content.match(/require\(['"]\.\.\/models\/([^'"]+)['"]\)/g) || [];
        console.log(`  - Referenced models: ${modelNames.join(', ')}`);
        
        const methodsMatch = content.match(/exports\.([a-zA-Z0-9_]+)\s*=\s*async/g) || [];
        const methods = methodsMatch.map(m => m.replace(/exports\.|=\s*async/g, '').trim());
        console.log(`  - Defined methods: ${methods.join(', ')}`);
        
        // Check for common issues
        const issues = [];
        if (content.includes('camelCase') && content.includes('snake_case')) {
          issues.push('Mixed camelCase and snake_case naming');
        }
        if (content.includes('.findAll(') && !content.includes('try {')) {
          issues.push('Missing try/catch around database queries');
        }
        if (content.includes('.findAll(') && !content.includes('attributes:')) {
          issues.push('No attribute selection in queries (fetching all columns)');
        }
        
        console.log(`  - Potential issues: ${issues.length ? issues.join(', ') : 'None detected'}`);
      } else {
        console.log(`❌ Controller file not found: ${controllerFile}`);
      }
    } catch (error) {
      console.error(`❌ Error examining ${controllerFile}:`, error.message);
    }
  }
}

// Function to debug model files
async function examineModels() {
  const backendDir = path.join(__dirname, 'backend');
  const modelsDir = path.join(backendDir, 'models');
  
  console.log('\n🔍 Examining model files:');
  
  const criticalModels = [
    'purchaseRequisition.js',
    'inventory.js',
    'supplier.js',
    'item.js'
  ];
  
  for (const modelFile of criticalModels) {
    const filePath = path.join(modelsDir, modelFile);
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`\n📄 ${modelFile}:`);
        
        // Check for field definitions
        const fieldMatches = content.match(/([a-zA-Z0-9_]+):\s*{[^}]+}/g) || [];
        const fields = fieldMatches.map(m => m.split(':')[0].trim());
        console.log(`  - Defined fields: ${fields.join(', ')}`);
        
        // Check for timestamps settings
        const timestampsMatch = content.match(/timestamps:\s*(true|false)/);
        console.log(`  - Timestamps: ${timestampsMatch ? timestampsMatch[1] : 'Not specified'}`);
        
        // Check for common issues
        const issues = [];
        if (!content.includes('tableName')) {
          issues.push('No explicit tableName defined');
        }
        if (content.includes('camelCase') && content.includes('snake_case')) {
          issues.push('Mixed camelCase and snake_case naming');
        }
        if (!content.includes('timestamps')) {
          issues.push('Timestamps setting not explicit');
        }
        
        console.log(`  - Potential issues: ${issues.length ? issues.join(', ') : 'None detected'}`);
      } else {
        console.log(`❌ Model file not found: ${modelFile}`);
      }
    } catch (error) {
      console.error(`❌ Error examining ${modelFile}:`, error.message);
    }
  }
}

// Main function
async function main() {
  console.log('🚀 Starting API endpoints debugging');
  await checkTables();
  await checkEndpoints();
  await examineControllers();
  await examineModels();
  console.log('\n✅ Debugging complete');
  sequelize.close();
}

main().catch(console.error);
