const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');

// @desc    Get total users
// @route   GET /api/admin/stats/users
// @access  Private/Admin
exports.getTotalUsers = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get active users
// @route   GET /api/admin/stats/active-users
// @access  Private/Admin
exports.getActiveUsers = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: thirtyDaysAgo }
    });
    
    const totalUsers = await User.countDocuments();
    const activePercentage = (activeUsers / totalUsers * 100).toFixed(1);
    
    res.status(200).json({
      success: true,
      data: {
        activeUsers,
        totalUsers,
        activePercentage
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get workout statistics
// @route   GET /api/admin/stats/workouts
// @access  Private/Admin
exports.getWorkoutStatistics = async (req, res, next) => {
  try {
    const totalWorkouts = await Workout.countDocuments();
    const completedWorkouts = await Workout.countDocuments({ completed: true });
    const totalCaloriesBurned = await Workout.aggregate([
      { $group: { _id: null, total: { $sum: '$caloriesBurned' } } }
    ]);
    
    // Workouts by category
    const workoutsByCategory = await Workout.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalWorkouts,
        completedWorkouts,
        completionRate: (completedWorkouts / totalWorkouts * 100).toFixed(1),
        totalCaloriesBurned: totalCaloriesBurned[0]?.total || 0,
        byCategory: workoutsByCategory
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get meal statistics
// @route   GET /api/admin/stats/meals
// @access  Private/Admin
exports.getMealStatistics = async (req, res, next) => {
  try {
    const totalMeals = await Meal.countDocuments();
    const totalCalories = await Meal.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCalories' } } }
    ]);
    
    // Meals by type
    const mealsByType = await Meal.aggregate([
      { $group: { _id: '$mealType', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalMeals,
        totalCalories: totalCalories[0]?.total || 0,
        byType: mealsByType
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Manage user accounts
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.manageUserAccounts = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
