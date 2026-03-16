const User = require('../models/User');

/**
 * @desc    Create a new user (admin only)
 * @route   POST /api/admin/users
 * @access  Private/Admin
 * @param   {Object} req - Express request object containing name, email, password, and role in body
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with created user data or error message
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (!['authority', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be authority or admin' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }
    const user = await User.create({ name, email, password, role });
    return res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('admin.createUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all users in the system
 * @route   GET /api/admin/users
 * @access  Private/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with array of all users
 */
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const data = users.map((u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
    return res.json({ success: true, users: data });
  } catch (err) {
    console.error('admin.listUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update a specific user's role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 * @param   {Object} req - Express request object containing user ID in params and new role in body
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with updated user data or error message
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, message: 'Role is required' });
    if (!['citizen', 'authority', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Prevent admin from demoting themselves
    if (req.user._id.toString() === id && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You cannot remove your own admin role' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.role = role;
    await user.save();
    return res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('admin.updateUserRole error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
