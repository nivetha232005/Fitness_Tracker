const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number, // in ml
    required: true,
    min: [50, 'Please log at least 50ml'],
    max: [1000, 'Cannot log more than 1000ml at once']
  },
  date: {
    type: Date,
    default: Date.now
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
waterLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WaterLog', waterLogSchema);