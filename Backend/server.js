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

// Security & Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
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
      app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(` MediFind Backend Server running on http://localhost:${PORT}`);
        console.log(` API Base URL: http://localhost:${PORT}/api`);
        console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
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
