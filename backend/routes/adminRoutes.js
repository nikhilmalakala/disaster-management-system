const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createUser, listUsers, updateUserRole } = require('../controllers/adminController');

// All routes here require admin
router.use(protect);
router.use(authorize('admin'));

router.post('/create-user', createUser);
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
