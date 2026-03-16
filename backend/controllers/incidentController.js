const Incident = require('../models/Incident');
const Notification = require('../models/Notification');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Create a new incident report with image and geolocation
 * @route   POST /api/incidents
 * @access  Private (Citizen, Authority, Admin)
 * @param   {Object} req - Express request object containing title, description, latitude, longitude in body, and optional image file
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with created incident data
 */
exports.createIncident = async (req, res) => {
  try {
    const { title, description, latitude, longitude } = req.body;
    if (!title || !description || latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and location are required',
      });
    }
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const incident = await Incident.create({
      title,
      description,
      image: imagePath,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      reportedBy: req.user.id,
    });

    // Real-time alert to authorities/admin
    const io = req.app.get('io');
    if (io) {
      io.to('role_authority').to('role_admin').emit('NEW_INCIDENT', {
        id: incident._id,
        title: incident.title,
        status: incident.status,
        location: incident.location,
        createdAt: incident.createdAt,
      });
    }

    // Persist notifications for authorities/admin (for the UI bell)
    const receivers = await User.find({ role: { $in: ['authority', 'admin'] } }).select('_id');
    await Notification.insertMany(
      receivers.map((u) => ({
        message: `New incident reported: ${title}`,
        user: u._id,
        type: 'incident',
        link: `/incidents/${incident._id}`,
      }))
    );

    res.status(201).json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get all incidents (with filters for status and date range)
 * @route   GET /api/incidents
 * @access  Private
 * @param   {Object} req - Express request object containing query parameters (status, startDate, endDate)
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with array of filtered incidents
 */
exports.getIncidents = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    // Citizens see only their own; authority/admin see all
    if (req.user.role === 'citizen') {
      filter.reportedBy = req.user.id;
    }
    const incidents = await Incident.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');
    res.json({ success: true, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get a single incident by ID
 * @route   GET /api/incidents/:id
 * @access  Private
 * @param   {Object} req - Express request object containing incident ID in params
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with detailed incident data
 */
exports.getIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    if (req.user.role === 'citizen' && incident.reportedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update an incident (status, assignment, or details)
 * @route   PUT /api/incidents/:id
 * @access  Private
 * @param   {Object} req - Express request object containing updated fields in body
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with updated incident data
 */
exports.updateIncident = async (req, res) => {
  try {
    let incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    const isOwner = incident.reportedBy.toString() === req.user.id;
    const isAuthority = ['authority', 'admin'].includes(req.user.role);
    if (!isOwner && !isAuthority) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const { title, description, status, assignedTo } = req.body;
    const prevStatus = incident.status;
    if (title != null) incident.title = title;
    if (description != null) incident.description = description;
    if (status != null && (isAuthority || isOwner)) incident.status = status;
    if (assignedTo != null && isAuthority) incident.assignedTo = assignedTo;
    await incident.save();
    incident = await Incident.findById(incident._id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    // Notify reporter when status changes (authority/admin)
    if (prevStatus !== incident.status && isAuthority) {
      await Notification.create({
        message: `Incident "${incident.title}" status updated: ${incident.status}`,
        user: incident.reportedBy._id,
        type: 'status',
        link: `/incidents/${incident._id}`,
      });
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${incident.reportedBy._id}`).emit('INCIDENT_UPDATED', {
          id: incident._id,
          status: incident.status,
        });
      }
    }

    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete an incident
 * @route   DELETE /api/incidents/:id
 * @access  Private (Owner or Admin)
 * @param   {Object} req - Express request object containing incident ID in params
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response confirming deletion
 */
exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    if (incident.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (incident.image) {
      const filePath = path.join(__dirname, '..', incident.image.replace(/^\/+/, ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await incident.deleteOne();
    res.json({ success: true, message: 'Incident deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
