// Simple PostgreSQL connection test
require('dotenv').config();

const { Client } = require('pg');

const config = {
  user: String(process.env.POSTGRES_USER || 'postgres'),
  password: String(process.env.POSTGRES_PASSWORD || 'UHm8g167'),
  host: String(process.env.POSTGRES_HOST || 'localhost'),
  port: parseInt(process.env.POSTGRES_PORT || 5432),
  database: String(process.env.POSTGRES_DB || 'erpdb'),
};

console.log('Testing PostgreSQL connection with config:');
console.log({
  user: config.user,
  password: '***',
  host: config.host,
  port: config.port,
  database: config.database
});

async function testConnection() {
  const client = new Client(config);
  
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('PostgreSQL connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

testConnection();
