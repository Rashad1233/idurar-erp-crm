module.exports = (sequelize, DataTypes) => {
  // Reorder Request model
  const ReorderRequest = sequelize.define('ReorderRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'CONVERTED_TO_PR', 'REJECTED', 'CANCELLED'),
      defaultValue: 'DRAFT',
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    purchaseRequisition: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    approvedAt: {
      type: DataTypes.DATE,
    },
    storageLocationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'StorageLocations',
        key: 'id',
      },
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    approvedById: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (request, options) => {
        if (!request.requestNumber) {
          const today = new Date();
          const year = today.getFullYear().toString().substr(-2);
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const day = today.getDate().toString().padStart(2, '0');
          
          const prefix = 'IRC';
          const datePart = `${year}${month}${day}`;
          
          // Find the latest request with the same prefix and date
          const latestRequest = await ReorderRequest.findOne({
            where: {
              requestNumber: {
                [sequelize.Op.like]: `${prefix}${datePart}%`
              }
            },
            order: [['requestNumber', 'DESC']]
          });
          
          let sequenceNumber = '001';
          if (latestRequest) {
            const lastSequence = latestRequest.requestNumber.substr(-3);
            sequenceNumber = (parseInt(lastSequence, 10) + 1).toString().padStart(3, '0');
          }
          
          request.requestNumber = `${prefix}${datePart}${sequenceNumber}`;
        }
      }
    }
  });

  // Reorder Request Item model
  const ReorderRequestItem = sequelize.define('ReorderRequestItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    currentQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minimumLevel: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    maximumLevel: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    reorderQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    reorderRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ReorderRequests',
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
  }, {
    timestamps: true,
  });

  return { ReorderRequest, ReorderRequestItem };
};
