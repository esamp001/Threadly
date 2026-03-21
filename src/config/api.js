// src/config/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  return response;
};

export default apiRequest;
