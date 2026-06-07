const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');  // Changed from Meal to Meals
const ProgressLog = require('../models/ProgressLog');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get AI workout plan
// @route   POST /api/ai/workout-plan
// @access  Private
exports.getWorkoutPlan = async (req, res, next) => {
  try {
    const { goal, duration, equipment, experience, focusArea } = req.body;
    const user = await User.findById(req.user.id);

    const prompt = `Create a personalized workout plan with the following details:
    - Goal: ${goal || user.fitnessGoal}
    - Duration (weeks): ${duration || 4}
    - Equipment available: ${equipment || 'basic (dumbbells, resistance bands)'}
    - Experience level: ${experience || 'intermediate'}
    - Focus area: ${focusArea || 'full body'}
    - User details: Age ${user.age}, Gender ${user.gender}, Weight ${user.weight}kg, Height ${user.height}cm
    
    Provide a structured workout plan including:
    1. Weekly schedule (which days to train)
    2. Detailed exercises for each day with sets, reps, and rest periods
    3. Warm-up and cool-down recommendations
    4. Progression strategy
    5. Safety tips
    
    Format the response in clear sections with bullet points.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: {
        plan: text,
        metadata: {
          goal: goal || user.fitnessGoal,
          duration: duration || 4,
          experience: experience || 'intermediate'
        }
      }
    });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate workout plan. Please try again.'
    });
  }
};

// @desc    Get AI meal plan
// @route   POST /api/ai/meal-plan
// @access  Private
exports.getMealPlan = async (req, res, next) => {
  try {
    const { calories, dietaryPreference, mealsPerDay, duration } = req.body;
    const user = await User.findById(req.user.id);

    const targetCalories = calories || user.dailyCalorieTarget || 2000;

    const prompt = `Create a detailed ${duration || 7}-day meal plan with the following parameters:
    - Daily calorie target: ${targetCalories} calories
    - Dietary preference: ${dietaryPreference || 'balanced'}
    - Meals per day: ${mealsPerDay || 3} (plus snacks)
    - User details: Age ${user.age}, Gender ${user.gender}, Goal: ${user.fitnessGoal}
    
    For each day, provide:
    1. Breakfast (with calories, protein, carbs, fats)
    2. Lunch (with nutritional breakdown)
    3. Dinner (with nutritional breakdown)
    4. Snacks (if applicable)
    5. Hydration recommendations
    
    Include a grocery shopping list and meal prep tips.
    Format with clear daily sections and nutritional information.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: {
        plan: text,
        metadata: {
          dailyCalories: targetCalories,
          duration: duration || 7,
          preference: dietaryPreference || 'balanced'
        }
      }
    });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate meal plan. Please try again.'
    });
  }
};

// @desc    Get AI fitness advice
// @route   POST /api/ai/advice
// @access  Private
exports.getFitnessAdvice = async (req, res, next) => {
  try {
    const { question, context } = req.body;
    const user = await User.findById(req.user.id);

    // Get recent user data for context
    const recentWorkouts = await Workout.find({ 
      userId: user.id, 
      completed: true 
    }).sort({ completedAt: -1 }).limit(5);
    
    const recentMeals = await Meal.find({ 
      userId: user.id 
    }).sort({ date: -1 }).limit(5);
    
    const recentProgress = await ProgressLog.find({ 
      userId: user.id 
    }).sort({ date: -1 }).limit(3);

    const prompt = `As an AI fitness coach, answer the following question based on the user's data:
    
    User Question: ${question}
    
    User Profile:
    - Age: ${user.age}, Gender: ${user.gender}
    - Weight: ${user.weight}kg, Height: ${user.height}cm
    - Fitness Goal: ${user.fitnessGoal}
    - Daily Calorie Target: ${user.dailyCalorieTarget}
    
    Recent Activity:
    - Last 5 workouts: ${JSON.stringify(recentWorkouts.map(w => ({ name: w.workoutName, duration: w.duration, calories: w.caloriesBurned })))}
    - Recent meals: ${JSON.stringify(recentMeals.map(m => ({ type: m.mealType, calories: m.totalCalories })))}
    - Progress trend: ${JSON.stringify(recentProgress.map(p => ({ weight: p.weight, date: p.date })))}
    
    ${context ? `Additional Context: ${context}` : ''}
    
    Provide a helpful, evidence-based response that is:
    1. Personalized to the user's situation
    2. Actionable with specific recommendations
    3. Encouraging and motivational
    4. Safe and realistic
    
    Format the response in a conversational but professional manner.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: {
        advice: text,
        timestamp: new Date()
      }
    });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate advice. Please try again.'
    });
  }
};

// @desc    Analyze fitness progress with AI
// @route   POST /api/ai/analyze-progress
// @access  Private
exports.analyzeProgress = async (req, res, next) => {
  try {
    const { timeRange = 'month' } = req.body;
    const user = await User.findById(req.user.id);
    
    let startDate = new Date();
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const workouts = await Workout.find({
      userId: user.id,
      completed: true,
      completedAt: { $gte: startDate }
    }).sort({ completedAt: 1 });

    const progressLogs = await ProgressLog.find({
      userId: user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const meals = await Meal.find({
      userId: user.id,
      date: { $gte: startDate }
    });

    // Calculate stats
    const totalWorkouts = workouts.length;
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const avgWorkoutDuration = workouts.length > 0 
      ? workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length 
      : 0;
    
    const weightChange = progressLogs.length >= 2 
      ? progressLogs[progressLogs.length - 1].weight - progressLogs[0].weight 
      : 0;
    
    const avgDailyCalories = meals.length > 0
      ? meals.reduce((sum, m) => sum + m.totalCalories, 0) / (meals.length / 3)
      : 0;

    const prompt = `Analyze the user's fitness progress over the last ${timeRange} and provide insights:
    
    User Goal: ${user.fitnessGoal}
    
    Workout Statistics:
    - Total workouts: ${totalWorkouts}
    - Total calories burned: ${totalCaloriesBurned}
    - Average workout duration: ${avgWorkoutDuration.toFixed(0)} minutes
    - Consistency rate: ${(totalWorkouts / (timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365) * 100).toFixed(1)}%
    
    Body Metrics:
    - Starting weight: ${progressLogs[0]?.weight || user.weight}kg
    - Current weight: ${progressLogs[progressLogs.length - 1]?.weight || user.weight}kg
    - Weight change: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg
    
    Nutrition:
    - Estimated average daily calories: ${avgDailyCalories.toFixed(0)}
    
    Please provide:
    1. Overall progress assessment
    2. Strengths and areas for improvement
    3. Specific recommendations to accelerate progress
    4. Motivation and encouragement
    5. Next milestone suggestions
    
    Be honest but encouraging, focusing on actionable advice.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: {
        analysis: text,
        stats: {
          totalWorkouts,
          totalCaloriesBurned,
          avgWorkoutDuration,
          weightChange,
          avgDailyCalories
        },
        timeRange
      }
    });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze progress. Please try again.'
    });
  }
};