const iotService = require('../services/iotService');
const logger = require('../utils/logger');

class IoTController {
  async processWaterData(req, res) {
    try {
      const result = await iotService.processWaterQualityData(req.body);
      
      res.json({
        success: true,
        message: 'Water quality data processed successfully',
        data: result
      });
    } catch (error) {
      logger.error('Failed to process water data', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to process water quality data',
        error: error.message
      });
    }
  }

  async getWaterQualityHistory(req, res) {
    try {
      const { village } = req.params;
      const { days = 7 } = req.query;
      
      const history = await iotService.getWaterQualityHistory(village, parseInt(days));
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Failed to get water quality history', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch water quality history',
        error: error.message
      });
    }
  }

  async getWaterQualityStats(req, res) {
    try {
      const { village } = req.params;
      
      const stats = await iotService.getWaterQualityStats(village);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get water quality stats', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch water quality statistics',
        error: error.message
      });
    }
  }
}

module.exports = new IoTController();
