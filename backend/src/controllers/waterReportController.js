const WaterReport = require('../models/WaterReport');
const axios = require('axios');

// @desc    Create water report
// @route   POST /api/water-reports
// @access  Private
const createWaterReport = async (req, res) => {
  try {
    const {
      waterSource,
      qualityParameters,
      testingInfo,
      images,
      notes,
      isIotData
    } = req.body;

    // Calculate overall water quality status
    const overallStatus = calculateWaterQualityStatus(qualityParameters);

    const waterReport = await WaterReport.create({
      village: req.user.village,
      state: req.user.state,
      district: req.user.district,
      waterSource,
      qualityParameters,
      testingInfo: {
        ...testingInfo,
        testerId: req.user.id
      },
      overallStatus,
      images: images || [],
      notes,
      isIotData: isIotData || false
    });

    // If not IoT data, trigger ML prediction
    if (!isIotData) {
      try {
        await triggerMLPrediction(waterReport);
      } catch (mlError) {
        console.error('ML prediction error:', mlError);
        // Don't fail the report creation if ML fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Water report created successfully',
      data: {
        report: waterReport
      }
    });
  } catch (error) {
    console.error('Create water report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during water report creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get water reports
// @route   GET /api/water-reports
// @access  Private
const getWaterReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      village,
      waterSourceType,
      contaminationLevel,
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

    if (waterSourceType) query['waterSource.type'] = waterSourceType;
    if (contaminationLevel) query['overallStatus.contaminationLevel'] = contaminationLevel;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await WaterReport.find(query)
      .populate('testingInfo.testerId', 'name email phone role')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WaterReport.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReports: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get water reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching water reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get water report by ID
// @route   GET /api/water-reports/:id
// @access  Private
const getWaterReportById = async (req, res) => {
  try {
    const report = await WaterReport.findById(req.params.id)
      .populate('testingInfo.testerId', 'name email phone role village');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Water report not found'
      });
    }

    // Check village access
    if (req.user.role === 'villager' || req.user.role === 'asha_worker') {
      if (report.village !== req.user.village) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view reports from your village.'
        });
      }
    }

    res.json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Get water report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching water report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get water quality statistics
// @route   GET /api/water-reports/statistics
// @access  Private
const getWaterQualityStatistics = async (req, res) => {
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
      totalReports,
      potableReports,
      contaminationStats,
      waterSourceStats,
      qualityTrends,
      recentReports
    ] = await Promise.all([
      WaterReport.countDocuments(query),
      WaterReport.countDocuments({ ...query, 'overallStatus.isPotable': true }),
      WaterReport.aggregate([
        { $match: query },
        { $group: { _id: '$overallStatus.contaminationLevel', count: { $sum: 1 } } }
      ]),
      WaterReport.aggregate([
        { $match: query },
        { $group: { _id: '$waterSource.type', count: { $sum: 1 } } }
      ]),
      WaterReport.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            avgPH: { $avg: '$qualityParameters.pH.value' },
            avgTurbidity: { $avg: '$qualityParameters.turbidity.value' },
            avgBacteriaEcoli: { $avg: '$qualityParameters.bacteriaEcoli.value' },
            potableCount: { $sum: { $cond: ['$overallStatus.isPotable', 1, 0] } },
            totalCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      WaterReport.find(query)
        .populate('testingInfo.testerId', 'name role')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        potableReports,
        contaminationStats: contaminationStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        waterSourceStats: waterSourceStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        qualityTrends,
        recentReports
      }
    });
  } catch (error) {
    console.error('Get water quality statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching water quality statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get water quality trends
// @route   GET /api/water-reports/trends
// @access  Private
const getWaterQualityTrends = async (req, res) => {
  try {
    const { village, days = 30 } = req.query;
    const query = {};

    // Filter by village
    if (req.user.role === 'villager' || req.user.role === 'asha_worker') {
      query.village = req.user.village;
    } else if (village) {
      query.village = village;
    }

    // Filter by date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    query.createdAt = {
      $gte: startDate,
      $lte: endDate
    };

    const trends = await WaterReport.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            village: '$village'
          },
          avgPH: { $avg: '$qualityParameters.pH.value' },
          avgTurbidity: { $avg: '$qualityParameters.turbidity.value' },
          avgBacteriaEcoli: { $avg: '$qualityParameters.bacteriaEcoli.value' },
          avgBacteriaColiform: { $avg: '$qualityParameters.bacteriaColiform.value' },
          potableCount: { $sum: { $cond: ['$overallStatus.isPotable', 1, 0] } },
          totalCount: { $sum: 1 },
          contaminationLevels: {
            $push: '$overallStatus.contaminationLevel'
          }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        trends,
        period: {
          startDate,
          endDate,
          days: parseInt(days)
        }
      }
    });
  } catch (error) {
    console.error('Get water quality trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching water quality trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to calculate water quality status
const calculateWaterQualityStatus = (qualityParameters) => {
  const parameters = [
    'pH', 'turbidity', 'bacteriaEcoli', 'bacteriaColiform',
    'dissolvedOxygen', 'nitrates', 'phosphates', 'heavyMetals',
    'chlorineResidual', 'fluoride', 'arsenic'
  ];

  let unsafeCount = 0;
  let totalParameters = 0;

  parameters.forEach(param => {
    if (qualityParameters[param]) {
      totalParameters++;
      if (qualityParameters[param].status === 'Unsafe') {
        unsafeCount++;
      }
    }
  });

  const riskScore = (unsafeCount / totalParameters) * 100;
  
  let contaminationLevel = 'Safe';
  let isPotable = true;

  if (riskScore > 70) {
    contaminationLevel = 'Critical';
    isPotable = false;
  } else if (riskScore > 50) {
    contaminationLevel = 'High';
    isPotable = false;
  } else if (riskScore > 30) {
    contaminationLevel = 'Medium';
    isPotable = false;
  } else if (riskScore > 10) {
    contaminationLevel = 'Low';
    isPotable = true;
  }

  return {
    isPotable,
    contaminationLevel,
    riskScore: Math.round(riskScore)
  };
};

// Helper function to trigger ML prediction
const triggerMLPrediction = async (waterReport) => {
  try {
    // This would call the ML service to get predictions
    // For now, we'll just log it
    console.log('Triggering ML prediction for water report:', waterReport._id);
    
    // In a real implementation, you would call the ML service here
    // const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
    //   waterData: waterReport
    // });
  } catch (error) {
    console.error('ML prediction trigger error:', error);
    throw error;
  }
};

module.exports = {
  createWaterReport,
  getWaterReports,
  getWaterReportById,
  getWaterQualityStatistics,
  getWaterQualityTrends
};
