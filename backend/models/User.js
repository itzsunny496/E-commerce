const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  auth_provider: { type: String, enum: ['local', 'google', 'phone'], default: 'local' },
  role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
  password_hash: { type: String },
  reset_password_token: { type: String },
  reset_password_expires: { type: Date },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);
