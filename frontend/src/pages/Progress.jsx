import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Progress = () => {
  const { user, api } = useAuth();
  const [progressLogs, setProgressLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: user?.weight || '',
    bodyFat: '',
    waistCircumference: '',
    notes: ''
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/progress');
      setProgressLogs(response.data.data);
    } catch (error) {
      const saved = localStorage.getItem('progress_logs');
      if (saved) setProgressLogs(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/progress', { ...formData, date: new Date() });
      toast.success('Progress logged!');
      setShowForm(false);
      fetchProgress();
      setFormData({ weight: '', bodyFat: '', waistCircumference: '', notes: '' });
    } catch (error) {
      const saved = localStorage.getItem('progress_logs');
      const logs = saved ? JSON.parse(saved) : [];
      logs.push({ id: Date.now(), ...formData, date: new Date().toISOString() });
      localStorage.setItem('progress_logs', JSON.stringify(logs));
      toast.success('Progress saved locally!');
      setShowForm(false);
      fetchProgress();
    }
  };

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const weightChanges = progressLogs.length >= 2 
    ? (progressLogs[0].weight - progressLogs[progressLogs.length - 1].weight).toFixed(1)
    : 0;

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
          <h2 className="card-title" style={{ fontSize: '1.5rem' }}>📊 Progress Tracking</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Log Progress</button>
        </div>

        {/* Current Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">⚖️</div>
            </div>
            <h3 className="stat-title">Current Weight</h3>
            <p className="stat-value">{user?.weight || '—'} kg</p>
            {weightChanges !== 0 && (
              <p style={{ color: weightChanges > 0 ? '#ef4444' : '#10b981', fontSize: '0.875rem' }}>
                {weightChanges > 0 ? `+${weightChanges}` : weightChanges} kg change
              </p>
            )}
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon orange">📏</div>
            </div>
            <h3 className="stat-title">BMI</h3>
            <p className="stat-value">{calculateBMI(user?.weight, user?.height) || '—'}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{getBMICategory(calculateBMI(user?.weight, user?.height))}</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon green">🎯</div>
            </div>
            <h3 className="stat-title">Goal Progress</h3>
            <p className="stat-value">{progressLogs.length} logs</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Keep tracking!</p>
          </div>
        </div>

        {/* Progress History */}
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Progress History</h3>
        {progressLogs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No progress logs yet. Start tracking your journey!</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Weight (kg)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Body Fat %</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Waist (cm)</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>BMI</th>
                </tr>
              </thead>
              <tbody>
                {progressLogs.map((log, idx) => {
                  const bmi = calculateBMI(log.weight, user?.height);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem' }}>{new Date(log.date).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem' }}>{log.weight || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>{log.bodyFat || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>{log.waistCircumference || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>{bmi || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Progress Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Log Progress</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" step="0.1" className="form-input" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Body Fat %</label>
                <input type="number" step="0.1" className="form-input" value={formData.bodyFat} onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Waist Circumference (cm)</label>
                <input type="number" step="0.1" className="form-input" value={formData.waistCircumference} onChange={(e) => setFormData({ ...formData, waistCircumference: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows="3" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Progress</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;