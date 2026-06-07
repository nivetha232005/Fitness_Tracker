const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    default: 0,
    min: 0
  },
  carbs: {
    type: Number,
    default: 0,
    min: 0
  },
  fats: {
    type: Number,
    default: 0,
    min: 0
  }
});

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
    required: true
  },
  foodItems: [foodItemSchema],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFats: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Calculate totals before saving
mealSchema.pre('save', function(next) {
  this.totalCalories = this.foodItems.reduce((sum, item) => sum + item.calories, 0);
  this.totalProtein = this.foodItems.reduce((sum, item) => sum + item.protein, 0);
  this.totalCarbs = this.foodItems.reduce((sum, item) => sum + item.carbs, 0);
  this.totalFats = this.foodItems.reduce((sum, item) => sum + item.fats, 0);
  next();
});

module.exports = mongoose.model('Meal', mealSchema);
