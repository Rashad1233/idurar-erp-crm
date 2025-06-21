const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    itemMaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemMaster',
      required: true,
    },
    inventoryNumber: {
      type: String,
      required: true,
      unique: true,
    },
    physicalBalance: {
      type: Number,
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    linePrice: {
      type: Number,
      default: function() {
        return this.unitPrice * this.physicalBalance;
      },
    },
    condition: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E'], // A=New, B=Used, C=Require inspection, D=Require repair, E=Scrap
      default: 'A',
    },
    minimumLevel: {
      type: Number,
      default: 0,
    },
    maximumLevel: {
      type: Number,
      default: 0,
    },
    storageLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StorageLocation',
    },
    binLocation: {
      type: String,
      default: '',
    },
    warehouse: {
      type: String,
      default: '',
    },
    serialNumber: {
      type: String,
      default: '',
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for reorder quantity calculation
inventorySchema.virtual('reorderQuantity').get(function() {
  if (this.physicalBalance < this.minimumLevel) {
    return this.maximumLevel - this.physicalBalance;
  }
  return 0;
});

// Update linePrice whenever unitPrice or physicalBalance changes
inventorySchema.pre('save', function(next) {
  this.linePrice = this.unitPrice * this.physicalBalance;
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
