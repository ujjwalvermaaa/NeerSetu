const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const healthReportRoutes = require('./healthReports');
const waterReportRoutes = require('./waterReports');
const predictionRoutes = require('./predictions');
const analyticsRoutes = require('./analytics');
const iotRoutes = require('./iot');
const userRoutes = require('./users');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NeerSetu Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/health-reports', healthReportRoutes);
router.use('/water-reports', waterReportRoutes);
router.use('/predictions', predictionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/iot', iotRoutes);
router.use('/users', userRoutes);

module.exports = router;
