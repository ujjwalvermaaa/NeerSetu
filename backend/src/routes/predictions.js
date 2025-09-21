const express = require('express');
const router = express.Router();
const {
  getPredictions,
  getPredictionById,
  updatePredictionStatus,
  getPredictionStatistics,
  getRiskMapData,
  createMLPrediction,
  simulateOutbreakScenario
} = require('../controllers/predictionController');
const { authenticate, authorize, checkVillageAccess } = require('../middleware/auth');
const {
  validatePagination,
  validateObjectId
} = require('../middleware/validation');

// @route   GET /api/predictions
// @desc    Get predictions
// @access  Private
router.get('/', authenticate, validatePagination, getPredictions);

// @route   GET /api/predictions/statistics
// @desc    Get prediction statistics
// @access  Private
router.get('/statistics', authenticate, getPredictionStatistics);

// @route   GET /api/predictions/risk-map
// @desc    Get risk map data
// @access  Private
router.get('/risk-map', authenticate, getRiskMapData);

// @route   POST /api/predictions/simulate
// @desc    Simulate outbreak scenario
// @access  Private (Officials, admins)
router.post('/simulate', 
  authenticate, 
  authorize('official', 'admin'),
  simulateOutbreakScenario
);

// @route   POST /api/predictions/ml-prediction
// @desc    Create prediction from ML service
// @access  Private (ML Service)
router.post('/ml-prediction', createMLPrediction);

// @route   GET /api/predictions/:id
// @desc    Get prediction by ID
// @access  Private
router.get('/:id', authenticate, validateObjectId('id'), getPredictionById);

// @route   PUT /api/predictions/:id/status
// @desc    Update prediction status
// @access  Private (Officials, admins)
router.put('/:id/status', 
  authenticate, 
  authorize('official', 'admin'),
  validateObjectId('id'),
  updatePredictionStatus
);

module.exports = router;
