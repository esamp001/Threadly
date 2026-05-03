// src/config/api.js
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://threadly-xfzn.onrender.com' : 'http://localhost:3000');

console.log(API_URL, "API_URL")

const apiRequest = async (endpoint, options = {}) => {
  console.log("HIT HERE INSIDE API REQUEST")
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  console.log('API Request:', `${API_URL}${endpoint}`, config);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    console.log('API Response:', response.status, response.statusText);
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export { API_URL };
export default apiRequest;
