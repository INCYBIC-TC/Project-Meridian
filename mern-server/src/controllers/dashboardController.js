const Scan = require('../models/Scan');
const asyncWrapper = require('../utils/asyncWrapper');

exports.getSummary = asyncWrapper(async (req, res) => {
  // Execute aggregation mapping metrics
  const stats = await Scan.aggregate([
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        completedScans: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedScans: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);

  const recentScans = await Scan.find()
    .sort({ startedAt: -1 })
    .limit(10);

  const metrics = stats[0] || {
    totalScans: 0,
    completedScans: 0,
    failedScans: 0,
    avgDuration: 0
  };

  return res.status(200).json({
    totalScans: metrics.totalScans,
    completedScans: metrics.completedScans,
    failedScans: metrics.failedScans,
    avgDuration: Math.round(metrics.avgDuration || 0),
    recentScans
  });
});
