const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define the schema
const superadminSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // `select: false` prevents password from being returned in queries
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: 'superadmin' },
  createdAt: { type: Date, default: Date.now },
  token: { type: String }
});

// Method to match password
superadminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get signed JWT token
superadminSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

// Pre-save hook to hash password before saving
superadminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('SuperAdmin', superadminSchema, 'superadmins');
