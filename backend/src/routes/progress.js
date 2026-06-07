const express = require('express');
const {
  getProgressLogs,
  createProgressLog,
  updateProgressLog,
  deleteProgressLog,
  getWeeklyProgress,
  getMonthlyProgress,
  calculateBMI
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProgressLogs)
  .post(createProgressLog);

router.get('/weekly', getWeeklyProgress);
router.get('/monthly', getMonthlyProgress);
router.post('/calculate-bmi', calculateBMI);

router.route('/:id')
  .put(updateProgressLog)
  .delete(deleteProgressLog);

module.exports = router;