// API utility for consistent API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...requestOptions } = options;

  console.log(`API Call: ${requestOptions.method || 'GET'} ${url}`);

  // Get token from localStorage if available
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...requestOptions.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const abortController = requestOptions.signal ? null : new AbortController();
  const timeoutHandle = abortController
    ? setTimeout(() => abortController.abort(), timeoutMs)
    : null;

  let response;
  try {
    response = await fetch(url, {
      ...requestOptions,
      headers,
      signal: requestOptions.signal || abortController?.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.ceil(timeoutMs / 1000)}s`);
    }
    throw error;
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }

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
    const message = data?.error || data?.message || `HTTP ${response.status}: Request failed`;
    const details = data?.details ? ` (${data.details})` : '';
    throw new Error(`${message}${details}`);
  }

  return data;
};

export default apiCall;
