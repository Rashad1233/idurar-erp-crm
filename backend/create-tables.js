// Script to create tables for ItemMaster and UnspscCode
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');

// Initialize sequelize
const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: 'postgres',
  logging: console.log
});

// Load all models
const models = {};
const modelsDir = path.join(__dirname, './models');

// Read model files
const modelFiles = fs.readdirSync(modelsDir).filter(file => {
  return (
    file.indexOf('.') !== 0 &&
    file !== 'index.js' &&
    file !== 'sequelize.js' &&
    file.slice(-3) === '.js'
  );
});

// Import models
for (const file of modelFiles) {
  const model = require(path.join(modelsDir, file))(sequelize);
  models[model.name] = model;
}

// Apply associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sync the database
async function syncDatabase() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
    
    // Close the connection
    await sequelize.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

// Run the sync
syncDatabase();
