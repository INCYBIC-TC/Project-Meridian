const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
    required: true,
    unique: true
  },
  comments: [
    {
      file: { type: String, required: true },
      line: { type: Number, required: true },
      message: { type: String, required: true },
      severity: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
