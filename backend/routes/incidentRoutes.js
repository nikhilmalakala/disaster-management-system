const express = require('express');
const router = express.Router();
const {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  deleteIncident,
} = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

router.route('/').get(getIncidents).post(upload.single('image'), createIncident);
router.route('/:id').get(getIncident).put(updateIncident).delete(deleteIncident);

module.exports = router;
