const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Contract extends Model {
    static associate(models) {
      this.belongsTo(models.Supplier, {
        foreignKey: 'supplierId',
        as: 'supplier'
      });
      
      this.hasMany(models.PurchaseRequisitionItem, {
        foreignKey: 'contractId',
        as: 'purchaseRequisitionItems'
      });
    }
  }

  Contract.init({    id: {
      type: DataTypes.INTEGER,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    contractNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'suppliers',
        key: 'id'
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'expired', 'terminated'),
      defaultValue: 'draft'
    },
    termsAndConditions: {
      type: DataTypes.TEXT
    },
    paymentTerms: {
      type: DataTypes.TEXT
    },
    incoterms: {
      type: DataTypes.STRING
    },
    defaultLeadTime: {
      type: DataTypes.INTEGER,
      comment: 'Default lead time in days'
    }
  }, {
    sequelize,
    modelName: 'Contract',
    tableName: 'contracts',
    timestamps: true
  });

  return Contract;
};
