const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');
const authMiddleware = require('../middleware/auth');

// Process water quality data from IoT devices
router.post('/water', iotController.processWaterData);

// Get water quality history for a village
router.get('/water/history/:village', authMiddleware, iotController.getWaterQualityHistory);

// Get water quality statistics for a village
router.get('/water/stats/:village', authMiddleware, iotController.getWaterQualityStats);

module.exports = router;
