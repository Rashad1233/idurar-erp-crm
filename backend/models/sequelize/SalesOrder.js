module.exports = (sequelize, DataTypes) => {
  const SalesOrder = sequelize.define('SalesOrder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    soNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true, // Allow null for walk-in customers
      references: {
        model: 'Customers',
        key: 'id',
      },
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'For walk-in customers without customer record',
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 18.00,
      comment: 'VAT rate as percentage (e.g., 18.00 for 18%)',
    },
    vatAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed', 'none'),
      defaultValue: 'none',
    },
    discountValue: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      comment: 'Discount percentage or fixed amount',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'mobile', 'bank_transfer', 'check', 'other'),
      defaultValue: 'cash',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'partial', 'refunded'),
      defaultValue: 'pending',
    },
    orderStatus: {
      type: DataTypes.ENUM('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'draft',
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    salesPersonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    storeLocation: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Main Store',
    },
    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    barcodeScanned: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of scanned barcodes for audit trail',
    },
    seasonalDiscount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Additional seasonal discount percentage',
    },
    specialDiscount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Special promotion discount percentage',
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    }
  }, {
    tableName: 'SalesOrders',
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (salesOrder) => {
        if (!salesOrder.soNumber) {
          // Generate SO number
          const timestamp = Date.now().toString().slice(-8);
          salesOrder.soNumber = `SO-${timestamp}`;
        }
        
        if (!salesOrder.receiptNumber) {
          // Generate receipt number
          const timestamp = Date.now().toString().slice(-6);
          const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          salesOrder.receiptNumber = `RCP-${timestamp}${randomSuffix}`;
        }
        
        // Auto-calculate totals
        salesOrder.vatAmount = (salesOrder.subtotal * salesOrder.vatRate) / 100;
        
        let totalDiscount = 0;
        if (salesOrder.discountType === 'percentage') {
          totalDiscount = (salesOrder.subtotal * salesOrder.discountValue) / 100;
        } else if (salesOrder.discountType === 'fixed') {
          totalDiscount = salesOrder.discountValue;
        }
        
        // Add seasonal and special discounts
        if (salesOrder.seasonalDiscount > 0) {
          totalDiscount += (salesOrder.subtotal * salesOrder.seasonalDiscount) / 100;
        }
        
        if (salesOrder.specialDiscount > 0) {
          totalDiscount += (salesOrder.subtotal * salesOrder.specialDiscount) / 100;
        }
        
        salesOrder.discountAmount = totalDiscount;
        salesOrder.totalAmount = salesOrder.subtotal + salesOrder.vatAmount - salesOrder.discountAmount;
      },
      
      beforeUpdate: async (salesOrder) => {
        if (salesOrder.changed('subtotal') || salesOrder.changed('vatRate') || 
            salesOrder.changed('discountType') || salesOrder.changed('discountValue') ||
            salesOrder.changed('seasonalDiscount') || salesOrder.changed('specialDiscount')) {
          
          // Recalculate VAT
          salesOrder.vatAmount = (salesOrder.subtotal * salesOrder.vatRate) / 100;
          
          // Recalculate discounts
          let totalDiscount = 0;
          if (salesOrder.discountType === 'percentage') {
            totalDiscount = (salesOrder.subtotal * salesOrder.discountValue) / 100;
          } else if (salesOrder.discountType === 'fixed') {
            totalDiscount = salesOrder.discountValue;
          }
          
          // Add seasonal and special discounts
          if (salesOrder.seasonalDiscount > 0) {
            totalDiscount += (salesOrder.subtotal * salesOrder.seasonalDiscount) / 100;
          }
          
          if (salesOrder.specialDiscount > 0) {
            totalDiscount += (salesOrder.subtotal * salesOrder.specialDiscount) / 100;
          }
          
          salesOrder.discountAmount = totalDiscount;
          salesOrder.totalAmount = salesOrder.subtotal + salesOrder.vatAmount - salesOrder.discountAmount;
        }
      }
    }
  });

  SalesOrder.associate = (models) => {
    SalesOrder.hasMany(models.SalesOrderItem, {
      foreignKey: 'salesOrderId',
      as: 'items'
    });
    
    SalesOrder.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });
    
    SalesOrder.belongsTo(models.User, {
      foreignKey: 'salesPersonId',
      as: 'salesperson'
    });
    
    SalesOrder.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy'
    });
    
    SalesOrder.belongsTo(models.User, {
      foreignKey: 'updatedById',
      as: 'updatedBy'
    });
  };

  return SalesOrder;
};module.exports = (sequelize, DataTypes) => {
  const SalesOrder = sequelize.define('SalesOrder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    soNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true, // Allow null for walk-in customers
      references: {
        model: 'Customers',
        key: 'id',
      },
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'For walk-in customers without customer record',
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 18.00,
      comment: 'VAT rate as percentage (e.g., 18.00 for 18%)',
    },
    vatAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed', 'none'),
      defaultValue: 'none',
    },
    discountValue: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      comment: 'Discount percentage or fixed amount',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'mobile', 'bank_transfer', 'check', 'other'),
      defaultValue: 'cash',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'partial', 'refunded'),
      defaultValue: 'pending',
    },
    orderStatus: {
      type: DataTypes.ENUM('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'draft',
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    salesPersonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    storeLocation: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Main Store',
    },
    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    barcodeScanned: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of scanned barcodes for audit trail',
    },
    seasonalDiscount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Additional seasonal discount percentage',
    },
    specialDiscount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Special promotion discount percentage',
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    }
  }, {
    tableName: 'SalesOrders',
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (salesOrder) => {
        if (!salesOrder.soNumber) {
          // Generate SO number
          const timestamp = Date.now().toString().slice(-8);
          salesOrder.soNumber = `SO-${timestamp}`;
        }
        
        if (!salesOrder.receiptNumber) {
          // Generate receipt number
          const timestamp = Date.now().toString().slice(-6);
          const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          salesOrder.receiptNumber = `RCP-${timestamp}${randomSuffix}`;
        }
        
        // Auto-calculate totals
        salesOrder.vatAmount = (salesOrder.subtotal * salesOrder.vatRate) / 100;
        
        let totalDiscount = 0;
        if (salesOrder.discountType === 'percentage') {
          totalDiscount = (salesOrder.subtotal * salesOrder.discountValue) / 100;
        } else if (salesOrder.discountType === 'fixed') {
          totalDiscount = salesOrder.discountValue;
        }
        
        // Add seasonal and special discounts
        if (salesOrder.seasonalDiscount > 0) {
          totalDiscount += (salesOrder.subtotal * salesOrder.seasonalDiscount) / 100;
        }
        
        if (salesOrder.specialDiscount > 0) {
          totalDiscount += (salesOrder.subtotal * salesOrder.specialDiscount) / 100;
        }
        
        salesOrder.discountAmount = totalDiscount;
        salesOrder.totalAmount = salesOrder.subtotal + salesOrder.vatAmount - salesOrder.discountAmount;
      },
      
      beforeUpdate: async (salesOrder) => {
        if (salesOrder.changed('subtotal') || salesOrder.changed('vatRate') || 
            salesOrder.changed('discountType') || salesOrder.changed('discountValue') ||
            salesOrder.changed('seasonalDiscount') || salesOrder.changed('specialDiscount')) {
          
          // Recalculate VAT
          salesOrder.vatAmount = (salesOrder.subtotal * salesOrder.vatRate) / 100;
          
          // Recalculate discounts
          let totalDiscount = 0;
          if (salesOrder.discountType === 'percentage') {
            totalDiscount = (salesOrder.subtotal * salesOrder.discountValue) / 100;
          } else if (salesOrder.discountType === 'fixed') {
            totalDiscount = salesOrder.discountValue;
          }
          
          // Add seasonal and special discounts
          if (salesOrder.seasonalDiscount > 0) {
            totalDiscount += (salesOrder.subtotal * salesOrder.seasonalDiscount) / 100;
          }
          
          if (salesOrder.specialDiscount > 0) {
            totalDiscount += (salesOrder.subtotal * salesOrder.specialDiscount) / 100;
          }
          
          salesOrder.discountAmount = totalDiscount;
          salesOrder.totalAmount = salesOrder.subtotal + salesOrder.vatAmount - salesOrder.discountAmount;
        }
      }
    }
  });

  SalesOrder.associate = (models) => {
    SalesOrder.hasMany(models.SalesOrderItem, {
      foreignKey: 'salesOrderId',
      as: 'items'
    });
    
    SalesOrder.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });
    
    SalesOrder.belongsTo(models.User, {
      foreignKey: 'salesPersonId',
      as: 'salesperson'
    });
    
    SalesOrder.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy'
    });
    
    SalesOrder.belongsTo(models.User, {
      foreignKey: 'updatedById',
      as: 'updatedBy'
    });
  };

  return SalesOrder;
};