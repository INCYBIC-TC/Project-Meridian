const mongoose = require('mongoose');
const Doc = require('../models/Doc');
const asyncWrapper = require('../utils/asyncWrapper');

exports.getDocs = asyncWrapper(async (req, res) => {
  const { scanId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(scanId)) {
    return res.status(400).json({ error: 'Invalid Scan ID format' });
  }

  const doc = await Doc.findOne({ scanId });
  if (!doc) {
    return res.status(404).json({ error: 'Documentation not found' });
  }

  return res.status(200).json(doc);
});
