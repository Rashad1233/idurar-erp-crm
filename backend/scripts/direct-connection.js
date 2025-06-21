// Direct connection test script
require('dotenv').config();
const { Sequelize } = require('sequelize');

async function testDirectConnection() {
  // Connect directly without using the exported sequelize instance
  const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: console.log
  });

  try {
    console.log('Attempting to connect to PostgreSQL...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Try a simple query
    console.log('Executing query...');
    const [results] = await sequelize.query('SELECT * FROM "Users" LIMIT 5;');
    console.log('Query results:', JSON.stringify(results, null, 2));

    await sequelize.close();
    console.log('Connection closed successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testDirectConnection();
