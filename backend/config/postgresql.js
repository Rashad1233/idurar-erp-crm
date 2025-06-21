// Database Configuration with Sequelize initialization
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Ensure password is a string
const password = String(process.env.POSTGRES_PASSWORD || 'UHm8g167');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'erpdb',
  process.env.POSTGRES_USER || 'postgres',
  password,
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    dialect: 'postgres',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    logging: console.log, // Enable logging to debug connection issues
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
