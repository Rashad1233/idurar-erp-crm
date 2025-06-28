const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testConnection(config) {
  const client = new Client(config);
  
  try {
    console.log('\nTesting connection...');
    await client.connect();
    console.log('✓ Successfully connected to database!');
    
    const result = await client.query('SELECT current_database(), current_user');
    console.log(`✓ Connected to database: ${result.rows[0].current_database}`);
    console.log(`✓ Connected as user: ${result.rows[0].current_user}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    await client.end().catch(() => {});
    return false;
  }
}

async function setupDatabase() {
  console.log('=== PostgreSQL Database Connection Setup ===\n');
  
  // Get connection details
  const host = await question('Enter PostgreSQL host (default: localhost): ') || 'localhost';
  const port = await question('Enter PostgreSQL port (default: 5432): ') || '5432';
  const database = await question('Enter database name (default: erpdb): ') || 'erpdb';
  const user = await question('Enter PostgreSQL username (default: postgres): ') || 'postgres';
  const password = await question('Enter PostgreSQL password: ');
  
  const config = {
    host,
    port: parseInt(port),
    database,
    user,
    password
  };
  
  // Test the connection
  const success = await testConnection(config);
  
  if (success) {
    console.log('\n✓ Database connection successful!');
    
    // Save configuration
    const saveConfig = await question('\nSave this configuration? (y/n): ');
    
    if (saveConfig.toLowerCase() === 'y') {
      const fs = require('fs');
      const configContent = `// Database configuration for ERP system
const dbConfig = {
  user: '${user}',
  host: '${host}',
  database: '${database}',
  password: '${password}',
  port: ${port},
};

module.exports = dbConfig;
`;
      
      fs.writeFileSync('db-config.js', configContent);
      console.log('✓ Configuration saved to db-config.js');
      
      // Update test-database-setup.js to use the new config
      const testScript = fs.readFileSync('test-database-setup.js', 'utf8');
      const updatedScript = testScript.replace(
        /const dbConfig = {[\s\S]*?};/,
        "const dbConfig = require('./db-config.js');"
      );
      fs.writeFileSync('test-database-setup.js', updatedScript);
      console.log('✓ Updated test-database-setup.js to use saved configuration');
    }
    
    // Ask if user wants to run the database test
    const runTest = await question('\nRun database setup test now? (y/n): ');
    
    if (runTest.toLowerCase() === 'y') {
      rl.close();
      console.log('\n=== Running Database Setup Test ===\n');
      require('./test-database-setup.js');
    } else {
      rl.close();
    }
  } else {
    console.log('\n✗ Could not connect to database. Please check your credentials and try again.');
    
    const retry = await question('\nRetry with different credentials? (y/n): ');
    
    if (retry.toLowerCase() === 'y') {
      rl.close();
      console.log('\n');
      setupDatabase();
    } else {
      rl.close();
    }
  }
}

// Run the setup
setupDatabase().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
