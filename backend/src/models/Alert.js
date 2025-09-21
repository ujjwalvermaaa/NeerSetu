const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
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
  alertType: {
    type: String,
    enum: ['outbreak_prediction', 'water_contamination', 'environmental_risk', 'health_surge', 'system_alert'],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  riskIndex: {
    type: Number,
    min: 0,
    max: 500,
    required: true
  },
  predictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction'
  },
  healthReportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthReport'
  },
  waterReportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WaterReport'
  },
  recipients: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['villager', 'asha_worker', 'official', 'admin'],
      required: true
    },
    deliveryStatus: {
      sms: {
        sent: { type: Boolean, default: false },
        delivered: { type: Boolean, default: false },
        sentAt: { type: Date },
        deliveredAt: { type: Date },
        error: { type: String }
      },
      whatsapp: {
        sent: { type: Boolean, default: false },
        delivered: { type: Boolean, default: false },
        sentAt: { type: Date },
        deliveredAt: { type: Date },
        error: { type: String }
      },
      push: {
        sent: { type: Boolean, default: false },
        delivered: { type: Boolean, default: false },
        sentAt: { type: Date },
        deliveredAt: { type: Date },
        error: { type: String }
      },
      email: {
        sent: { type: Boolean, default: false },
        delivered: { type: Boolean, default: false },
        sentAt: { type: Date },
        deliveredAt: { type: Date },
        error: { type: String }
      }
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'acknowledged', 'escalated', 'resolved', 'expired'],
    default: 'pending'
  },
  acknowledgedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: { type: Date },
    notes: { type: String }
  }],
  escalation: {
    isEscalated: { type: Boolean, default: false },
    escalatedAt: { type: Date },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalationReason: { type: String },
    escalationLevel: { type: Number, default: 0 }
  },
  actionRequired: {
    type: String,
    enum: ['monitor', 'investigate', 'intervene', 'emergency_response'],
    required: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  expiresAt: {
    type: Date,
    required: true
  },
  metadata: {
    source: { type: String, default: 'system' },
    tags: [{ type: String }],
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
alertSchema.index({ village: 1, createdAt: -1 });
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ severity: 1, createdAt: -1 });
alertSchema.index({ expiresAt: 1 });
alertSchema.index({ 'recipients.userId': 1, createdAt: -1 });

// Virtual for alert color
alertSchema.virtual('alertColor').get(function() {
  switch (this.severity) {
    case 'Low': return 'blue';
    case 'Medium': return 'yellow';
    case 'High': return 'orange';
    case 'Critical': return 'red';
    default: return 'gray';
  }
});

// Virtual for delivery rate
alertSchema.virtual('deliveryRate').get(function() {
  const totalRecipients = this.recipients.length;
  if (totalRecipients === 0) return 0;
  
  const deliveredCount = this.recipients.filter(recipient => 
    recipient.deliveryStatus.sms.delivered || 
    recipient.deliveryStatus.whatsapp.delivered || 
    recipient.deliveryStatus.push.delivered
  ).length;
  
  return (deliveredCount / totalRecipients) * 100;
});

// Method to check if alert needs escalation
alertSchema.methods.needsEscalation = function() {
  const now = new Date();
  const timeSinceCreated = now - this.createdAt;
  const escalationTime = 60 * 60 * 1000; // 1 hour in milliseconds
  
  return !this.escalation.isEscalated && 
         timeSinceCreated > escalationTime && 
         this.status !== 'acknowledged' && 
         this.status !== 'resolved';
};

module.exports = mongoose.model('Alert', alertSchema);
