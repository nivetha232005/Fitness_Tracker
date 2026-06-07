const express = require('express');
const {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealStats
} = require('../controllers/mealController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getMeals)
  .post(createMeal);

router.get('/stats/summary', getMealStats);

router.route('/:id')
  .get(getMeal)
  .put(updateMeal)
  .delete(deleteMeal);

module.exports = router;
