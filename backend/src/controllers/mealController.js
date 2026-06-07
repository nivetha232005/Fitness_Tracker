const Meal = require('../models/Meal');  // Changed from Meals to Meal

exports.getMeals = async (req, res, next) => {
  try {
    const { date, mealType } = req.query;
    let query = { userId: req.user.id };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (mealType) {
      query.mealType = mealType;
    }
    
    const meals = await Meal.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: meals.length, data: meals });
  } catch (err) { 
    next(err); 
  }
};

exports.getMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }
    if (meal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    res.status(200).json({ success: true, data: meal });
  } catch (err) { 
    next(err); 
  }
};

exports.createMeal = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const meal = await Meal.create(req.body);
    res.status(201).json({ success: true, data: meal });
  } catch (err) { 
    next(err); 
  }
};

exports.updateMeal = async (req, res, next) => {
  try {
    let meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }
    if (meal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: meal });
  } catch (err) { 
    next(err); 
  }
};

exports.deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }
    if (meal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    await meal.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) { 
    next(err); 
  }
};

exports.getMealStats = async (req, res, next) => {
  try {
    const stats = await Meal.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, totalCalories: { $sum: '$totalCalories' }, avgCalories: { $avg: '$totalCalories' } } }
    ]);
    res.status(200).json({ success: true, data: stats[0] || { totalCalories: 0, avgCalories: 0 } });
  } catch (err) { 
    next(err); 
  }
};