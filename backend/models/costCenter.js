const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CostCenter extends Model {
    static associate(models) {
      this.hasMany(models.PurchaseRequisition, {
        foreignKey: 'costCenterId',
        as: 'purchaseRequisitions'
      });

      this.hasMany(models.ApprovalThreshold, {
        foreignKey: 'costCenterId',
        as: 'approvalThresholds'
      });
    }
  }

  CostCenter.init({    id: {
      type: DataTypes.INTEGER,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'CostCenter',
    tableName: 'cost_centers',
    timestamps: true
  });

  return CostCenter;
};
