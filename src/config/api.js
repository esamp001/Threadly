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
    // Add timeout to detect connection issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    
    // Enhanced error logging
    if (error.name === 'AbortError') {
      console.error('Request timed out after 30 seconds');
      throw new Error('Request timed out - please try again');
    } else if (error.message.includes('Connection ended unexpectedly')) {
      console.error('Connection was terminated unexpectedly');
      throw new Error('Connection ended unexpectedly - server may be overloaded');
    } else {
      throw error;
    }
  }
};

export { API_URL };
export default apiRequest;
