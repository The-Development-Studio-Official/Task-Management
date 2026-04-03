// API utility for consistent API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  console.log(`API Call: ${options.method || 'GET'} ${url}`);
  
  // Get token from localStorage if available
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  
  if (!text) {
    if (response.ok) {
      return null;
    }
    throw new Error(`HTTP ${response.status}: Empty response`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error('Invalid JSON response:', text);
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
  }

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }

  return data;
};

export default apiCall;
