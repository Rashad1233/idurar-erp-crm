const sequelize = require('../config/postgresql');
const { DataTypes } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function createUserUnspscFavoritesTable() {
  try {
    // Define the UserUnspscFavorite model directly (not using the model file to avoid circular dependencies)
    const UserUnspscFavorite = sequelize.define('UserUnspscFavorite', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      unspscCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      level: {
        type: DataTypes.ENUM('SEGMENT', 'FAMILY', 'CLASS', 'COMMODITY'),
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      segment: {
        type: DataTypes.STRING,
        allowNull: true
      },
      family: {
        type: DataTypes.STRING,
        allowNull: true
      },
      class: {
        type: DataTypes.STRING,
        allowNull: true
      },
      commodity: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      tableName: 'user_unspsc_favorites',
      timestamps: true
    });

    // Sync the model with the database
    console.log('Creating UserUnspscFavorite table...');
    await UserUnspscFavorite.sync({ force: false, alter: true });
    console.log('UserUnspscFavorite table created successfully');

    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating UserUnspscFavorite table:', error);
    process.exit(1);
  }
}

// Run the migration
createUserUnspscFavoritesTable();
