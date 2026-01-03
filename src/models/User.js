// models/User.js — FINAL VERSION (ADMIN EMPIRE READY)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  phone: { 
    type: String,
    trim: true
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user'
  },
  isBlocked: { 
    type: Boolean, 
    default: false 
  }, // ← THIS IS THE KEY FOR BLOCKING USERS
  refreshTokens: [{ 
    token: String, 
    createdAt: { type: Date, default: Date.now } 
  }],

  // Password Reset Fields
  resetToken: { type: String },
  resetTokenExpiry: { type: Date }
}, { 
  timestamps: true 
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Optional: Nice toString for logs
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetToken;
  delete user.resetTokenExpiry;
  delete user.refreshTokens;
  return user;
};

module.exports = mongoose.model('User', userSchema);