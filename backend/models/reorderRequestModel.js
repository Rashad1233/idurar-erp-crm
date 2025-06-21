const mongoose = require('mongoose');

const reorderRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },
    storageLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StorageLocation',
      required: true,
    },
    items: [
      {
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Inventory',
          required: true,
        },
        currentQuantity: {
          type: Number,
          required: true,
        },
        minimumLevel: {
          type: Number,
          required: true,
        },
        maximumLevel: {
          type: Number,
          required: true,
        },
        reorderQuantity: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'CONVERTED_TO_PR', 'REJECTED', 'CANCELLED'],
      default: 'DRAFT',
    },
    notes: {
      type: String,
      default: '',
    },
    purchaseRequisition: {
      type: String, // PR number if converted
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate request number before saving
reorderRequestSchema.pre('save', async function(next) {
  try {
    if (!this.requestNumber) {
      const today = new Date();
      const year = today.getFullYear().toString().substr(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      
      const prefix = 'IRC';
      const datePart = `${year}${month}${day}`;
      
      // Find the latest request with the same prefix and date
      const latestRequest = await this.constructor.findOne(
        { requestNumber: new RegExp(`^${prefix}${datePart}`) },
        {},
        { sort: { requestNumber: -1 } }
      );
      
      let sequenceNumber = '001';
      if (latestRequest) {
        const lastSequence = latestRequest.requestNumber.substr(-3);
        sequenceNumber = (parseInt(lastSequence, 10) + 1).toString().padStart(3, '0');
      }
      
      this.requestNumber = `${prefix}${datePart}${sequenceNumber}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const ReorderRequest = mongoose.model('ReorderRequest', reorderRequestSchema);

module.exports = ReorderRequest;
