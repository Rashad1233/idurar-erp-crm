const mongoose = require('mongoose');

const itemMasterSchema = new mongoose.Schema(
  {
    itemNumber: {
      type: String,
      unique: true,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: 100,
    },
    longDescription: {
      type: String,
      default: '',
    },
    // NOUN, MODIFIER format
    standardDescription: {
      type: String,
      required: true,
    },
    manufacturerName: {
      type: String,
      required: true,
    },
    manufacturerPartNumber: {
      type: String,
      required: true,
    },
    equipmentCategory: {
      type: String,
      required: true,
    },
    equipmentSubCategory: {
      type: String,
      default: '',
    },
    unspscCode: {
      type: String,
      default: '',
    },
    uom: {
      type: String,
      required: true, // Unit of Measure (EA, PCS, etc.)
    },
    equipmentTag: {
      type: String,
      default: '',
    },
    serialNumber: {
      type: String,
      default: 'N',
    },
    criticality: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW', 'NO'],
      default: 'NO',
    },
    stockItem: {
      type: String,
      enum: ['Y', 'N'],
      default: 'N',
    },
    plannedStock: {
      type: String,
      enum: ['Y', 'N'],
      default: 'N',
    },
    stockCode: {
      type: String,
      enum: ['ST1', 'ST2', 'NS3'],
      default: 'NS3',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'DRAFT',
    },
    contractNumber: {
      type: String,
      default: '',
    },
    supplierName: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to set stockCode based on stockItem and plannedStock
itemMasterSchema.pre('save', function(next) {
  if (this.stockItem === 'Y') {
    if (this.plannedStock === 'Y') {
      this.stockCode = 'ST2';
    } else {
      this.stockCode = 'ST1';
    }
  } else {
    this.stockCode = 'NS3';
  }
  next();
});

const ItemMaster = mongoose.model('ItemMaster', itemMasterSchema);

module.exports = ItemMaster;
