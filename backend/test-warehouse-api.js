// This script tests the connection to the warehouse API endpoints
const axios = require('axios');
const { Pool } = require('pg');
const fs = require('fs');

// Debug flag
const DEBUG = true;

// Log function for debugging
function debug(message, data) {
  if (DEBUG) {
    console.log(`DEBUG: ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  }
}

// PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'UHm8g167',
});

// Function to check if tables exist
async function checkTables() {
  try {
    console.log('Checking if database tables exist...');
    
    const tableQueries = [
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'StorageLocations')",
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'BinLocations')",
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Users')",
    ];
    
    for (const query of tableQueries) {
      const result = await pool.query(query);
      console.log(`${query}: ${result.rows[0].exists ? 'Exists' : 'Does not exist'}`);
    }
    
    // Check table structure if it exists
    const tableExists = (await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'StorageLocations')")).rows[0].exists;
    
    if (tableExists) {
      console.log('\nChecking StorageLocations table structure:');
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'StorageLocations'
      `);
      
      console.table(columns.rows);
      
      // Check if there are any records
      const count = await pool.query('SELECT COUNT(*) FROM "StorageLocations"');
      console.log(`\nNumber of records in StorageLocations: ${count.rows[0].count}`);
      
      if (parseInt(count.rows[0].count) > 0) {
        const sample = await pool.query('SELECT * FROM "StorageLocations" LIMIT 1');
        console.log('\nSample record:');
        console.log(sample.rows[0]);
      }
    }
  } catch (error) {
    console.error('Database check error:', error.message);
  }
}

// Function to test API endpoints
async function testEndpoints() {
  // Get a token first - Replace with your login credentials
  try {
    console.log('\nTesting API endpoints...');
    
    console.log('Attempting to login to get a token...');
    debug('Login request data', {
      email: 'admin@demo.com',
      password: 'admin123'
    });
    
    const loginResponse = await axios.post('http://localhost:8888/api/login', {
      email: 'admin@demo.com',
      password: 'admin123'
    });
    
    debug('Login response', loginResponse.data);
    
    if (!loginResponse.data.token) {
      console.error('Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('Login successful! Token obtained.');
    fs.writeFileSync('token.txt', token);
    console.log('Token saved to token.txt');
    
    // Test warehouse endpoint
    console.log('\nTesting /api/warehouse/storage-location endpoint...');
    try {
      debug('Request headers', {
        'Authorization': `Bearer ${token}`
      });
      
      const warehouseResponse = await axios.get('http://localhost:8888/api/warehouse/storage-location', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', warehouseResponse.status);
      console.log('Response data:', JSON.stringify(warehouseResponse.data, null, 2));
    } catch (error) {
      console.error('Warehouse API error:', error.response ? {
        status: error.response.status,
        data: error.response.data
      } : error.message);
      
      debug('Full error', error);
    }
  } catch (error) {
    console.error('API test error:', error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);
    
    debug('Full error', error);
  }
  }
}

// Main function
async function main() {
  try {
    await checkTables();
    await testEndpoints();
  } catch (error) {
    console.error('Main error:', error.message);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the script
main();
