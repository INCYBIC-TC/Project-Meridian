const mongoose = require('mongoose');
const Scan = require('../models/Scan');
const Doc = require('../models/Doc');
const Review = require('../models/Review');
const Test = require('../models/Test');
const SecurityReport = require('../models/SecurityReport');
const asyncWrapper = require('../utils/asyncWrapper');

exports.getResults = asyncWrapper(async (req, res) => {
  const { scanId } = req.params;

  // Validate scanId ObjectId format
  if (!mongoose.Types.ObjectId.isValid(scanId)) {
    return res.status(400).json({ error: 'Invalid Scan ID format' });
  }

  // Fetch parent Scan
  const scan = await Scan.findById(scanId);
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  // Fetch all related documents linked by scanId in parallel
  const [doc, review, test, securityReport] = await Promise.all([
    Doc.findOne({ scanId }),
    Review.findOne({ scanId }),
    Test.findOne({ scanId }),
    SecurityReport.findOne({ scanId })
  ]);

  return res.status(200).json({
    scan,
    docs: doc || {},
    reviews: review ? review.comments : [],
    tests: test ? test.testCases : [],
    security: securityReport || {}
  });
});
