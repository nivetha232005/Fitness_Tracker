import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Return error message
      return Promise.reject(data?.error || 'An error occurred');
    } else if (error.request) {
      // Request was made but no response
      return Promise.reject('Network error - please check your connection');
    } else {
      // Something else happened
      return Promise.reject(error.message || 'An error occurred');
    }
  }
);

// API Service methods
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  updateDetails: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
};

export const workoutService = {
  getWorkouts: (params) => api.get('/workouts', { params }),
  getWorkout: (id) => api.get(`/workouts/${id}`),
  createWorkout: (data) => api.post('/workouts', data),
  updateWorkout: (id, data) => api.put(`/workouts/${id}`, data),
  deleteWorkout: (id) => api.delete(`/workouts/${id}`),
  completeWorkout: (id) => api.put(`/workouts/${id}/complete`),
  getStats: () => api.get('/workouts/stats/summary'),
};

export const mealService = {
  getMeals: (params) => api.get('/meals', { params }),
  getMeal: (id) => api.get(`/meals/${id}`),
  createMeal: (data) => api.post('/meals', data),
  updateMeal: (id, data) => api.put(`/meals/${id}`, data),
  deleteMeal: (id) => api.delete(`/meals/${id}`),
  getStats: () => api.get('/meals/stats/summary'),
};

export const waterService = {
  getWaterLogs: (params) => api.get('/water', { params }),
  createWaterLog: (data) => api.post('/water', data),
  getDailyIntake: (date) => api.get(`/water/daily/${date}`),
  getWeeklyIntake: () => api.get('/water/weekly'),
};

export const progressService = {
  getProgressLogs: (params) => api.get('/progress', { params }),
  createProgressLog: (data) => api.post('/progress', data),
  updateProgressLog: (id, data) => api.put(`/progress/${id}`, data),
  deleteProgressLog: (id) => api.delete(`/progress/${id}`),
  getWeekly: () => api.get('/progress/weekly'),
  getMonthly: () => api.get('/progress/monthly'),
  calculateBMI: (data) => api.post('/progress/calculate-bmi', data),
};

export const aiService = {
  getWorkoutPlan: (data) => api.post('/ai/workout-plan', data),
  getMealPlan: (data) => api.post('/ai/meal-plan', data),
  getAdvice: (data) => api.post('/ai/advice', data),
  analyzeProgress: (data) => api.post('/ai/analyze-progress', data),
};

export default api;
