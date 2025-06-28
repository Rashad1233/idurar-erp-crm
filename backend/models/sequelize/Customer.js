module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'US',
    },
    customerType: {
      type: DataTypes.ENUM('individual', 'business', 'walk-in'),
      defaultValue: 'individual',
    },
    taxId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creditLimit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    paymentTerms: {
      type: DataTypes.STRING,
      defaultValue: 'Cash',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'Customers',
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (customer) => {
        if (!customer.customerNumber) {
          // Generate customer number
          const timestamp = Date.now().toString().slice(-6);
          const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
          customer.customerNumber = `CUST-${timestamp}${randomSuffix}`;
        }
      }
    }
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.SalesOrder, {
      foreignKey: 'customerId',
      as: 'salesOrders'
    });
    
    Customer.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy'
    });
    
    Customer.belongsTo(models.User, {
      foreignKey: 'updatedById',
      as: 'updatedBy'
    });
  };

  return Customer;
};module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'US',
    },
    customerType: {
      type: DataTypes.ENUM('individual', 'business', 'walk-in'),
      defaultValue: 'individual',
    },
    taxId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creditLimit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    paymentTerms: {
      type: DataTypes.STRING,
      defaultValue: 'Cash',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'Customers',
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (customer) => {
        if (!customer.customerNumber) {
          // Generate customer number
          const timestamp = Date.now().toString().slice(-6);
          const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
          customer.customerNumber = `CUST-${timestamp}${randomSuffix}`;
        }
      }
    }
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.SalesOrder, {
      foreignKey: 'customerId',
      as: 'salesOrders'
    });
    
    Customer.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy'
    });
    
    Customer.belongsTo(models.User, {
      foreignKey: 'updatedById',
      as: 'updatedBy'
    });
  };

  return Customer;
};