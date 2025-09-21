const Prediction = require('../models/Prediction');
const HealthReport = require('../models/HealthReport');
const WaterReport = require('../models/WaterReport');
const axios = require('axios');

// @desc    Get predictions
// @route   GET /api/predictions
// @access  Private
const getPredictions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      village,
      riskLevel,
      status,
      startDate,
      endDate
    } = req.query;

    const query = {};

    // Filter by user role and village access
    if (req.user.role === 'villager' || req.user.role === 'asha_worker') {
      query.village = req.user.village;
    } else if (village) {
      query.village = village;
    }

    if (riskLevel) query['mlPrediction.riskLevel'] = riskLevel;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const predictions = await Prediction.find(query)
      .populate('acknowledgedBy', 'name email phone role')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prediction.countDocuments(query);

    res.json({
      success: true,
      data: {
        predictions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPredictions: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching predictions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get prediction by ID
// @route   GET /api/predictions/:id
// @access  Private
const getPredictionById = async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id)
      .populate('acknowledgedBy', 'name email phone role');

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    // Check village access
    if (req.user.role === 'villager' || req.user.role === 'asha_worker') {
      if (prediction.village !== req.user.village) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view predictions from your village.'
        });
      }
    }

    res.json({
      success: true,
      data: {
        prediction
      }
    });
  } catch (error) {
    console.error('Get prediction by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prediction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update prediction status
// @route   PUT /api/predictions/:id/status
// @access  Private (Officials, admins)
const updatePredictionStatus = async (req, res) => {
  try {
    const { status, investigationNotes } = req.body;
    const predictionId = req.params.id;

    if (!['active', 'acknowledged', 'investigating', 'resolved', 'false_positive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateData = {
      status,
      acknowledgedBy: req.user.id,
      acknowledgedAt: new Date()
    };

    if (investigationNotes) {
      updateData.investigationNotes = investigationNotes;
    }

    const prediction = await Prediction.findByIdAndUpdate(
      predictionId,
      updateData,
      { new: true, runValidators: true }
    ).populate('acknowledgedBy', 'name email phone role');

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    res.json({
      success: true,
      message: 'Prediction status updated successfully',
      data: {
        prediction
      }
    });
  } catch (error) {
    console.error('Update prediction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating prediction status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get prediction statistics
// @route   GET /api/predictions/statistics
// @access  Private
const getPredictionStatistics = async (req, res) => {
  try {
    const { village, startDate, endDate } = req.query;
    const query = {};

    // Filter by village
    if (req.user.role === 'villager' || req.user.role === 'asha_worker') {
      query.village = req.user.village;
    } else if (village) {
      query.village = village;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalPredictions,
      activePredictions,
      riskLevelStats,
      accuracyStats,
      recentPredictions
    ] = await Promise.all([
      Prediction.countDocuments(query),
      Prediction.countDocuments({ ...query, status: 'active' }),
      Prediction.aggregate([
        { $match: query },
        { $group: { _id: '$mlPrediction.riskLevel', count: { $sum: 1 } } }
      ]),
      Prediction.aggregate([
        { $match: { ...query, 'actualOutbreak.occurred': { $exists: true } } },
        {
          $group: {
            _id: null,
            totalVerified: { $sum: 1 },
            truePositives: {
              $sum: {
                $cond: [
                  { $and: [
                    { $gte: ['$mlPrediction.outbreakProbability', 0.7] },
                    { $eq: ['$actualOutbreak.occurred', true] }
                  ]},
                  1,
                  0
                ]
              }
            },
            falsePositives: {
              $sum: {
                $cond: [
                  { $and: [
                    { $gte: ['$mlPrediction.outbreakProbability', 0.7] },
                    { $eq: ['$actualOutbreak.occurred', false] }
                  ]},
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      Prediction.find(query)
        .populate('acknowledgedBy', 'name role')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const accuracy = accuracyStats[0] || { totalVerified: 0, truePositives: 0, falsePositives: 0 };
    const precision = accuracy.totalVerified > 0 ? 
      (accuracy.truePositives / (accuracy.truePositives + accuracy.falsePositives)) : 0;

    res.json({
      success: true,
      data: {
        totalPredictions,
        activePredictions,
        riskLevelStats: riskLevelStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        accuracy: {
          precision: Math.round(precision * 100) / 100,
          truePositives: accuracy.truePositives,
          falsePositives: accuracy.falsePositives,
          totalVerified: accuracy.totalVerified
        },
        recentPredictions
      }
    });
  } catch (error) {
    console.error('Get prediction statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prediction statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get risk map data
// @route   GET /api/predictions/risk-map
// @access  Private
const getRiskMapData = async (req, res) => {
  try {
    const { state, district } = req.query;
    const query = {};

    if (state) query.state = state;
    if (district) query.district = district;

    // Get latest predictions for each village
    const riskMapData = await Prediction.aggregate([
      { $match: query },
      {
        $sort: { village: 1, createdAt: -1 }
      },
      {
        $group: {
          _id: '$village',
          latestPrediction: { $first: '$$ROOT' }
        }
      },
      {
        $project: {
          village: '$latestPrediction.village',
          state: '$latestPrediction.state',
          district: '$latestPrediction.district',
          riskIndex: '$latestPrediction.mlPrediction.riskIndex',
          riskLevel: '$latestPrediction.mlPrediction.riskLevel',
          probability: '$latestPrediction.mlPrediction.outbreakProbability',
          contributingFactors: '$latestPrediction.mlPrediction.contributingFactors',
          status: '$latestPrediction.status',
          createdAt: '$latestPrediction.createdAt',
          location: {
            latitude: '$latestPrediction.predictionData.latitude',
            longitude: '$latestPrediction.predictionData.longitude'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        riskMapData,
        totalVillages: riskMapData.length,
        highRiskVillages: riskMapData.filter(v => v.riskIndex > 300).length,
        moderateRiskVillages: riskMapData.filter(v => v.riskIndex > 200 && v.riskIndex <= 300).length,
        lowRiskVillages: riskMapData.filter(v => v.riskIndex <= 200).length
      }
    });
  } catch (error) {
    console.error('Get risk map data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching risk map data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create prediction from ML service
// @route   POST /api/predictions/ml-prediction
// @access  Private (ML Service)
const createMLPrediction = async (req, res) => {
  try {
    const {
      village,
      state,
      district,
      predictionData,
      mlPrediction
    } = req.body;

    // Validate required fields
    if (!village || !state || !district || !predictionData || !mlPrediction) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for prediction'
      });
    }

    const prediction = await Prediction.create({
      village,
      state,
      district,
      predictionData,
      mlPrediction,
      status: 'active'
    });

    // Trigger alert if risk is high
    if (mlPrediction.riskIndex > 300) {
      try {
        await triggerHighRiskAlert(prediction);
      } catch (alertError) {
        console.error('Alert trigger error:', alertError);
        // Don't fail prediction creation if alert fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Prediction created successfully',
      data: {
        prediction
      }
    });
  } catch (error) {
    console.error('Create ML prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during prediction creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Simulate outbreak scenario
// @route   POST /api/predictions/simulate
// @access  Private (Officials, admins)
const simulateOutbreakScenario = async (req, res) => {
  try {
    const {
      village,
      state,
      district,
      scenarioData
    } = req.body;

    // Call ML service for simulation
    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/simulate`, {
        village,
        state,
        district,
        scenarioData
      });

      const simulationResult = mlResponse.data;

      res.json({
        success: true,
        message: 'Outbreak simulation completed',
        data: {
          simulation: simulationResult,
          timestamp: new Date()
        }
      });
    } catch (mlError) {
      console.error('ML simulation error:', mlError);
      res.status(500).json({
        success: false,
        message: 'ML service unavailable for simulation',
        error: process.env.NODE_ENV === 'development' ? mlError.message : undefined
      });
    }
  } catch (error) {
    console.error('Simulate outbreak scenario error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during outbreak simulation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to trigger high risk alert
const triggerHighRiskAlert = async (prediction) => {
  try {
    // This would create an alert for high risk predictions
    console.log('Triggering high risk alert for prediction:', prediction._id);
    
    // In a real implementation, you would create an alert here
    // const alert = await Alert.create({
    //   village: prediction.village,
    //   state: prediction.state,
    //   district: prediction.district,
    //   alertType: 'outbreak_prediction',
    //   severity: 'High',
    //   title: 'High Risk Outbreak Prediction',
    //   message: `High risk of water-borne disease outbreak predicted in ${prediction.village}`,
    //   riskIndex: prediction.mlPrediction.riskIndex,
    //   predictionId: prediction._id,
    //   actionRequired: 'intervene'
    // });
  } catch (error) {
    console.error('High risk alert trigger error:', error);
    throw error;
  }
};

module.exports = {
  getPredictions,
  getPredictionById,
  updatePredictionStatus,
  getPredictionStatistics,
  getRiskMapData,
  createMLPrediction,
  simulateOutbreakScenario
};
