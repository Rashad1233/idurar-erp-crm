// Test updated postgresql config
require('dotenv').config();
const sequelize = require('../config/postgresql');

async function testConnection() {
  try {
    console.log('Testing updated PostgreSQL config...');
    await sequelize.authenticate();
    console.log('Connection successful!');
  } catch (error) {
    console.error('Connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
