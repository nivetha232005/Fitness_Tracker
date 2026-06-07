import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || 'male',
    height: user?.height || '',
    weight: user?.weight || '',
    fitnessGoal: user?.fitnessGoal || 'maintenance',
    dailyCalorieTarget: user?.dailyCalorieTarget || 2000,
    dailyWaterTarget: user?.dailyWaterTarget || 3000
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await updateProfile(formData);
    setLoading(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      return bmi;
    }
    return 'N/A';
  };

  const getBMICategory = () => {
    const bmi = calculateBMI();
    if (bmi === 'N/A') return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ fontSize: '1.5rem' }}>My Profile</h2>
          {!isEditing && (
            <button 
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {!isEditing ? (
          <div>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
                <h3 className="stat-title">Personal Information</h3>
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Name:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Age:</strong> {user?.age} years</p>
                  <p><strong>Gender:</strong> {user?.gender}</p>
                </div>
              </div>

              <div>
                <h3 className="stat-title">Body Metrics</h3>
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Height:</strong> {user?.height} cm</p>
                  <p><strong>Weight:</strong> {user?.weight} kg</p>
                  <p><strong>BMI:</strong> {calculateBMI()}</p>
                  <p><strong>BMI Category:</strong> {getBMICategory()}</p>
                </div>
              </div>

              <div>
                <h3 className="stat-title">Fitness Goals</h3>
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Primary Goal:</strong> {user?.fitnessGoal?.replace('_', ' ')}</p>
                  <p><strong>Daily Calories:</strong> {user?.dailyCalorieTarget} kcal</p>
                  <p><strong>Daily Water:</strong> {user?.dailyWaterTarget} ml</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  className="form-input"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fitness Goal</label>
                <select name="fitnessGoal" className="form-select" value={formData.fitnessGoal} onChange={handleChange}>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="endurance">Endurance</option>
                  <option value="flexibility">Flexibility</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  className="form-input"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  className="form-input"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label className="form-label">Daily Calorie Target (kcal)</label>
                <input
                  type="number"
                  name="dailyCalorieTarget"
                  className="form-input"
                  value={formData.dailyCalorieTarget}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Water Target (ml)</label>
                <input
                  type="number"
                  name="dailyWaterTarget"
                  className="form-input"
                  value={formData.dailyWaterTarget}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;