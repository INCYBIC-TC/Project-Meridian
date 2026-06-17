const mongoose = require('mongoose');
const SecurityReport = require('../models/SecurityReport');
const asyncWrapper = require('../utils/asyncWrapper');

exports.getSecurityReport = asyncWrapper(async (req, res) => {
  const { scanId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(scanId)) {
    return res.status(400).json({ error: 'Invalid Scan ID format' });
  }

  const report = await SecurityReport.findOne({ scanId });
  if (!report) {
    return res.status(404).json({ error: 'Security report not found' });
  }

  return res.status(200).json(report);
});
