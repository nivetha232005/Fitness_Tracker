const ProgressLog = require('../models/ProgressLog');
const User = require('../models/User');

// @desc    Get progress logs
// @route   GET /api/progress
// @access  Private
exports.getProgressLogs = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    let query = { userId: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const progressLogs = await ProgressLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: progressLogs.length,
      data: progressLogs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create progress log
// @route   POST /api/progress
// @access  Private
exports.createProgressLog = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    
    // Update user's current weight if provided
    if (req.body.weight) {
      await User.findByIdAndUpdate(req.user.id, { weight: req.body.weight });
    }
    
    const progressLog = await ProgressLog.create(req.body);
    
    res.status(201).json({
      success: true,
      data: progressLog
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update progress log
// @route   PUT /api/progress/:id
// @access  Private
exports.updateProgressLog = async (req, res, next) => {
  try {
    let progressLog = await ProgressLog.findById(req.params.id);

    if (!progressLog) {
      return res.status(404).json({
        success: false,
        error: 'Progress log not found'
      });
    }

    if (progressLog.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    progressLog = await ProgressLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: progressLog
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete progress log
// @route   DELETE /api/progress/:id
// @access  Private
exports.deleteProgressLog = async (req, res, next) => {
  try {
    const progressLog = await ProgressLog.findById(req.params.id);

    if (!progressLog) {
      return res.status(404).json({
        success: false,
        error: 'Progress log not found'
      });
    }

    if (progressLog.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await progressLog.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get weekly progress
// @route   GET /api/progress/weekly
// @access  Private
exports.getWeeklyProgress = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const progressLogs = await ProgressLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: progressLogs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get monthly progress
// @route   GET /api/progress/monthly
// @access  Private
exports.getMonthlyProgress = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setHours(0, 0, 0, 0);

    const progressLogs = await ProgressLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: progressLogs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Calculate BMI
// @route   POST /api/progress/calculate-bmi
// @access  Private
exports.calculateBMI = async (req, res, next) => {
  try {
    const { weight, height } = req.body;
    const user = await User.findById(req.user.id);
    
    const userHeight = height || user.height;
    const userWeight = weight || user.weight;
    
    if (!userHeight || !userWeight) {
      return res.status(400).json({
        success: false,
        error: 'Height and weight are required'
      });
    }
    
    const heightInMeters = userHeight / 100;
    const bmi = (userWeight / (heightInMeters * heightInMeters)).toFixed(1);
    
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';
    
    res.status(200).json({
      success: true,
      data: {
        bmi,
        category,
        height: userHeight,
        weight: userWeight
      }
    });
  } catch (err) {
    next(err);
  }
};