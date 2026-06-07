const express = require('express');
const {
  getWaterLogs,
  createWaterLog,
  getDailyIntake,
  getWeeklyIntake
} = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWaterLogs)
  .post(createWaterLog);

router.get('/daily/:date', getDailyIntake);
router.get('/weekly', getWeeklyIntake);

module.exports = router;