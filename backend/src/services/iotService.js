const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

class IoTService {
  constructor() {
    this.iotSimulatorUrl = process.env.IOT_SIMULATOR_URL || 'http://localhost:3005';
  }

  async processWaterQualityData(data) {
    try {
      // Validate incoming IoT data
      const validatedData = this.validateWaterData(data);
      
      // Process and enhance the data
      const processedData = await this.enhanceWaterData(validatedData);
      
      // Store in database
      const waterReport = await this.storeWaterReport(processedData);
      
      // Trigger ML prediction
      const prediction = await this.triggerPrediction(processedData);
      
      // Check for alerts
      await this.checkForAlerts(processedData, prediction);
      
      logger.info('IoT water data processed successfully', {
        village: data.village,
        pH: data.pH,
        turbidity: data.turbidity,
        bacteriaLevel: data.bacteriaLevel
      });

      return {
        success: true,
        waterReport: waterReport,
        prediction: prediction
      };
    } catch (error) {
      logger.error('IoT water data processing failed', {
        error: error.message,
        data: data
      });
      throw error;
    }
  }

  validateWaterData(data) {
    const requiredFields = ['village', 'pH', 'turbidity', 'bacteriaLevel', 'timestamp'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate pH range (0-14)
    if (data.pH < 0 || data.pH > 14) {
      throw new Error('Invalid pH value. Must be between 0 and 14');
    }

    // Validate turbidity (0-100 NTU)
    if (data.turbidity < 0 || data.turbidity > 100) {
      throw new Error('Invalid turbidity value. Must be between 0 and 100');
    }

    // Validate bacteria level (0-1000 CFU/ml)
    if (data.bacteriaLevel < 0 || data.bacteriaLevel > 1000) {
      throw new Error('Invalid bacteria level. Must be between 0 and 1000');
    }

    return data;
  }

  async enhanceWaterData(data) {
    // Add calculated fields
    const enhancedData = {
      ...data,
      contaminationLevel: this.calculateContaminationLevel(data),
      isPotable: this.isWaterPotable(data),
      qualityScore: this.calculateQualityScore(data),
      riskLevel: this.calculateRiskLevel(data),
      processedAt: new Date(),
      source: 'iot_sensor'
    };

    return enhancedData;
  }

  calculateContaminationLevel(data) {
    let score = 0;
    
    // pH scoring (optimal range: 6.5-8.5)
    if (data.pH < 6.5 || data.pH > 8.5) {
      score += 30;
    }
    
    // Turbidity scoring (optimal: < 1 NTU)
    if (data.turbidity > 1) {
      score += Math.min(data.turbidity * 2, 40);
    }
    
    // Bacteria scoring (optimal: < 100 CFU/ml)
    if (data.bacteriaLevel > 100) {
      score += Math.min(data.bacteriaLevel / 10, 30);
    }
    
    if (score >= 80) return 'high';
    if (score >= 50) return 'moderate';
    if (score >= 20) return 'low';
    return 'minimal';
  }

  isWaterPotable(data) {
    return data.pH >= 6.5 && data.pH <= 8.5 && 
           data.turbidity <= 1 && 
           data.bacteriaLevel <= 100;
  }

  calculateQualityScore(data) {
    let score = 100;
    
    // pH penalty
    if (data.pH < 6.5 || data.pH > 8.5) {
      score -= 20;
    }
    
    // Turbidity penalty
    score -= Math.min(data.turbidity * 5, 30);
    
    // Bacteria penalty
    score -= Math.min(data.bacteriaLevel / 20, 30);
    
    return Math.max(0, Math.round(score));
  }

  calculateRiskLevel(data) {
    const contaminationLevel = this.calculateContaminationLevel(data);
    
    switch (contaminationLevel) {
      case 'high': return 'critical';
      case 'moderate': return 'high';
      case 'low': return 'medium';
      default: return 'low';
    }
  }

  async storeWaterReport(data) {
    const WaterReport = require('../models/WaterReport');
    
    const waterReport = new WaterReport({
      village: data.village,
      pH: data.pH,
      turbidity: data.turbidity,
      bacteriaLevel: data.bacteriaLevel,
      rainfall: data.rainfall || 0,
      timestamp: new Date(data.timestamp),
      location: data.location || { lat: 0, lng: 0 },
      contaminationLevel: data.contaminationLevel,
      isPotable: data.isPotable,
      qualityScore: data.qualityScore,
      riskLevel: data.riskLevel,
      source: 'iot_sensor',
      metadata: {
        processedAt: data.processedAt,
        iotDeviceId: data.deviceId || 'unknown'
      }
    });

    await waterReport.save();
    return waterReport;
  }

  async triggerPrediction(data) {
    const mlService = require('./mlService');
    
    try {
      const prediction = await mlService.predictOutbreak(
        { village: data.village },
        data,
        { rainfall: data.rainfall || 0, temperature: 25, humidity: 60 }
      );
      
      return prediction;
    } catch (error) {
      logger.error('ML prediction failed for IoT data', {
        error: error.message,
        village: data.village
      });
      return null;
    }
  }

  async checkForAlerts(data, prediction) {
    const alertService = require('./alertService');
    
    try {
      // Check if water quality is critical
      if (data.contaminationLevel === 'high' || data.riskLevel === 'critical') {
        const recipients = await this.getAlertRecipients(data.village);
        
        await alertService.sendEmergencyAlert(
          data.village,
          prediction?.riskIndex || 400,
          `Critical water contamination detected in ${data.village}. pH: ${data.pH}, Turbidity: ${data.turbidity}, Bacteria: ${data.bacteriaLevel}`,
          recipients
        );
      }
      
      // Check if prediction indicates high risk
      if (prediction && prediction.riskIndex >= 300) {
        const recipients = await this.getAlertRecipients(data.village);
        
        await alertService.sendRiskUpdate(
          data.village,
          prediction.riskIndex,
          prediction.riskLevel || 'high',
          prediction.recommendations || ['Monitor water quality closely'],
          recipients
        );
      }
    } catch (error) {
      logger.error('Alert checking failed for IoT data', {
        error: error.message,
        village: data.village
      });
    }
  }

  async getAlertRecipients(village) {
    // This would typically query the user database
    // For now, return mock data
    return [
      {
        type: 'role',
        value: 'asha',
        name: 'ASHA Worker',
        phone: '+919876543210'
      },
      {
        type: 'role',
        value: 'official',
        name: 'Block Health Officer',
        phone: '+919876543211'
      }
    ];
  }

  async getWaterQualityHistory(village, days = 7) {
    const WaterReport = require('../models/WaterReport');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const reports = await WaterReport.find({
      village: village,
      timestamp: { $gte: startDate },
      source: 'iot_sensor'
    }).sort({ timestamp: -1 });
    
    return reports;
  }

  async getWaterQualityStats(village) {
    const WaterReport = require('../models/WaterReport');
    
    const stats = await WaterReport.aggregate([
      { $match: { village: village, source: 'iot_sensor' } },
      {
        $group: {
          _id: null,
          avgPH: { $avg: '$pH' },
          avgTurbidity: { $avg: '$turbidity' },
          avgBacteriaLevel: { $avg: '$bacteriaLevel' },
          avgQualityScore: { $avg: '$qualityScore' },
          totalReports: { $sum: 1 },
          potableCount: { $sum: { $cond: ['$isPotable', 1, 0] } },
          highContaminationCount: { 
            $sum: { $cond: [{ $eq: ['$contaminationLevel', 'high'] }, 1, 0] } 
          }
        }
      }
    ]);
    
    return stats[0] || {};
  }
}

module.exports = new IoTService();

