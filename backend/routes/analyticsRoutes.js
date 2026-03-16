const express = require('express');
const router = express.Router();
const { getIncidentStats, getIncidentsByDate } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getIncidentStats);
router.get('/by-date', getIncidentsByDate);

module.exports = router;
