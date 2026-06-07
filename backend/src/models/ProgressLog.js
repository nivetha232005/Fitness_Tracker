const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    min: 20,
    max: 500
  },
  bodyFat: {
    type: Number,
    min: 0,
    max: 60
  },
  muscleMass: {
    type: Number,
    min: 0,
    max: 200
  },
  bmi: {
    type: Number
  },
  waistCircumference: {
    type: Number,
    min: 30,
    max: 300
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    maxlength: 500
  }
});

// Calculate BMI before saving
progressLogSchema.pre('save', async function(next) {
  if (this.weight) {
    const user = await mongoose.model('User').findById(this.userId);
    if (user && user.height) {
      const heightInMeters = user.height / 100;
      this.bmi = (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
  }
  next();
});

module.exports = mongoose.model('ProgressLog', progressLogSchema);