const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['villager', 'asha_worker', 'official', 'admin'])
    .withMessage('Invalid role'),
  body('village')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Village name must be between 2 and 100 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State name must be between 2 and 50 characters'),
  body('district')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('District name must be between 2 and 50 characters'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Health report validation
const validateHealthReport = [
  body('patientDetails.ageGroup')
    .isIn(['0-5', '6-18', '19-60', '60+'])
    .withMessage('Invalid age group'),
  body('patientDetails.gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('severityLevel')
    .optional()
    .isIn(['Mild', 'Moderate', 'Severe', 'Critical'])
    .withMessage('Invalid severity level'),
  handleValidationErrors
];

// Water report validation
const validateWaterReport = [
  body('waterSource.type')
    .isIn(['Tube Well', 'Pond', 'Piped Supply', 'River', 'Well', 'Spring'])
    .withMessage('Invalid water source type'),
  body('waterSource.location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('waterSource.location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('qualityParameters.pH.value')
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH value must be between 0 and 14'),
  body('qualityParameters.turbidity.value')
    .isFloat({ min: 0 })
    .withMessage('Turbidity must be a positive number'),
  body('testingInfo.method')
    .isIn(['IoT Sensor', 'Lab Analysis', 'Water Testing Kit', 'Manual'])
    .withMessage('Invalid testing method'),
  handleValidationErrors
];

// Prediction validation
const validatePrediction = [
  body('village')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Village name is required'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State name is required'),
  body('district')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('District name is required'),
  body('predictionData.avgPH')
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH value must be between 0 and 14'),
  body('predictionData.avgTurbidity')
    .isFloat({ min: 0 })
    .withMessage('Turbidity must be a positive number'),
  body('predictionData.dailyRainfall')
    .isFloat({ min: 0 })
    .withMessage('Daily rainfall must be a positive number'),
  body('predictionData.season')
    .isIn(['Winter', 'Summer', 'Monsoon', 'Post-Monsoon'])
    .withMessage('Invalid season'),
  body('predictionData.month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  handleValidationErrors
];

// Alert validation
const validateAlert = [
  body('alertType')
    .isIn(['outbreak_prediction', 'water_contamination', 'environmental_risk', 'health_surge', 'system_alert'])
    .withMessage('Invalid alert type'),
  body('severity')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid severity level'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),
  body('riskIndex')
    .isInt({ min: 0, max: 500 })
    .withMessage('Risk index must be between 0 and 500'),
  body('actionRequired')
    .isIn(['monitor', 'investigate', 'intervene', 'emergency_response'])
    .withMessage('Invalid action required'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'riskIndex', 'severity'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateHealthReport,
  validateWaterReport,
  validatePrediction,
  validateAlert,
  validatePagination,
  validateObjectId
};
