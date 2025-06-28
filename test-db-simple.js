const { Client } = require('pg');

// Common PostgreSQL configurations to try
const configurations = [
  {
    name: 'Default postgres/postgres',
    config: {
      user: 'postgres',
      host: 'localhost',
      database: 'erpdb',
      password: 'postgres',
      port: 5432,
    }
  },
  {
    name: 'Empty password',
    config: {
      user: 'postgres',
      host: 'localhost',
      database: 'erpdb',
      password: '',
      port: 5432,
    }
  },
  {
    name: 'Password as "password"',
    config: {
      user: 'postgres',
      host: 'localhost',
      database: 'erpdb',
      password: 'password',
      port: 5432,
    }
  },
  {
    name: 'Password as "admin"',
    config: {
      user: 'postgres',
      host: 'localhost',
      database: 'erpdb',
      password: 'admin',
      port: 5432,
    }
  },
  {
    name: 'Password as "123456"',
    config: {
      user: 'postgres',
      host: 'localhost',
      database: 'erpdb',
      password: '123456',
      port: 5432,
    }
  }
];

async function testConfiguration(name, config) {
  const client = new Client(config);
  
  try {
    console.log(`\nTrying configuration: ${name}`);
    await client.connect();
    console.log(`✓ SUCCESS! Connected with configuration: ${name}`);
    
    // Test query
    const result = await client.query('SELECT current_database(), version()');
    console.log(`  Database: ${result.rows[0].current_database}`);
    console.log(`  Version: ${result.rows[0].version.split(',')[0]}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`✗ Failed: ${error.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

async function findWorkingConfiguration() {
  console.log('Testing common PostgreSQL configurations...\n');
  
  for (const { name, config } of configurations) {
    const success = await testConfiguration(name, config);
    if (success) {
      console.log('\n=== Working Configuration Found ===');
      console.log('You can use these credentials:');
      console.log(`Host: ${config.host}`);
      console.log(`Port: ${config.port}`);
      console.log(`Database: ${config.database}`);
      console.log(`User: ${config.user}`);
      console.log(`Password: ${config.password}`);
      
      // Save the working configuration
      const fs = require('fs');
      const configContent = `// Database configuration for ERP system
const dbConfig = {
  user: '${config.user}',
  host: '${config.host}',
  database: '${config.database}',
  password: '${config.password}',
  port: ${config.port},
};

module.exports = dbConfig;
`;
      
      fs.writeFileSync('db-config.js', configContent);
      console.log('\n✓ Configuration saved to db-config.js');
      
      return true;
    }
  }
  
  console.log('\n=== No Working Configuration Found ===');
  console.log('None of the common configurations worked.');
  console.log('\nPlease create a file called "db-config.js" with your PostgreSQL credentials:');
  console.log(`
// db-config.js
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'erpdb',
  password: 'YOUR_PASSWORD_HERE',
  port: 5432,
};

module.exports = dbConfig;
`);
  
  return false;
}

// Run the test
findWorkingConfiguration().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
