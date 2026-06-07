import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [todaySummary, setTodaySummary] = useState({
    caloriesConsumed: 0,
    caloriesBurned: 0,
    waterIntake: 0,
    workoutsCompleted: 0
  });

  useEffect(() => {
    // Simulate loading data
    setTodaySummary({
      caloriesConsumed: 1850,
      caloriesBurned: 450,
      waterIntake: 2100,
      workoutsCompleted: 1
    });
  }, []);

  const bmiCategory = () => {
    const bmi = user?.bmi;
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const waterPercentage = (todaySummary.waterIntake / (user?.dailyWaterTarget || 3000)) * 100;
  const calorieProgress = (todaySummary.caloriesConsumed / (user?.dailyCalorieTarget || 2000)) * 100;

  return (
    <div className="fade-in">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, {user?.name || 'User'}! 👋</h1>
        <p className="welcome-text">Let's crush your fitness goals today!</p>
        <div className="stats-badge">
          <div className="badge">
            <div className="badge-label">BMI</div>
            <div className="badge-value">{user?.bmi || 'N/A'}</div>
            <div className="badge-label" style={{ fontSize: '0.7rem' }}>{bmiCategory()}</div>
          </div>
          <div className="badge">
            <div className="badge-label">Goal</div>
            <div className="badge-value" style={{ textTransform: 'capitalize' }}>
              {user?.fitnessGoal?.replace('_', ' ') || 'Maintenance'}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">🍽️</div>
            <span>{Math.round(calorieProgress)}%</span>
          </div>
          <h3 className="stat-title">Calories Consumed</h3>
          <p className="stat-value">{todaySummary.caloriesConsumed} / {user?.dailyCalorieTarget || 2000}</p>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill blue" style={{ width: `${Math.min(100, calorieProgress)}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">🔥</div>
          </div>
          <h3 className="stat-title">Calories Burned</h3>
          <p className="stat-value">{todaySummary.caloriesBurned} kcal</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon cyan">💧</div>
            <span>{Math.round(waterPercentage)}%</span>
          </div>
          <h3 className="stat-title">Water Intake</h3>
          <p className="stat-value">{todaySummary.waterIntake}ml / {user?.dailyWaterTarget || 3000}ml</p>
          <div className="stat-progress-bar">
            <div className="stat-progress-fill cyan" style={{ width: `${Math.min(100, waterPercentage)}%` }}></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">💪</div>
          </div>
          <h3 className="stat-title">Workouts</h3>
          <p className="stat-value">{todaySummary.workoutsCompleted} completed</p>
        </div>
      </div>

      <div className="quick-actions">
        <button className="quick-action-btn action-purple" onClick={() => window.location.href = '/workouts'}>
          💪 Log Workout
        </button>
        <button className="quick-action-btn action-green" onClick={() => window.location.href = '/meals'}>
          🍽️ Add Meal
        </button>
        <button className="quick-action-btn action-cyan" onClick={() => window.location.href = '/water'}>
          💧 Log Water
        </button>
        <button className="quick-action-btn action-orange" onClick={() => window.location.href = '/ai-coach'}>
          🤖 AI Coach
        </button>
      </div>
    </div>
  );
};

export default Dashboard;