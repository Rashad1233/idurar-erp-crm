module.exports = (sequelize, DataTypes) => {
  // Transaction model
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transactionType: {
      type: DataTypes.ENUM('GR', 'GI', 'GE', 'GT'),
      allowNull: false,
    },
    transactionNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    referenceNumber: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'DRAFT',
    },
    costCenter: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    completedAt: {
      type: DataTypes.DATE,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    completedById: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (transaction, options) => {
        if (!transaction.transactionNumber) {
          const today = new Date();
          const year = today.getFullYear().toString().substr(-2);
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const day = today.getDate().toString().padStart(2, '0');
          
          const prefix = transaction.transactionType;
          const datePart = `${year}${month}${day}`;
          
          // Find the latest transaction with the same prefix and date
          const latestTransaction = await Transaction.findOne({
            where: {
              transactionNumber: {
                [sequelize.Op.like]: `${prefix}${datePart}%`
              }
            },
            order: [['transactionNumber', 'DESC']]
          });
          
          let sequenceNumber = '001';
          if (latestTransaction) {
            const lastSequence = latestTransaction.transactionNumber.substr(-3);
            sequenceNumber = (parseInt(lastSequence, 10) + 1).toString().padStart(3, '0');
          }
          
          transaction.transactionNumber = `${prefix}${datePart}${sequenceNumber}`;
        }
      }
    }
  });

  // Transaction Item model
  const TransactionItem = sequelize.define('TransactionItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Transactions',
        key: 'id',
      },
    },
    inventoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Inventories',
        key: 'id',
      },
    },
    sourceLocationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'StorageLocations',
        key: 'id',
      },
    },
    sourceBinId: {
      type: DataTypes.UUID,
      references: {
        model: 'BinLocations',
        key: 'id',
      },
    },
    destinationLocationId: {
      type: DataTypes.UUID,
      references: {
        model: 'StorageLocations',
        key: 'id',
      },
    },
    destinationBinId: {
      type: DataTypes.UUID,
      references: {
        model: 'BinLocations',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
  });

  return { Transaction, TransactionItem };
};
