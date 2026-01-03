// src/server.js — FINAL ₹1 CRORE PRODUCTION VERSION
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const tourRoutes = require('./routes/tourRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// ============ DATABASE ============
connectDB();

// ============ SECURITY & MIDDLEWARES ============
app.use(helmet({
  contentSecurityPolicy: false, // Allow Cloudinary images
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan('dev'));

// Stronger rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { message: 'Too many requests, please try again later.' }
}));

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);

// Health Check (For hosting platforms)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Welcome message
app.get('/api', (req, res) => {
  res.json({
    message: 'Holiday Planner API is LIVE!',
    version: '1.0.0',
    docs: '/api/docs' // Future
  });
});

// ============ ERROR HANDLING (MUST BE LAST) ============

// Handle async errors (from controllers)
app.use((err, req, res, next) => {
  console.error('ERROR:', err.stack || err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Duplicate key error (e.g., email already exists)
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Already exists',
      field: Object.keys(err.keyValue)[0]
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============ 404 - Route not found ============
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    tip: 'Check API documentation'
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('===================================');
  console.log(' HOLIDAY PLANNER API IS LIVE!');
  console.log('===================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Frontend: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`Admin Dashboard: http://localhost:5173/admin`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log('===================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
