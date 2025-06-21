const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ApprovalThreshold extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      this.belongsTo(models.CostCenter, {
        foreignKey: 'costCenterId',
        as: 'costCenter'
      });
    }
  }

  ApprovalThreshold.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    costCenterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cost_centers',
        key: 'id'
      }
    },
    threshold: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Maximum amount this user can approve for this cost center'
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Approval level (1 being first level, higher numbers for higher levels)'
    }
  }, {
    sequelize,
    modelName: 'ApprovalThreshold',
    tableName: 'approval_thresholds',
    timestamps: true
  });

  return ApprovalThreshold;
};
