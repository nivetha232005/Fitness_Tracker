const express = require('express');
const {
  getTotalUsers,
  getActiveUsers,
  getWorkoutStatistics,
  getMealStatistics,
  manageUserAccounts
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats/users', getTotalUsers);
router.get('/stats/active-users', getActiveUsers);
router.get('/stats/workouts', getWorkoutStatistics);
router.get('/stats/meals', getMealStatistics);
router.put('/users/:id', manageUserAccounts);

module.exports = router;
