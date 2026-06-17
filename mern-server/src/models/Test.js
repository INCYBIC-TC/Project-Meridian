const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
    required: true,
    unique: true
  },
  testCases: {
    type: Array,
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Test', TestSchema);
