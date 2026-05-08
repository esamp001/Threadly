// src/config/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  // Check if the body is FormData - if so, don't set Content-Type
  const isFormData = options.body instanceof FormData;

  const config = {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  // Only set Content-Type for non-FormData requests
  if (!isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export { API_URL };
export default apiRequest;
