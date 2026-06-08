// API Configuration - Automatically detects environment
const getApiUrl = () => {
  // Production - deployed on Render
  if (import.meta.env.PROD) {
    // Make sure to include /api at the end
    return 'https://fitness-tracker-backend.onrender.com/api';
  }
  // Development - local
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

// Helper function to get auth header
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
