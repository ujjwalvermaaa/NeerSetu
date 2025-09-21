const HealthReport = require('../models/HealthReport');
const User = require('../models/User');
const axios = require('axios');

// @desc    Create health report
// @route   POST /api/health-reports
// @access  Private
const createHealthReport = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const {
      patientDetails,
      symptoms,
      additionalInfo,
      location,
      severityLevel
    } = req.body;

    // Calculate total affected population based on symptoms
    const totalAffected = Object.values(symptoms).reduce((total, symptom) => {
      return total + (symptom.present ? 1 : 0);
    }, 0);

    // Determine severity level based on symptoms
    let calculatedSeverity = 'Mild';
    if (totalAffected >= 5) {
      calculatedSeverity = 'Critical';
    } else if (totalAffected >= 3) {
      calculatedSeverity = 'Severe';
    } else if (totalAffected >= 2) {
      calculatedSeverity = 'Moderate';
    }

    const healthReport = await HealthReport.create({
      reporterId,
      village: req.user.village,
      state: req.user.state,
      district: req.user.district,
      patientDetails,
      symptoms,
      additionalInfo: additionalInfo || {},
      location,
      severityLevel: severityLevel || calculatedSeverity,
      isOffline: req.body.isOffline || false
    });

    // If not offline, trigger ML prediction
    if (!healthReport.isOffline) {
      try {
        await triggerMLPrediction(healthReport);
      } catch (mlError) {
        console.error('ML prediction error:', mlError);
        // Don't fail the report creation if ML fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Health report created successfully',
      data: {
        report: healthReport
      }
    });
  } catch (error) {
    console.error('Create health report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during health report creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get health reports
// @route   GET /api/health-reports
// @access  Private
const getHealthReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      severityLevel,
      village,
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

    if (status) query.status = status;
    if (severityLevel) query.severityLevel = severityLevel;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await HealthReport.find(query)
      .populate('reporterId', 'name email phone role')
      .populate('verifiedBy', 'name email phone role')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HealthReport.countDocuments(query);

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
    console.error('Get health reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching health reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get health report by ID
// @route   GET /api/health-reports/:id
// @access  Private
const getHealthReportById = async (req, res) => {
  try {
    const report = await HealthReport.findById(req.params.id)
      .populate('reporterId', 'name email phone role village')
      .populate('verifiedBy', 'name email phone role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Health report not found'
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
    console.error('Get health report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching health report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update health report status
// @route   PUT /api/health-reports/:id/status
// @access  Private (ASHA workers, officials, admins)
const updateHealthReportStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const reportId = req.params.id;

    if (!['pending', 'verified', 'investigating', 'resolved', 'false_alarm'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateData = {
      status,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };

    if (notes) {
      updateData.investigationNotes = notes;
    }

    const report = await HealthReport.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true, runValidators: true }
    ).populate('reporterId', 'name email phone role')
     .populate('verifiedBy', 'name email phone role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Health report not found'
      });
    }

    res.json({
      success: true,
      message: 'Health report status updated successfully',
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Update health report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating health report status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get health statistics
// @route   GET /api/health-reports/statistics
// @access  Private
const getHealthStatistics = async (req, res) => {
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
      pendingReports,
      verifiedReports,
      severityStats,
      symptomStats,
      recentReports
    ] = await Promise.all([
      HealthReport.countDocuments(query),
      HealthReport.countDocuments({ ...query, status: 'pending' }),
      HealthReport.countDocuments({ ...query, status: 'verified' }),
      HealthReport.aggregate([
        { $match: query },
        { $group: { _id: '$severityLevel', count: { $sum: 1 } } }
      ]),
      HealthReport.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalDiarrhea: { $sum: { $cond: ['$symptoms.diarrhea.present', 1, 0] } },
            totalFever: { $sum: { $cond: ['$symptoms.fever.present', 1, 0] } },
            totalVomiting: { $sum: { $cond: ['$symptoms.vomiting.present', 1, 0] } },
            totalStomachPain: { $sum: { $cond: ['$symptoms.stomachPain.present', 1, 0] } },
            totalDehydration: { $sum: { $cond: ['$symptoms.dehydration.present', 1, 0] } }
          }
        }
      ]),
      HealthReport.find(query)
        .populate('reporterId', 'name role')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        verifiedReports,
        severityStats: severityStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        symptomStats: symptomStats[0] || {
          totalDiarrhea: 0,
          totalFever: 0,
          totalVomiting: 0,
          totalStomachPain: 0,
          totalDehydration: 0
        },
        recentReports
      }
    });
  } catch (error) {
    console.error('Get health statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching health statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Sync offline reports
// @route   POST /api/health-reports/sync
// @access  Private
const syncOfflineReports = async (req, res) => {
  try {
    const { reports } = req.body;

    if (!Array.isArray(reports)) {
      return res.status(400).json({
        success: false,
        message: 'Reports must be an array'
      });
    }

    const syncedReports = [];
    const errors = [];

    for (const reportData of reports) {
      try {
        const report = await HealthReport.create({
          ...reportData,
          reporterId: req.user.id,
          village: req.user.village,
          state: req.user.state,
          district: req.user.district,
          isOffline: false,
          syncedAt: new Date()
        });

        syncedReports.push(report);

        // Trigger ML prediction
        try {
          await triggerMLPrediction(report);
        } catch (mlError) {
          console.error('ML prediction error for synced report:', mlError);
        }
      } catch (error) {
        errors.push({
          reportId: reportData.id || 'unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Offline reports synced successfully',
      data: {
        syncedCount: syncedReports.length,
        errorCount: errors.length,
        syncedReports,
        errors
      }
    });
  } catch (error) {
    console.error('Sync offline reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while syncing offline reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to trigger ML prediction
const triggerMLPrediction = async (healthReport) => {
  try {
    // This would call the ML service to get predictions
    // For now, we'll just log it
    console.log('Triggering ML prediction for health report:', healthReport._id);
    
    // In a real implementation, you would call the ML service here
    // const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
    //   healthData: healthReport
    // });
  } catch (error) {
    console.error('ML prediction trigger error:', error);
    throw error;
  }
};

module.exports = {
  createHealthReport,
  getHealthReports,
  getHealthReportById,
  updateHealthReportStatus,
  getHealthStatistics,
  syncOfflineReports
};
