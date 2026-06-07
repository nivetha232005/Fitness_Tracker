const express = require('express');
const {
  getWorkoutPlan,
  getMealPlan,
  getFitnessAdvice,
  analyzeProgress
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/workout-plan', getWorkoutPlan);
router.post('/meal-plan', getMealPlan);
router.post('/advice', getFitnessAdvice);
router.post('/analyze-progress', analyzeProgress);

module.exports = router;
