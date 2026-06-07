const Workout = require('../models/Workout');

// @desc    Get all workouts for a user
// @route   GET /api/workouts
// @access  Private
exports.getWorkouts = async (req, res, next) => {
  try {
    const { startDate, endDate, completed, category } = req.query;
    let query = { userId: req.user.id };

    if (startDate && endDate) {
      query.scheduledFor = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    if (category) {
      query.category = category;
    }

    const workouts = await Workout.find(query).sort({ scheduledFor: -1 });
    
    res.status(200).json({
      success: true,
      count: workouts.length,
      data: workouts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found'
      });
    }

    // Make sure user owns workout
    if (workout.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
exports.createWorkout = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const workout = await Workout.create(req.body);
    
    res.status(201).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
exports.updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found'
      });
    }

    // Make sure user owns workout
    if (workout.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found'
      });
    }

    // Make sure user owns workout
    if (workout.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete workout
// @route   PUT /api/workouts/:id/complete
// @access  Private
exports.completeWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: 'Workout not found'
      });
    }

    if (workout.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    workout.completed = true;
    workout.completedAt = Date.now();
    await workout.save();

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get workout stats
// @route   GET /api/workouts/stats/summary
// @access  Private
exports.getWorkoutStats = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    let startDate;

    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(0);
    }

    const stats = await Workout.aggregate([
      {
        $match: {
          userId: req.user._id,
          completed: true,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCaloriesBurned: { $sum: '$caloriesBurned' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Get workouts by category
    const categoryStats = await Workout.aggregate([
      {
        $match: {
          userId: req.user._id,
          completed: true,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCalories: { $sum: '$caloriesBurned' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          totalWorkouts: 0,
          totalDuration: 0,
          totalCaloriesBurned: 0,
          avgDuration: 0
        },
        byCategory: categoryStats
      }
    });
  } catch (err) {
    next(err);
  }
};