const express = require('express');
const router = express.Router();
const { listUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('authority', 'admin'), listUsers);

module.exports = router;

