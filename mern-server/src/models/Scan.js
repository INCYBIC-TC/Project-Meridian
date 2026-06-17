const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  repoId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'parsing', 'scanning', 'analyzing', 'completed', 'failed'],
    required: true,
    default: 'pending'
  },
  triggeredBy: {
    type: String,
    default: 'anonymous'
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  duration: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Scan', ScanSchema);
