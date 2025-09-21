const express = require('express');
const router = express.Router();
const {
  createWaterReport,
  getWaterReports,
  getWaterReportById,
  getWaterQualityStatistics,
  getWaterQualityTrends
} = require('../controllers/waterReportController');
const { authenticate, checkVillageAccess } = require('../middleware/auth');
const {
  validateWaterReport,
  validatePagination,
  validateObjectId
} = require('../middleware/validation');

// @route   POST /api/water-reports
// @desc    Create water report
// @access  Private
router.post('/', authenticate, validateWaterReport, createWaterReport);

// @route   GET /api/water-reports
// @desc    Get water reports
// @access  Private
router.get('/', authenticate, validatePagination, getWaterReports);

// @route   GET /api/water-reports/statistics
// @desc    Get water quality statistics
// @access  Private
router.get('/statistics', authenticate, getWaterQualityStatistics);

// @route   GET /api/water-reports/trends
// @desc    Get water quality trends
// @access  Private
router.get('/trends', authenticate, getWaterQualityTrends);

// @route   GET /api/water-reports/:id
// @desc    Get water report by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId('id'), getWaterReportById);

module.exports = router;
