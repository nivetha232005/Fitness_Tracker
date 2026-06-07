import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Meals = () => {
  const { user, api } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    mealType: 'breakfast',
    foodItems: [{ name: '', calories: 0, protein: 0, carbs: 0, fats: 0, quantity: '1 serving' }],
    notes: ''
  });

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  const fetchMeals = async () => {
    try {
      const response = await api.get(`/meals?date=${selectedDate}`);
      setMeals(response.data.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
      // Use localStorage as fallback
      const savedMeals = localStorage.getItem(`meals_${selectedDate}`);
      if (savedMeals) {
        setMeals(JSON.parse(savedMeals));
      }
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

  const handleFoodItemChange = (index, field, value) => {
    const updatedItems = [...formData.foodItems];
    updatedItems[index][field] = field === 'calories' || field === 'protein' || field === 'carbs' || field === 'fats' 
      ? parseInt(value) || 0 
      : value;
    setFormData({ ...formData, foodItems: updatedItems });
  };

  const addFoodItem = () => {
    setFormData({
      ...formData,
      foodItems: [...formData.foodItems, { name: '', calories: 0, protein: 0, carbs: 0, fats: 0, quantity: '1 serving' }]
    });
  };

  const removeFoodItem = (index) => {
    const updatedItems = formData.foodItems.filter((_, i) => i !== index);
    setFormData({ ...formData, foodItems: updatedItems });
  };

  const calculateTotals = () => {
    return formData.foodItems.reduce((totals, item) => ({
      calories: totals.calories + (item.calories || 0),
      protein: totals.protein + (item.protein || 0),
      carbs: totals.carbs + (item.carbs || 0),
      fats: totals.fats + (item.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totals = calculateTotals();
    const mealData = {
      ...formData,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFats: totals.fats,
      date: selectedDate
    };

    try {
      await api.post('/meals', mealData);
      toast.success('Meal added successfully!');
      setShowForm(false);
      fetchMeals();
      setFormData({
        mealType: 'breakfast',
        foodItems: [{ name: '', calories: 0, protein: 0, carbs: 0, fats: 0, quantity: '1 serving' }],
        notes: ''
      });
    } catch (error) {
      // Save to localStorage as fallback
      const savedMeals = localStorage.getItem(`meals_${selectedDate}`);
      const mealsList = savedMeals ? JSON.parse(savedMeals) : [];
      mealsList.push({ id: Date.now(), ...mealData });
      localStorage.setItem(`meals_${selectedDate}`, JSON.stringify(mealsList));
      toast.success('Meal saved locally!');
      setShowForm(false);
      fetchMeals();
    }
  };

  const deleteMeal = async (id) => {
    if (window.confirm('Delete this meal?')) {
      try {
        await api.delete(`/meals/${id}`);
        toast.success('Meal deleted');
        fetchMeals();
      } catch (error) {
        // Remove from localStorage
        const savedMeals = localStorage.getItem(`meals_${selectedDate}`);
        if (savedMeals) {
          const mealsList = JSON.parse(savedMeals);
          const filtered = mealsList.filter(m => m.id !== id);
          localStorage.setItem(`meals_${selectedDate}`, JSON.stringify(filtered));
          fetchMeals();
          toast.success('Meal deleted');
        }
      }
    }
  };

  const getMealIcon = (type) => {
    const icons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' };
    return icons[type] || '🍽️';
  };

  const dailyTotals = meals.reduce((totals, meal) => ({
    calories: totals.calories + (meal.totalCalories || 0),
    protein: totals.protein + (meal.totalProtein || 0),
    carbs: totals.carbs + (meal.totalCarbs || 0),
    fats: totals.fats + (meal.totalFats || 0)
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

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
          <h2 className="card-title" style={{ fontSize: '1.5rem' }}>🍽️ Meal Tracker</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Meal
          </button>
        </div>

        {/* Date Selector */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Select Date</label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>

        {/* Daily Nutrition Summary */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon orange">🔥</div>
            </div>
            <h3 className="stat-title">Total Calories</h3>
            <p className="stat-value">{dailyTotals.calories} / {user?.dailyCalorieTarget || 2000}</p>
            <div className="stat-progress-bar">
              <div className="stat-progress-fill orange" style={{ width: `${Math.min(100, (dailyTotals.calories / (user?.dailyCalorieTarget || 2000)) * 100)}%` }}></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">💪</div>
            </div>
            <h3 className="stat-title">Protein</h3>
            <p className="stat-value">{dailyTotals.protein}g</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon green">🌾</div>
            </div>
            <h3 className="stat-title">Carbs</h3>
            <p className="stat-value">{dailyTotals.carbs}g</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon red">🥑</div>
            </div>
            <h3 className="stat-title">Fats</h3>
            <p className="stat-value">{dailyTotals.fats}g</p>
          </div>
        </div>

        {/* Meals List */}
        {meals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>No meals logged for this day</p>
            <p style={{ marginTop: '0.5rem', color: '#9ca3af' }}>Click "Add Meal" to track your nutrition</p>
          </div>
        ) : (
          <div>
            {['breakfast', 'lunch', 'dinner', 'snacks'].map(type => {
              const typeMeals = meals.filter(m => m.mealType === type);
              if (typeMeals.length === 0) return null;
              return (
                <div key={type} style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    {getMealIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </h3>
                  {typeMeals.map((meal) => (
                    <div key={meal.id} className="card" style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          {meal.foodItems.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                              <strong>{item.name}</strong> ({item.quantity})
                              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                {item.calories} cal | P: {item.protein}g | C: {item.carbs}g | F: {item.fats}g
                              </div>
                            </div>
                          ))}
                          <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                            Total: {meal.totalCalories} calories | P: {meal.totalProtein}g | C: {meal.totalCarbs}g | F: {meal.totalFats}g
                          </div>
                          {meal.notes && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>📝 {meal.notes}</p>}
                        </div>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteMeal(meal.id)}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Meal Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Meal</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Meal Type</label>
                <select name="mealType" className="form-select" value={formData.mealType} onChange={handleInputChange}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snacks">Snacks</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Food Items</label>
                {formData.foodItems.map((item, index) => (
                  <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Food name"
                      className="form-input"
                      value={item.name}
                      onChange={(e) => handleFoodItemChange(index, 'name', e.target.value)}
                      required
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Quantity (e.g., 1 cup, 200g)"
                      className="form-input"
                      value={item.quantity}
                      onChange={(e) => handleFoodItemChange(index, 'quantity', e.target.value)}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <div className="row">
                      <input type="number" placeholder="Calories" className="form-input" value={item.calories} onChange={(e) => handleFoodItemChange(index, 'calories', e.target.value)} />
                      <input type="number" placeholder="Protein (g)" className="form-input" value={item.protein} onChange={(e) => handleFoodItemChange(index, 'protein', e.target.value)} />
                      <input type="number" placeholder="Carbs (g)" className="form-input" value={item.carbs} onChange={(e) => handleFoodItemChange(index, 'carbs', e.target.value)} />
                      <input type="number" placeholder="Fats (g)" className="form-input" value={item.fats} onChange={(e) => handleFoodItemChange(index, 'fats', e.target.value)} />
                    </div>
                    {formData.foodItems.length > 1 && (
                      <button type="button" className="btn btn-danger" onClick={() => removeFoodItem(index)} style={{ marginTop: '0.5rem' }}>Remove</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addFoodItem}>+ Add Food Item</button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea name="notes" className="form-input" value={formData.notes} onChange={handleInputChange} rows="2" />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Meal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meals;