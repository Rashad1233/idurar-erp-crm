const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Supplier extends Model {
    static associate(models) {
      // Define associations here
      this.hasMany(models.Contract, {
        foreignKey: 'supplierId',
        as: 'contracts'
      });
    }
  }

  Supplier.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      phone: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.TEXT
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'pending'),
        defaultValue: 'pending'
      },
      taxId: {
        type: DataTypes.STRING
      },
      paymentTerms: {
        type: DataTypes.STRING
      },
      bankAccount: {
        type: DataTypes.STRING
      },
      contactPerson: {
        type: DataTypes.STRING
      },
      category: {
        type: DataTypes.STRING
      },
      rating: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
          max: 5
        }
      },
      notes: {
        type: DataTypes.TEXT
      }
    },
    {
      sequelize,
      modelName: 'Supplier',
      timestamps: true
    }
  );

  return Supplier;
};
