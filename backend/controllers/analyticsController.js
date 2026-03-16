const Incident = require('../models/Incident');

// @desc    Get incident counts by status (aggregation)
exports.getIncidentStats = async (req, res) => {
  try {
    const match = {};
    if (req.user.role === 'citizen') {
      match.reportedBy = req.user._id;
    }
    const stats = await Incident.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const result = { pending: 0, verified: 0, resolved: 0, rejected: 0 };
    stats.forEach((s) => {
      result[s._id] = s.count;
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get incidents by date (for charts)
exports.getIncidentsByDate = async (req, res) => {
  try {
    const match = {};
    if (req.user.role === 'citizen') {
      match.reportedBy = req.user._id;
    }
    const days = parseInt(req.query.days) || 7;
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    match.createdAt = { $gte: start };
    const data = await Incident.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
