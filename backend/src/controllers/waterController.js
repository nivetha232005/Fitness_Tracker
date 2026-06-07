const WaterLog = require('../models/WaterLog');

// @desc    Get water logs
// @route   GET /api/water
// @access  Private
exports.getWaterLogs = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;
    let query = { userId: req.user.id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const waterLogs = await WaterLog.find(query).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: waterLogs.length,
      data: waterLogs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create water log
// @route   POST /api/water
// @access  Private
exports.createWaterLog = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const waterLog = await WaterLog.create(req.body);
    
    res.status(201).json({
      success: true,
      data: waterLog
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get daily intake
// @route   GET /api/water/daily/:date
// @access  Private
exports.getDailyIntake = async (req, res, next) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const logs = await WaterLog.find({
      userId: req.user.id,
      date: { $gte: date, $lt: nextDate }
    });

    const total = logs.reduce((sum, log) => sum + log.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        date: req.params.date,
        total,
        logs
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get weekly intake
// @route   GET /api/water/weekly
// @access  Private
exports.getWeeklyIntake = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const logs = await WaterLog.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Group by date
    const dailyIntake = {};
    logs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      dailyIntake[dateKey] = (dailyIntake[dateKey] || 0) + log.amount;
    });

    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      weeklyData.push({
        date: dateKey,
        amount: dailyIntake[dateKey] || 0
      });
    }

    res.status(200).json({
      success: true,
      data: weeklyData
    });
  } catch (err) {
    next(err);
  }
};