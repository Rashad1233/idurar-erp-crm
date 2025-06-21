const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },    role: {
      type: String,
      enum: ['admin', 'staff', 'manager', 'inventory_manager', 'warehouse_manager', 'procurement_manager'],
      default: 'staff',
    },
    permissions: {
      createItemMaster: {
        type: Boolean,
        default: false
      },
      editItemMaster: {
        type: Boolean,
        default: false
      },
      approveItemMaster: {
        type: Boolean,
        default: false
      },
      setInventoryLevels: {
        type: Boolean,
        default: false
      },
      createReorderRequests: {
        type: Boolean,
        default: false
      },
      approveReorderRequests: {
        type: Boolean,
        default: false
      },
      warehouseTransactions: {
        type: Boolean,
        default: false
      }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
