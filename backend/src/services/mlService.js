const axios = require('axios');
const logger = require('../utils/logger');

class MLService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  }

  async getPrediction(data) {
    try {
      const response = await axios.post(`${this.mlServiceUrl}/predict`, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      logger.info('ML prediction received', {
        village: data.village,
        riskIndex: response.data.riskIndex,
        probability: response.data.probability
      });

      return response.data;
    } catch (error) {
      logger.error('ML prediction failed', { error: error.message, data: data });
      throw error;
    }
  }

  async predictOutbreak(healthData, waterData, environmentalData) {
    const predictionData = {
      village: healthData.village || waterData.village,
      pH: waterData.pH,
      turbidity: waterData.turbidity,
      bacteriaLevel: waterData.bacteriaLevel,
      rainfall: environmentalData.rainfall,
      temperature: environmentalData.temperature || 25,
      humidity: environmentalData.humidity || 60,
      symptoms: healthData.symptoms || [],
      severity: healthData.severity || 'low',
      duration: healthData.duration || 1,
      timestamp: new Date().toISOString()
    };

    return await this.getPrediction(predictionData);
  }
}

module.exports = new MLService();
