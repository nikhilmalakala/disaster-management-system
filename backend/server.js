require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cors = require('cors');

const { setupSocket } = require('./socket');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);
// Trust first proxy (works behind load balancers / reverse proxies)
app.set('trust proxy', 1);


// ============================
// ✅ 1. CORS MUST BE FIRST
// ============================
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// Allow preflight for all routes
app.options('*', cors({
  origin: CLIENT_URL,
  credentials: true,
}));


// ============================
// ✅ 2. BODY PARSER
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ============================
// ✅ 3. LOGGING
// ============================
app.use(morgan('combined'));


// ============================
// ✅ 4. RATE LIMITING
// ============================
// Global limiter for most API routes (15 minutes, 200 requests)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Apply global limiter to /api but explicitly skip POST /api/auth/login
app.use('/api', (req, res, next) => {
  if (req.path === '/auth/login' && req.method === 'POST') return next();
  return globalApiLimiter(req, res, next);
});


// ============================
// ✅ 5. STATIC FILES
// ============================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ============================
// ✅ 6. SOCKET.IO
// ============================
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

app.set('io', io);
setupSocket(io);


// ============================
// ✅ 7. API ROUTES
// ============================
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);


// ============================
// ✅ 8. HEALTH CHECK
// ============================
app.get('/api/health', (req, res) => {
  res.json({ success: true });
});


// ============================
// ✅ 9. DATABASE CONNECTION
// ============================
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-mgmt'
)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));


// ============================
// ✅ 10. START SERVER
// ============================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});