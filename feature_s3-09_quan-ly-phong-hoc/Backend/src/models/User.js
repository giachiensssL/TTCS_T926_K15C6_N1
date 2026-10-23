const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  username: { type: String, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, default: '' },
  dob: { type: String, default: '' },
  address: { type: String, default: '' },
  roles: { type: [String], default: ['STUDENT'] },
  activeRole: { type: String, default: 'STUDENT' },
  status: { type: String, enum: ['ACTIVE', 'LOCKED', 'PENDING'], default: 'ACTIVE' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);