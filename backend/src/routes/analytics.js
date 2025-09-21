const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');
const { adminMiddleware, officialMiddleware } = require('../middleware/auth');

// Get dashboard statistics
router.get('/dashboard', authMiddleware, analyticsController.getDashboardStats);

// Get village analytics
router.get('/village/:village', authMiddleware, analyticsController.getVillageAnalytics);

// Generate report
router.get('/report', authMiddleware, officialMiddleware, analyticsController.generateReport);

// Get risk distribution
router.get('/risk-distribution', authMiddleware, analyticsController.getRiskDistribution);

// Get monthly trends
router.get('/monthly-trends', authMiddleware, analyticsController.getMonthlyTrends);

module.exports = router;
