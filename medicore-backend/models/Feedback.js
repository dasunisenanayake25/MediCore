const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  rating: { type: Number, required: true }, // තරු ගාණ (1-5)
  comment: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);