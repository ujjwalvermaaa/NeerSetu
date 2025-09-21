const axios = require('axios');
const logger = require('../utils/logger');

class AlertService {
  constructor() {
    this.alertsServiceUrl = process.env.ALERTS_SERVICE_URL || 'http://localhost:3004';
  }

  async createAlert(alertData) {
    try {
      const response = await axios.post(`${this.alertsServiceUrl}/api/alerts`, alertData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ALERTS_SERVICE_TOKEN || 'neersetu_token'}`
        },
        timeout: 10000
      });

      logger.info('Alert created successfully', {
        alertId: response.data.data?._id,
        type: alertData.type,
        village: alertData.village
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create alert', {
        error: error.message,
        alertData: alertData
      });
      throw error;
    }
  }

  async sendEmergencyAlert(village, riskIndex, message, recipients) {
    const alertData = {
      type: 'emergency',
      title: 'High Risk Detected',
      message: message,
      village: village,
      riskIndex: riskIndex,
      recipients: recipients,
      channels: ['sms', 'whatsapp', 'push'],
      priority: riskIndex >= 400 ? 'critical' : 'high'
    };

    return await this.createAlert(alertData);
  }

  async sendRiskUpdate(village, riskIndex, status, recommendations, recipients) {
    const alertData = {
      type: 'risk_update',
      title: 'Risk Level Update',
      message: `Risk level updated for ${village}. Current Risk Index: ${riskIndex}`,
      village: village,
      riskIndex: riskIndex,
      recipients: recipients,
      channels: ['whatsapp', 'push'],
      priority: 'medium',
      metadata: {
        status: status,
        recommendations: recommendations
      }
    };

    return await this.createAlert(alertData);
  }
}

module.exports = new AlertService();
