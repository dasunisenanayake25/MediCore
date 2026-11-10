const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' }, // Simple plain text for demo, use bcrypt for prod
  specialization: { type: String, default: '' },
  department: { type: String, default: '' },
  experience: { type: String, default: '' },
  address: { type: String, default: '' },
  availability: { type: Array, default: [] },
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

