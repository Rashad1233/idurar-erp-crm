// Test Sequelize connection specifically
require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Environment variables:');
console.log('POSTGRES_PASSWORD type:', typeof process.env.POSTGRES_PASSWORD);
console.log('POSTGRES_PASSWORD value:', process.env.POSTGRES_PASSWORD);

const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: console.log
});

async function testSequelize() {
  try {
    console.log('Testing Sequelize connection...');
    await sequelize.authenticate();
    console.log('Sequelize connection successful!');
  } catch (error) {
    console.error('Sequelize connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testSequelize();
