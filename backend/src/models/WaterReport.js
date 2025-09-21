const mongoose = require('mongoose');

const waterReportSchema = new mongoose.Schema({
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
  waterSource: {
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Tube Well', 'Pond', 'Piped Supply', 'River', 'Well', 'Spring'],
      required: true
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  qualityParameters: {
    pH: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'pH' },
      standard: { type: Number, default: 6.5 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    turbidity: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'NTU' },
      standard: { type: Number, default: 5.0 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    bacteriaEcoli: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'CFU/100ml' },
      standard: { type: Number, default: 100 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    bacteriaColiform: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'CFU/100ml' },
      standard: { type: Number, default: 1000 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    dissolvedOxygen: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 5.0 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    nitrates: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 45 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    phosphates: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 0.1 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    heavyMetals: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 0.01 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    chlorineResidual: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 0.2 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    fluoride: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 1.5 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    },
    arsenic: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'mg/L' },
      standard: { type: Number, default: 0.01 },
      status: { type: String, enum: ['Safe', 'Unsafe'], default: 'Safe' }
    }
  },
  testingInfo: {
    method: {
      type: String,
      enum: ['IoT Sensor', 'Lab Analysis', 'Water Testing Kit', 'Manual'],
      required: true
    },
    agency: {
      type: String,
      required: true
    },
    testerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  overallStatus: {
    isPotable: {
      type: Boolean,
      required: true
    },
    contaminationLevel: {
      type: String,
      enum: ['Safe', 'Low', 'Medium', 'High', 'Critical'],
      required: true
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    }
  },
  images: [{
    type: String,
    default: []
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isIotData: {
    type: Boolean,
    default: false
  },
  depth: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
waterReportSchema.index({ village: 1, createdAt: -1 });
waterReportSchema.index({ 'waterSource.id': 1, createdAt: -1 });
waterReportSchema.index({ 'overallStatus.contaminationLevel': 1, createdAt: -1 });

module.exports = mongoose.model('WaterReport', waterReportSchema);
