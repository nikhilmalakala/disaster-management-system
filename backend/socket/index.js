const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

function setupSocket(io) {
  // Optional: authenticate socket connection via token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('id role');
        socket.user = user;
      } catch (err) {
        socket.user = null;
      }
    } else {
      socket.user = null;
    }
    next();
  });

  io.on('connection', (socket) => {
    // Join role-based room for geo-filtering / targeting
    if (socket.user) {
      socket.join(`user_${socket.user.id}`);
      socket.join(`role_${socket.user.role}`);
    }

    // Handle SOS_ALERT from citizens
    socket.on('SOS_ALERT', async (payload) => {
      const { latitude, longitude, message } = payload || {};
      // Broadcast to authorities only
      io.to('role_authority').to('role_admin').emit('NEW_SOS', {
        id: socket.id,
        userId: socket.user?.id,
        latitude: latitude || null,
        longitude: longitude || null,
        message: message || 'Emergency SOS',
        timestamp: new Date().toISOString(),
      });
      // Optional: persist SOS for notifications
      const authorityUsers = await User.find({ role: { $in: ['authority', 'admin'] } }).select('_id');
      for (const u of authorityUsers) {
        await Notification.create({
          message: message || 'Emergency SOS received',
          user: u._id,
          type: 'sos',
          read: false,
        });
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

module.exports = { setupSocket };
