const { Client } = require('pg');
const config = require('./db-config');

async function testConnection() {
  const client = new Client(config);
  try {
    await client.connect();
    console.log('Database connection successful!');
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await client.end();
  }
}

testConnection();
