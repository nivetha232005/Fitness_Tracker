import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const WaterTracker = () => {
  const { user, api } = useAuth();
  const [todayIntake, setTodayIntake] = useState(0);
  const [waterLogs, setWaterLogs] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(250);
  const dailyGoal = user?.dailyWaterTarget || 3000;

  useEffect(() => {
    fetchWaterData();
  }, []);

  const fetchWaterData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [logsRes, weeklyRes] = await Promise.all([
        api.get(`/water?date=${today}`),
        api.get('/water/weekly')
      ]);
      setWaterLogs(logsRes.data.data);
      const total = logsRes.data.data.reduce((sum, log) => sum + log.amount, 0);
      setTodayIntake(total);
      setWeeklyData(weeklyRes.data.data);
    } catch (error) {
      // Use localStorage as fallback
      const saved = localStorage.getItem('water_logs');
      if (saved) {
        const logs = JSON.parse(saved);
        setWaterLogs(logs);
        const total = logs.reduce((sum, log) => sum + log.amount, 0);
        setTodayIntake(total);
      }
    } finally {
      setLoading(false);
    }
  };

  const addWater = async () => {
    try {
      await api.post('/water', { amount });
      toast.success(`${amount}ml water logged!`);
      setAmount(250);
      fetchWaterData();
    } catch (error) {
      // Save to localStorage
      const newLog = { id: Date.now(), amount, date: new Date().toISOString() };
      const saved = localStorage.getItem('water_logs');
      const logs = saved ? JSON.parse(saved) : [];
      logs.push(newLog);
      localStorage.setItem('water_logs', JSON.stringify(logs));
      fetchWaterData();
      toast.success(`${amount}ml water logged (saved locally)!`);
    }
  };

  const percentage = (todayIntake / dailyGoal) * 100;
  const remaining = Math.max(0, dailyGoal - todayIntake);

  const quickAdd = [250, 500, 750, 1000];

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
        <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>💧 Water Intake Tracker</h2>
        
        {/* Progress Circle */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <svg width="200" height="200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="15"/>
              <circle cx="100" cy="100" r="90" fill="none" stroke="#06b6d4" strokeWidth="15" 
                strokeDasharray={`${2 * Math.PI * 90 * (percentage / 100)} ${2 * Math.PI * 90}`}
                strokeLinecap="round" transform="rotate(-90 100 100)"/>
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{Math.round(percentage)}%</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>of daily goal</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{todayIntake}ml / {dailyGoal}ml</p>
            <p style={{ color: '#6b7280' }}>Remaining: {remaining}ml</p>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="quick-actions" style={{ marginBottom: '2rem' }}>
          {quickAdd.map(amt => (
            <button key={amt} className="quick-action-btn action-cyan" onClick={() => { setAmount(amt); addWater(); }}>
              +{amt}ml
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Custom Amount (ml)</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="number" className="form-input" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} />
            <button className="btn btn-primary" onClick={addWater}>Log Water</button>
          </div>
        </div>

        {/* Today's Logs */}
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Today's Logs</h3>
        {waterLogs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No water logged today</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {waterLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                <span>💧 +{log.amount}ml</span>
                <span style={{ color: '#6b7280' }}>{new Date(log.date).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Chart */}
        <h3 className="card-title" style={{ marginTop: '2rem', marginBottom: '1rem' }}>Weekly Overview</h3>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {weeklyData.map((day, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#06b6d4' }}>{day.amount || 0}ml</div>
              <div className="stat-progress-bar" style={{ marginTop: '0.5rem' }}>
                <div className="stat-progress-fill cyan" style={{ width: `${Math.min(100, ((day.amount || 0) / dailyGoal) * 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;