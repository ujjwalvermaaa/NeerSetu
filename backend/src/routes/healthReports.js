const express = require('express');
const router = express.Router();
const {
  createHealthReport,
  getHealthReports,
  getHealthReportById,
  updateHealthReportStatus,
  getHealthStatistics,
  syncOfflineReports
} = require('../controllers/healthReportController');
const { authenticate, authorize, checkVillageAccess } = require('../middleware/auth');
const {
  validateHealthReport,
  validatePagination,
  validateObjectId
} = require('../middleware/validation');

// @route   POST /api/health-reports
// @desc    Create health report
// @access  Private
router.post('/', authenticate, validateHealthReport, createHealthReport);

// @route   GET /api/health-reports
// @desc    Get health reports
// @access  Private
router.get('/', authenticate, validatePagination, getHealthReports);

// @route   GET /api/health-reports/statistics
// @desc    Get health statistics
// @access  Private
router.get('/statistics', authenticate, getHealthStatistics);

// @route   POST /api/health-reports/sync
// @desc    Sync offline reports
// @access  Private
router.post('/sync', authenticate, syncOfflineReports);

// @route   GET /api/health-reports/:id
// @desc    Get health report by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId('id'), getHealthReportById);

// @route   PUT /api/health-reports/:id/status
// @desc    Update health report status
// @access  Private (ASHA workers, officials, admins)
router.put('/:id/status', 
  authenticate, 
  authorize('asha_worker', 'official', 'admin'),
  validateObjectId('id'),
  updateHealthReportStatus
);

module.exports = router;
