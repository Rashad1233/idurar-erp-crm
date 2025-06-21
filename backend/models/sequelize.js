const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');
const bcrypt = require('bcrypt');

if (!config.database) {
  throw new Error('Database configuration is missing in config.js');
}

// Initialize Sequelize with configuration
const sequelize = new Sequelize(
  'erpdb',
  'postgres',
  'UHm8g167',  // Use the exact password from .env
  {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
      freezeTableName: false // Make sure Sequelize pluralizes table names
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const User = require('./sequelize/User')(sequelize, DataTypes);
const Contract = require('./sequelize/Contract')(sequelize, DataTypes);
const PurchaseRequisition = require('./sequelize/PurchaseRequisition')(sequelize, DataTypes);
const PurchaseRequisitionItem = require('./sequelize/PurchaseRequisitionItem')(sequelize, DataTypes);
const Supplier = require('./sequelize/Supplier')(sequelize, DataTypes);
const ItemMaster = require('./sequelize/ItemMaster')(sequelize, DataTypes);
const Inventory = require('./sequelize/Inventory')(sequelize, DataTypes);
const UnspscCode = require('./sequelize/UnspscCode')(sequelize, DataTypes);
const Warehouse = require('./sequelize/Warehouse')(sequelize, DataTypes);
const RejectionNotification = require('./rejectionNotification')(sequelize, DataTypes);
const UnspscBreakdown = require('./unspscBreakdown')(sequelize, DataTypes);

// Run model associations
Object.values(sequelize.models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(sequelize.models));

module.exports = {
  sequelize,
  User,
  PurchaseRequisition,
  PurchaseRequisitionItem,
  Contract,
  Supplier,
  ItemMaster,
  Inventory,
  UnspscCode,
  Warehouse,
  RejectionNotification,
  UnspscBreakdown
};
