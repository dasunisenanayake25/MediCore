const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // උදා: Admin approved registration
  details: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);