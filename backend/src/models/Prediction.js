const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  village: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  predictionData: {
    // Health data
    totalDiarrheaCases: { type: Number, default: 0 },
    totalFeverCases: { type: Number, default: 0 },
    totalVomitingCases: { type: Number, default: 0 },
    totalAffectedPopulation: { type: Number, default: 0 },
    
    // Water quality data
    avgPH: { type: Number, required: true },
    avgTurbidity: { type: Number, required: true },
    avgBacteriaEcoli: { type: Number, required: true },
    avgBacteriaColiform: { type: Number, required: true },
    waterContaminated: { type: Boolean, default: false },
    
    // Environmental data
    dailyRainfall: { type: Number, required: true },
    weeklyRainfall: { type: Number, required: true },
    monthlyRainfall: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    floodRiskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    droughtIndicator: { type: String, enum: ['No', 'Mild', 'Moderate', 'Severe'], default: 'No' },
    
    // Seasonal data
    season: { type: String, enum: ['Winter', 'Summer', 'Monsoon', 'Post-Monsoon'], required: true },
    month: { type: Number, min: 1, max: 12, required: true }
  },
  mlPrediction: {
    outbreakProbability: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    riskIndex: {
      type: Number,
      min: 0,
      max: 500,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Very High', 'Severe'],
      required: true
    },
    contributingFactors: [{
      factor: { type: String, required: true },
      importance: { type: Number, min: 0, max: 1, required: true },
      description: { type: String, required: true }
    }],
    modelVersion: {
      type: String,
      default: '1.0.0'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'investigating', 'resolved', 'false_positive'],
    default: 'active'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  investigationNotes: {
    type: String,
    maxlength: [1000, 'Investigation notes cannot exceed 1000 characters']
  },
  actualOutbreak: {
    occurred: { type: Boolean, default: false },
    actualCases: { type: Number, default: 0 },
    actualDuration: { type: Number, default: 0 }, // in days
    verifiedAt: { type: Date }
  }
}, {
  timestamps: true
});

// Index for efficient queries
predictionSchema.index({ village: 1, createdAt: -1 });
predictionSchema.index({ 'mlPrediction.riskIndex': -1, createdAt: -1 });
predictionSchema.index({ status: 1, createdAt: -1 });
predictionSchema.index({ 'mlPrediction.riskLevel': 1, createdAt: -1 });

// Virtual for risk color
predictionSchema.virtual('riskColor').get(function() {
  const riskIndex = this.mlPrediction.riskIndex;
  if (riskIndex <= 100) return 'green';
  if (riskIndex <= 200) return 'yellow';
  if (riskIndex <= 300) return 'orange';
  if (riskIndex <= 400) return 'red';
  return 'purple';
});

// Virtual for risk description
predictionSchema.virtual('riskDescription').get(function() {
  const riskIndex = this.mlPrediction.riskIndex;
  if (riskIndex <= 100) return 'Low risk - Normal conditions';
  if (riskIndex <= 200) return 'Moderate risk - Monitor closely';
  if (riskIndex <= 300) return 'High risk - Take precautions';
  if (riskIndex <= 400) return 'Very high risk - Immediate action needed';
  return 'Severe risk - Emergency response required';
});

module.exports = mongoose.model('Prediction', predictionSchema);
