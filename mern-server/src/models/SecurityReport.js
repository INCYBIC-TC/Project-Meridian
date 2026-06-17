const mongoose = require('mongoose');

const SecurityReportSchema = new mongoose.Schema({
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
    required: true,
    unique: true
  },
  vulnerabilities: {
    type: Array,
    default: []
  },
  secrets: {
    type: Array,
    default: []
  },
  dependencyFlags: {
    type: Array,
    default: []
  },
  owaspFlags: {
    type: Array,
    default: []
  },
  summary: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('SecurityReport', SecurityReportSchema);
