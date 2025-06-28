const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'staff', 'manager', 'inventory_manager', 'warehouse_manager', 'procurement_manager'),
      defaultValue: 'staff',
    },
    createItemMaster: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    editItemMaster: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    approveItemMaster: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    setInventoryLevels: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createReorderRequests: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    approveReorderRequests: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    warehouseTransactions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }  }, {
    tableName: 'Users',
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance method to compare passwords
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.associate = (models) => {
    if (models.Notification) {
      User.hasMany(models.Notification, {
        foreignKey: 'actionById',
        as: 'notifications'
      });
    }
  };

  return User;
};
