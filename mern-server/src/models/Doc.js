const mongoose = require('mongoose');

const DocSchema = new mongoose.Schema({
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scan',
    required: true,
    unique: true
  },
  summary: {
    type: String
  },
  routes: {
    type: Array,
    default: []
  },
  models: {
    type: Array,
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Doc', DocSchema);
