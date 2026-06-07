const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sets: {
    type: Number,
    required: true,
    min: 1
  },
  reps: {
    type: Number,
    required: true,
    min: 1
  },
  weight: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  }
});

const workoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  workoutName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'yoga', 'hiit', 'flexibility'],
    required: true
  },
  exercises: [exerciseSchema],
  duration: {
    type: Number,
    required: true
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate calories burned before saving
workoutSchema.pre('save', function(next) {
  if (this.duration) {
    const intensityMultiplier = {
      low: 3,
      moderate: 5,
      high: 8
    };
    const categoryMultiplier = {
      strength: 6,
      cardio: 8,
      yoga: 3,
      hiit: 10,
      flexibility: 4
    };
    this.caloriesBurned = Math.round(
      this.duration * intensityMultiplier[this.intensity] * categoryMultiplier[this.category]
    );
  }
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);