const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true }, // උදා: Public holiday
  target: { type: String, default: 'All users' },
  status: { type: String, enum: ['Live', 'Expired'], default: 'Live' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);