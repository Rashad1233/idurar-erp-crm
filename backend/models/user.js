const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      if (models.PurchaseRequisition) {
        this.hasMany(models.PurchaseRequisition, {
          foreignKey: 'requestorId',
          as: 'requisitions'
        });
      }

      if (models.PurchaseRequisitionApproval) {
        this.hasMany(models.PurchaseRequisitionApproval, {
          foreignKey: 'approverId',
          as: 'approvals'
        });
      }

      // SalesOrder associations
      if (models.SalesOrder) {
        this.hasMany(models.SalesOrder, { foreignKey: 'salesPersonId', as: 'salesPersonOrders' });
        this.hasMany(models.SalesOrder, { foreignKey: 'createdById', as: 'createdOrders' });
        this.hasMany(models.SalesOrder, { foreignKey: 'updatedById', as: 'updatedOrders' });
      }
    }    async validPassword(password) {
      try {
        if (!this.password) {
          console.error('No password hash found in user object');
          return false;
        }
        return await bcrypt.compare(password, this.password);
      } catch (error) {
        console.error('Error validating password:', error);
        return false;
      }
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('admin', 'user', 'approver'),
        defaultValue: 'user'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: DataTypes.DATE
      }
    },    {
      sequelize,
      modelName: 'User',
      tableName: 'Users', // Explicitly set table name to match migration
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
    }
  );

  return User;
};
