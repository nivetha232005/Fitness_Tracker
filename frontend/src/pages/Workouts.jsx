import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Workouts = () => {
  const { user, api } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    workoutName: '',
    category: 'strength',
    duration: 30,
    intensity: 'moderate',
    exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }],
    scheduledFor: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await api.get('/workouts');
      setWorkouts(response.data.data);
    } catch (error) {
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index][field] = value;
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: 3, reps: 10, weight: 0 }]
    });
  };

  const removeExercise = (index) => {
    const updatedExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workouts', formData);
      toast.success('Workout created successfully!');
      setShowForm(false);
      fetchWorkouts();
      setFormData({
        workoutName: '',
        category: 'strength',
        duration: 30,
        intensity: 'moderate',
        exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }],
        scheduledFor: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to create workout');
    }
  };

  const completeWorkout = async (id) => {
    try {
      await api.put(`/workouts/${id}/complete`);
      toast.success('Workout completed! Great job!');
      fetchWorkouts();
    } catch (error) {
      toast.error('Failed to complete workout');
    }
  };

  const deleteWorkout = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await api.delete(`/workouts/${id}`);
        toast.success('Workout deleted');
        fetchWorkouts();
      } catch (error) {
        toast.error('Failed to delete workout');
      }
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      strength: '💪',
      cardio: '🏃',
      yoga: '🧘',
      hiit: '⚡',
      flexibility: '🤸'
    };
    return icons[category] || '🏋️';
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      low: '#10b981',
      moderate: '#f59e0b',
      high: '#ef4444'
    };
    return colors[intensity] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ fontSize: '1.5rem' }}>💪 My Workouts</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + New Workout
          </button>
        </div>

        {/* Workout Statistics */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">📊</div>
            </div>
            <h3 className="stat-title">Total Workouts</h3>
            <p className="stat-value">{workouts.length}</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon green">✅</div>
            </div>
            <h3 className="stat-title">Completed</h3>
            <p className="stat-value">{workouts.filter(w => w.completed).length}</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon orange">⏳</div>
            </div>
            <h3 className="stat-title">Pending</h3>
            <p className="stat-value">{workouts.filter(w => !w.completed).length}</p>
          </div>
        </div>

        {/* Workout List */}
        {workouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>No workouts yet</p>
            <p style={{ marginTop: '0.5rem', color: '#9ca3af' }}>Click "New Workout" to create your first workout plan</p>
          </div>
        ) : (
          <div className="workouts-list">
            {workouts.map((workout) => (
              <div key={workout.id} className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getCategoryIcon(workout.category)}</span>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{workout.workoutName}</h3>
                      {workout.completed && (
                        <span style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <span>⏱️ {workout.duration} min</span>
                      <span>🔥 {workout.caloriesBurned} kcal</span>
                      <span style={{ color: getIntensityColor(workout.intensity) }}>
                        🎯 {workout.intensity}
                      </span>
                      <span>📅 {new Date(workout.scheduledFor).toLocaleDateString()}</span>
                    </div>
                    
                    {workout.exercises && workout.exercises.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong>Exercises:</strong>
                        <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                          {workout.exercises.map((exercise, idx) => (
                            <li key={idx}>
                              {exercise.name} - {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {workout.notes && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        📝 {workout.notes}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!workout.completed && (
                      <button
                        className="btn btn-success"
                        onClick={() => completeWorkout(workout.id)}
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        Complete
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteWorkout(workout.id)}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Workout Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Workout</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Workout Name</label>
                <input
                  type="text"
                  name="workoutName"
                  className="form-input"
                  value={formData.workoutName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Morning Cardio, Upper Body Day"
                />
              </div>
              
              <div className="row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" className="form-select" value={formData.category} onChange={handleInputChange}>
                    <option value="strength">Strength Training</option>
                    <option value="cardio">Cardio</option>
                    <option value="yoga">Yoga</option>
                    <option value="hiit">HIIT</option>
                    <option value="flexibility">Flexibility</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    className="form-input"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="form-group">
                  <label className="form-label">Intensity</label>
                  <select name="intensity" className="form-select" value={formData.intensity} onChange={handleInputChange}>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Scheduled Date</label>
                  <input
                    type="date"
                    name="scheduledFor"
                    className="form-input"
                    value={formData.scheduledFor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Exercises</label>
                {formData.exercises.map((exercise, index) => (
                  <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div className="row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <input
                          type="text"
                          placeholder="Exercise name"
                          className="form-input"
                          value={exercise.name}
                          onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input
                          type="number"
                          placeholder="Sets"
                          className="form-input"
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input
                          type="number"
                          placeholder="Reps"
                          className="form-input"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <input
                          type="number"
                          placeholder="Weight (kg)"
                          className="form-input"
                          value={exercise.weight}
                          onChange={(e) => handleExerciseChange(index, 'weight', parseInt(e.target.value))}
                        />
                      </div>
                      {formData.exercises.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeExercise(index)}
                          style={{ padding: '0.5rem', height: '42px' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addExercise} style={{ marginTop: '0.5rem' }}>
                  + Add Exercise
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  name="notes"
                  className="form-input"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional notes about this workout..."
                />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;