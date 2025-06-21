const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ['GR', 'GI', 'GE', 'GT'], // Goods Receipt, Goods Issue, Goods Return, Goods Transfer
      required: true,
    },
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    referenceNumber: {
      type: String, // PO number, job number, etc.
      default: '',
    },
    items: [
      {
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Inventory',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        sourceLocation: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'StorageLocation',
          required: true,
        },
        sourceBin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BinLocation',
        },
        destinationLocation: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'StorageLocation',
        },
        destinationBin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BinLocation',
        },
        notes: String,
      },
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
    },
    costCenter: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate transaction number before saving
transactionSchema.pre('save', async function(next) {
  try {
    if (!this.transactionNumber) {
      const today = new Date();
      const year = today.getFullYear().toString().substr(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      
      const prefix = this.transactionType;
      const datePart = `${year}${month}${day}`;
      
      // Find the latest transaction with the same prefix and date
      const latestTransaction = await this.constructor.findOne(
        { transactionNumber: new RegExp(`^${prefix}${datePart}`) },
        {},
        { sort: { transactionNumber: -1 } }
      );
      
      let sequenceNumber = '001';
      if (latestTransaction) {
        const lastSequence = latestTransaction.transactionNumber.substr(-3);
        sequenceNumber = (parseInt(lastSequence, 10) + 1).toString().padStart(3, '0');
      }
      
      this.transactionNumber = `${prefix}${datePart}${sequenceNumber}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
