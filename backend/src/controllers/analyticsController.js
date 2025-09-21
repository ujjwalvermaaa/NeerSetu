const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

class AnalyticsController {
  async getDashboardStats(req, res) {
    try {
      const stats = await analyticsService.getDashboardStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get dashboard stats', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error.message
      });
    }
  }

  async getVillageAnalytics(req, res) {
    try {
      const { village } = req.params;
      const analytics = await analyticsService.getVillageAnalytics(village);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Failed to get village analytics', { error: error.message, village: req.params.village });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch village analytics',
        error: error.message
      });
    }
  }

  async generateReport(req, res) {
    try {
      const { village, startDate, endDate } = req.query;
      
      if (!village || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Village, startDate, and endDate are required'
        });
      }

      const report = await analyticsService.generateReport(
        village,
        new Date(startDate),
        new Date(endDate)
      );
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Failed to generate report', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to generate report',
        error: error.message
      });
    }
  }

  async getRiskDistribution(req, res) {
    try {
      const distribution = await analyticsService.getRiskDistribution();
      
      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      logger.error('Failed to get risk distribution', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch risk distribution',
        error: error.message
      });
    }
  }

  async getMonthlyTrends(req, res) {
    try {
      const trends = await analyticsService.getMonthlyTrends();
      
      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      logger.error('Failed to get monthly trends', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch monthly trends',
        error: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();
