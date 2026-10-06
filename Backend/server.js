const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — in production, restrict to the configured frontend URL;
// in development/test, allow localhost on any port for convenience.
const allowedOrigins = (() => {
  if (process.env.NODE_ENV === 'production') {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      console.warn('[CORS] WARNING: FRONTEND_URL is not set. CORS will block all browser requests in production.');
      return [];
    }
    // Support a comma-separated list of origins if needed (e.g. www + apex)
    return frontendUrl.split(',').map(u => u.trim());
  }
  // Development: allow localhost on common frontend ports
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:8080'
  ];
})();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan HTTP request logging:
// - 'combined' in production (Apache-style, no color, machine-friendly for log aggregators)
// - 'dev'      in development (concise, color-coded for readability)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Serve uploaded prescription files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'MediFind Medicine Availability & Pharmacy Locator System'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint "${req.originalUrl}" not found.`
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Graceful Shutdown — close SQLite before process exits to prevent native assertion crash
const { closeDatabase } = require('./config/db');

function gracefulShutdown(signal) {
  console.log(`\n[SERVER] Received ${signal}. Shutting down gracefully...`);
  try {
    if (closeDatabase) closeDatabase();
  } catch (_) { /* ignore */ }
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('exit', () => {
  try { if (closeDatabase) closeDatabase(); } catch (_) {}
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    if (process.env.NODE_ENV !== 'test') {
      // Bind to 0.0.0.0 so Render's reverse proxy (and Docker) can reach the server.
      // Listening on 127.0.0.1 (the Node default) is only reachable from loopback.
      app.listen(PORT, '0.0.0.0', () => {
        const env = process.env.NODE_ENV || 'development';
        console.log(`=======================================================`);
        if (env === 'production') {
          console.log(` MediFind Backend running on port ${PORT} (0.0.0.0)`);
          console.log(` Environment: production`);
          console.log(` API Base URL: /api`);
        } else {
          console.log(` MediFind Backend Server running on http://localhost:${PORT}`);
          console.log(` API Base URL: http://localhost:${PORT}/api`);
          console.log(` Environment: ${env}`);
        }
        console.log(`=======================================================`);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
