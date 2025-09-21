const HealthReport = require('../models/HealthReport');
const WaterReport = require('../models/WaterReport');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const logger = require('../utils/logger');

class AnalyticsService {
  async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalHealthReports,
        totalWaterReports,
        activeAlerts,
        recentPredictions
      ] = await Promise.all([
        User.countDocuments(),
        HealthReport.countDocuments(),
        WaterReport.countDocuments(),
        this.getActiveAlertsCount(),
        Prediction.find().sort({ createdAt: -1 }).limit(10)
      ]);

      const stats = {
        totalUsers,
        totalHealthReports,
        totalWaterReports,
        activeAlerts,
        highRiskVillages: await this.getHighRiskVillages(),
        recentActivity: await this.getRecentActivity(),
        riskDistribution: await this.getRiskDistribution(),
        monthlyTrends: await this.getMonthlyTrends()
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get dashboard stats', { error: error.message });
      throw error;
    }
  }

  async getVillageAnalytics(village) {
    try {
      const [
        healthReports,
        waterReports,
        predictions,
        riskTrends
      ] = await Promise.all([
        HealthReport.find({ village }).sort({ createdAt: -1 }).limit(50),
        WaterReport.find({ village }).sort({ timestamp: -1 }).limit(50),
        Prediction.find({ village }).sort({ date: -1 }).limit(30),
        this.getVillageRiskTrends(village)
      ]);

      return {
        village,
        healthReports: healthReports.length,
        waterReports: waterReports.length,
        predictions: predictions.length,
        currentRiskIndex: predictions[0]?.riskIndex || 0,
        riskTrends,
        symptomsDistribution: this.getSymptomsDistribution(healthReports),
        waterQualityTrends: this.getWaterQualityTrends(waterReports)
      };
    } catch (error) {
      logger.error('Failed to get village analytics', { error: error.message, village });
      throw error;
    }
  }

  async getHighRiskVillages() {
    try {
      const predictions = await Prediction.aggregate([
        {
          $group: {
            _id: '$village',
            latestRiskIndex: { $max: '$riskIndex' },
            latestDate: { $max: '$date' }
          }
        },
        { $match: { latestRiskIndex: { $gte: 200 } } },
        { $sort: { latestRiskIndex: -1 } },
        { $limit: 10 }
      ]);

      return predictions;
    } catch (error) {
      logger.error('Failed to get high risk villages', { error: error.message });
      return [];
    }
  }

  async getRecentActivity() {
    try {
      const [recentHealth, recentWater] = await Promise.all([
        HealthReport.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name role'),
        WaterReport.find().sort({ timestamp: -1 }).limit(5)
      ]);

      return {
        healthReports: recentHealth,
        waterReports: recentWater
      };
    } catch (error) {
      logger.error('Failed to get recent activity', { error: error.message });
      return { healthReports: [], waterReports: [] };
    }
  }

  async getRiskDistribution() {
    try {
      const distribution = await Prediction.aggregate([
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ['$riskIndex', 100] }, then: 'Low' },
                  { case: { $lt: ['$riskIndex', 200] }, then: 'Moderate' },
                  { case: { $lt: ['$riskIndex', 300] }, then: 'High' },
                  { case: { $lt: ['$riskIndex', 400] }, then: 'Very High' },
                  { case: { $gte: ['$riskIndex', 400] }, then: 'Severe' }
                ],
                default: 'Unknown'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return distribution;
    } catch (error) {
      logger.error('Failed to get risk distribution', { error: error.message });
      return [];
    }
  }

  async getMonthlyTrends() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const trends = await Prediction.aggregate([
        { $match: { date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            avgRiskIndex: { $avg: '$riskIndex' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      return trends;
    } catch (error) {
      logger.error('Failed to get monthly trends', { error: error.message });
      return [];
    }
  }

  async getVillageRiskTrends(village) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trends = await Prediction.find({
        village,
        date: { $gte: thirtyDaysAgo }
      }).sort({ date: 1 });

      return trends.map(trend => ({
        date: trend.date,
        riskIndex: trend.riskIndex,
        probability: trend.outbreakProbability
      }));
    } catch (error) {
      logger.error('Failed to get village risk trends', { error: error.message, village });
      return [];
    }
  }

  getSymptomsDistribution(healthReports) {
    const symptoms = {};
    
    healthReports.forEach(report => {
      report.symptoms.forEach(symptom => {
        symptoms[symptom] = (symptoms[symptom] || 0) + 1;
      });
    });

    return Object.entries(symptoms)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count);
  }

  getWaterQualityTrends(waterReports) {
    return waterReports.map(report => ({
      date: report.timestamp,
      pH: report.pH,
      turbidity: report.turbidity,
      bacteriaLevel: report.bacteriaLevel,
      qualityScore: report.qualityScore || 0
    }));
  }

  async getActiveAlertsCount() {
    try {
      const axios = require('axios');
      const response = await axios.get(`${process.env.ALERTS_SERVICE_URL || 'http://localhost:3004'}/api/alerts/active/all`);
      return response.data.data?.length || 0;
    } catch (error) {
      logger.error('Failed to get active alerts count', { error: error.message });
      return 0;
    }
  }

  async generateReport(village, startDate, endDate) {
    try {
      const [healthReports, waterReports, predictions] = await Promise.all([
        HealthReport.find({
          village,
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        WaterReport.find({
          village,
          timestamp: { $gte: startDate, $lte: endDate }
        }),
        Prediction.find({
          village,
          date: { $gte: startDate, $lte: endDate }
        })
      ]);

      const report = {
        village,
        period: { startDate, endDate },
        summary: {
          totalHealthReports: healthReports.length,
          totalWaterReports: waterReports.length,
          totalPredictions: predictions.length,
          avgRiskIndex: predictions.reduce((sum, p) => sum + p.riskIndex, 0) / predictions.length || 0,
          highRiskDays: predictions.filter(p => p.riskIndex >= 300).length
        },
        healthData: this.analyzeHealthData(healthReports),
        waterData: this.analyzeWaterData(waterReports),
        predictions: this.analyzePredictions(predictions)
      };

      return report;
    } catch (error) {
      logger.error('Failed to generate report', { error: error.message, village });
      throw error;
    }
  }

  analyzeHealthData(healthReports) {
    const symptoms = {};
    const severityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
    
    healthReports.forEach(report => {
      report.symptoms.forEach(symptom => {
        symptoms[symptom] = (symptoms[symptom] || 0) + 1;
      });
      severityCounts[report.severity] = (severityCounts[report.severity] || 0) + 1;
    });

    return {
      totalReports: healthReports.length,
      symptomsDistribution: Object.entries(symptoms)
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((a, b) => b.count - a.count),
      severityDistribution: severityCounts,
      avgDuration: healthReports.reduce((sum, r) => sum + (r.duration || 0), 0) / healthReports.length || 0
    };
  }

  analyzeWaterData(waterReports) {
    if (waterReports.length === 0) return { totalReports: 0 };

    const avgPH = waterReports.reduce((sum, r) => sum + r.pH, 0) / waterReports.length;
    const avgTurbidity = waterReports.reduce((sum, r) => sum + r.turbidity, 0) / waterReports.length;
    const avgBacteria = waterReports.reduce((sum, r) => sum + r.bacteriaLevel, 0) / waterReports.length;
    const potableCount = waterReports.filter(r => r.isPotable).length;

    return {
      totalReports: waterReports.length,
      avgPH: Math.round(avgPH * 100) / 100,
      avgTurbidity: Math.round(avgTurbidity * 100) / 100,
      avgBacteria: Math.round(avgBacteria * 100) / 100,
      potablePercentage: Math.round((potableCount / waterReports.length) * 100),
      contaminationLevels: this.getContaminationDistribution(waterReports)
    };
  }

  getContaminationDistribution(waterReports) {
    const levels = { minimal: 0, low: 0, moderate: 0, high: 0 };
    
    waterReports.forEach(report => {
      levels[report.contaminationLevel] = (levels[report.contaminationLevel] || 0) + 1;
    });

    return levels;
  }

  analyzePredictions(predictions) {
    if (predictions.length === 0) return { totalPredictions: 0 };

    const avgRiskIndex = predictions.reduce((sum, p) => sum + p.riskIndex, 0) / predictions.length;
    const highRiskCount = predictions.filter(p => p.riskIndex >= 300).length;
    const avgProbability = predictions.reduce((sum, p) => sum + p.outbreakProbability, 0) / predictions.length;

    return {
      totalPredictions: predictions.length,
      avgRiskIndex: Math.round(avgRiskIndex * 100) / 100,
      highRiskCount,
      highRiskPercentage: Math.round((highRiskCount / predictions.length) * 100),
      avgProbability: Math.round(avgProbability * 100) / 100
    };
  }
}

module.exports = new AnalyticsService();
