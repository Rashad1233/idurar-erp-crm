// Enhanced Supplier model with proper associations and table definition
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Supplier extends Model {
    static associate(models) {
      // Define associations here
      this.hasMany(models.Contract, {
        foreignKey: 'supplierId',
        as: 'contracts'
      });
      
      this.hasMany(models.PurchaseOrder, {
        foreignKey: 'supplierId',
        as: 'purchaseOrders'
      });
      
      this.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdBy'
      });
      
      this.belongsTo(models.User, {
        foreignKey: 'updatedById',
        as: 'updatedBy'
      });
    }
  }

  Supplier.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      supplierNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      legalName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tradeName: {
        type: DataTypes.STRING
      },
      contactEmail: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true
        }
      },
      contactEmailSecondary: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true
        }
      },
      contactPhone: {
        type: DataTypes.STRING
      },
      contactName: {
        type: DataTypes.STRING
      },
      complianceChecked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      supplierType: {
        type: DataTypes.ENUM('transactional', 'strategic', 'preferred'),
        defaultValue: 'transactional'
      },
      paymentTerms: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.TEXT
      },
      city: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      country: {
        type: DataTypes.STRING
      },
      postalCode: {
        type: DataTypes.STRING
      },
      taxId: {
        type: DataTypes.STRING
      },
      registrationNumber: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'pending', 'blocked'),
        defaultValue: 'active'
      },
      notes: {
        type: DataTypes.TEXT
      },
      createdById: {
        type: DataTypes.UUID,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      updatedById: {
        type: DataTypes.UUID,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      created_at: {
        type: DataTypes.DATE
      },
      updated_at: {
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: 'Supplier',
      tableName: 'Suppliers',
      timestamps: true,
      underscored: false, // Set to false because the actual DB table uses camelCase
      hooks: {
        beforeCreate: (supplier) => {
          supplier.created_at = new Date();
          supplier.updated_at = new Date();
        },
        beforeUpdate: (supplier) => {
          supplier.updated_at = new Date();
        }
      }
    }
  );

  return Supplier;
};
