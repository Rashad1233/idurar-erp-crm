const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const config = require('./postgresql');

// MongoDB connection
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// PostgreSQL connection using Sequelize
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'erpdb',
  process.env.POSTGRES_USER || 'postgres',
  String(process.env.POSTGRES_PASSWORD || 'UHm8g167'),
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    dialect: 'postgres',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    logging: console.log, // Enable logging for debugging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connection has been established successfully.');
    
    // Sync all models - development only
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('All models synchronized successfully.');
    }
    
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error);
    throw error;
  }
};

module.exports = { connectMongoDB, sequelize, connectPostgres };
