const mongoose = require('mongoose');

const storageLocationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    isActive: {
      type: Boolean,
      default: true,
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

const binLocationSchema = new mongoose.Schema(
  {
    binCode: {
      type: String,
      required: true,
      trim: true,
    },
    storageLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StorageLocation',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Compound index to ensure binCode is unique per storageLocation
binLocationSchema.index({ binCode: 1, storageLocation: 1 }, { unique: true });

const StorageLocation = mongoose.model('StorageLocation', storageLocationSchema);
const BinLocation = mongoose.model('BinLocation', binLocationSchema);

module.exports = { StorageLocation, BinLocation };
