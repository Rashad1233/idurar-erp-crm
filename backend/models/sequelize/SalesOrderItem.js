module.exports = (sequelize, DataTypes) => {
  const SalesOrderItem = sequelize.define('SalesOrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    salesOrderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'SalesOrders',
        key: 'id',
      },
    },
    itemMasterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ItemMasters',
        key: 'id',
      },
    },
    itemNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Scanned or entered barcode',
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 1.00,
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'EACH',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    discount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      comment: 'Item-level discount amount',
    },
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Item-level discount percentage',
    },
    lineTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    vatApplicable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 18.00,
    },
    vatAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Item category (shirt, trousers, etc.)',
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    returnedQuantity: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'returned', 'cancelled'),
      defaultValue: 'active',
    }
  }, {
    tableName: 'SalesOrderItems',
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (item) => {
        // Calculate line total before discount
        const baseTotal = item.quantity * item.unitPrice;
        
        // Apply item-level discount
        let discountAmount = 0;
        if (item.discountPercent > 0) {
          discountAmount = (baseTotal * item.discountPercent) / 100;
        } else if (item.discount > 0) {
          discountAmount = item.discount;
        }
        
        item.lineTotal = baseTotal - discountAmount;
        
        // Calculate VAT if applicable
        if (item.vatApplicable) {
          item.vatAmount = (item.lineTotal * item.vatRate) / 100;
        }
      },
      
      beforeUpdate: async (item) => {
        if (item.changed('quantity') || item.changed('unitPrice') || 
            item.changed('discount') || item.changed('discountPercent') ||
            item.changed('vatRate') || item.changed('vatApplicable')) {
          
          // Recalculate line total
          const baseTotal = item.quantity * item.unitPrice;
          
          // Apply item-level discount
          let discountAmount = 0;
          if (item.discountPercent > 0) {
            discountAmount = (baseTotal * item.discountPercent) / 100;
          } else if (item.discount > 0) {
            discountAmount = item.discount;
          }
          
          item.lineTotal = baseTotal - discountAmount;
          
          // Calculate VAT if applicable
          if (item.vatApplicable) {
            item.vatAmount = (item.lineTotal * item.vatRate) / 100;
          } else {
            item.vatAmount = 0;
          }
        }
      }
    }
  });

  SalesOrderItem.associate = (models) => {
    SalesOrderItem.belongsTo(models.SalesOrder, {
      foreignKey: 'salesOrderId',
      as: 'salesOrder'
    });
    
    SalesOrderItem.belongsTo(models.ItemMaster, {
      foreignKey: 'itemMasterId',
      as: 'itemMaster'
    });
  };

  return SalesOrderItem;
};module.exports = (sequelize, DataTypes) => {
  const SalesOrderItem = sequelize.define('SalesOrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    salesOrderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'SalesOrders',
        key: 'id',
      },
    },
    itemMasterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ItemMasters',
        key: 'id',
      },
    },
    itemNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Scanned or entered barcode',
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 1.00,
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'EACH',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    discount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      comment: 'Item-level discount amount',
    },
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Item-level discount percentage',
    },
    lineTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    vatApplicable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 18.00,
    },
    vatAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Item category (shirt, trousers, etc.)',
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    returnedQuantity: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'returned', 'cancelled'),
      defaultValue: 'active',
    }
  }, {
    tableName: 'SalesOrderItems',
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (item) => {
        // Calculate line total before discount
        const baseTotal = item.quantity * item.unitPrice;
        
        // Apply item-level discount
        let discountAmount = 0;
        if (item.discountPercent > 0) {
          discountAmount = (baseTotal * item.discountPercent) / 100;
        } else if (item.discount > 0) {
          discountAmount = item.discount;
        }
        
        item.lineTotal = baseTotal - discountAmount;
        
        // Calculate VAT if applicable
        if (item.vatApplicable) {
          item.vatAmount = (item.lineTotal * item.vatRate) / 100;
        }
      },
      
      beforeUpdate: async (item) => {
        if (item.changed('quantity') || item.changed('unitPrice') || 
            item.changed('discount') || item.changed('discountPercent') ||
            item.changed('vatRate') || item.changed('vatApplicable')) {
          
          // Recalculate line total
          const baseTotal = item.quantity * item.unitPrice;
          
          // Apply item-level discount
          let discountAmount = 0;
          if (item.discountPercent > 0) {
            discountAmount = (baseTotal * item.discountPercent) / 100;
          } else if (item.discount > 0) {
            discountAmount = item.discount;
          }
          
          item.lineTotal = baseTotal - discountAmount;
          
          // Calculate VAT if applicable
          if (item.vatApplicable) {
            item.vatAmount = (item.lineTotal * item.vatRate) / 100;
          } else {
            item.vatAmount = 0;
          }
        }
      }
    }
  });

  SalesOrderItem.associate = (models) => {
    SalesOrderItem.belongsTo(models.SalesOrder, {
      foreignKey: 'salesOrderId',
      as: 'salesOrder'
    });
    
    SalesOrderItem.belongsTo(models.ItemMaster, {
      foreignKey: 'itemMasterId',
      as: 'itemMaster'
    });
  };

  return SalesOrderItem;
};