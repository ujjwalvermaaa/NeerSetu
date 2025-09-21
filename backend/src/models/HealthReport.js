const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  patientDetails: {
    ageGroup: {
      type: String,
      enum: ['0-5', '6-18', '19-60', '60+'],
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    }
  },
  symptoms: {
    diarrhea: {
      present: { type: Boolean, default: false },
      severity: { type: Number, min: 1, max: 5, default: 1 },
      duration: { type: Number, default: 0 } // in days
    },
    fever: {
      present: { type: Boolean, default: false },
      severity: { type: Number, min: 1, max: 5, default: 1 },
      temperature: { type: Number, default: 0 } // in celsius
    },
    vomiting: {
      present: { type: Boolean, default: false },
      severity: { type: Number, min: 1, max: 5, default: 1 },
      frequency: { type: Number, default: 0 } // times per day
    },
    stomachPain: {
      present: { type: Boolean, default: false },
      severity: { type: Number, min: 1, max: 5, default: 1 }
    },
    dehydration: {
      present: { type: Boolean, default: false },
      severity: { type: Number, min: 1, max: 5, default: 1 }
    },
    nausea: {
      present: { type: Boolean, default: false },
      severity: { type: Number, min: 1, max: 5, default: 1 }
    },
    headache: {
      present: { type: Boolean, default: false },
      severity: { type: Number, min: 1, max: 5, default: 1 }
    },
    weakness: {
      present: { type: Boolean, default: false },
      severity: { type: Number, min: 1, max: 5, default: 1 }
    }
  },
  additionalInfo: {
    voiceNote: {
      type: String,
      default: ''
    },
    images: [{
      type: String,
      default: []
    }],
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, default: 0 }
  },
  severityLevel: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe', 'Critical'],
    default: 'Mild'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'investigating', 'resolved', 'false_alarm'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  isOffline: {
    type: Boolean,
    default: false
  },
  syncedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
healthReportSchema.index({ village: 1, createdAt: -1 });
healthReportSchema.index({ reporterId: 1, createdAt: -1 });
healthReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('HealthReport', healthReportSchema);
