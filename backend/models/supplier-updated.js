const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Supplier extends Model {
    static associate(models) {
      // Define associations
      Supplier.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdBy'
      });
      
      Supplier.belongsTo(models.User, {
        foreignKey: 'updatedById',
        as: 'updatedBy'
      });
      
      Supplier.hasMany(models.Contract, {
        foreignKey: 'supplierId',
        as: 'contracts'
      });
      
      Supplier.hasMany(models.PurchaseOrder, {
        foreignKey: 'supplierId',
        as: 'purchaseOrders'
      });
      
      // Add any other associations
      Supplier.hasMany(models.PurchaseRequisitionItem, {
        foreignKey: 'supplierId',
        as: 'purchaseRequisitionItems'
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
        type: DataTypes.STRING
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
        type: DataTypes.STRING,
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
      // Add timestamps
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      // Add snake_case versions for compatibility
      created_at: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.createdAt;
        },
        set(value) {
          this.setDataValue('createdAt', value);
        }
      },
      updated_at: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.updatedAt;
        },
        set(value) {
          this.setDataValue('updatedAt', value);
        }
      }
    },
    {
      sequelize,
      modelName: 'Supplier',
      tableName: 'Suppliers', // Match the actual table name in the database
      timestamps: true,
      underscored: false // Set to false since table uses camelCase
    }
  );

  return Supplier;
};
