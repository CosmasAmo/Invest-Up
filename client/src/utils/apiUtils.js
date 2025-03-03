import axios from 'axios';

/**
 * Creates a request configuration with proper headers for authentication
 * @returns {Object} Request configuration for axios
 */
export const createRequestConfig = () => {
  // Get the token from localStorage
  const token = localStorage.getItem('auth_token');
  
  // Create a request config with explicit headers
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true
  };
  
  // Add Authorization header if we have a token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
};

/**
 * Handles API errors
 * @param {Error} error - The error object from axios
 * @param {Function} setError - Function to set the error state
 * @param {string} customMessage - Custom error message prefix
 */
export const handleApiError = (error, setError, customMessage = 'API Error') => {
  console.error(`${customMessage}:`, error);
  setError(error.message || 'An unknown error occurred');
};

/**
 * Makes an authenticated API request with proper error handling
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {Object} data - Request data (for POST/PUT)
 * @param {Function} setError - Function to set error state
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} - Promise with the response data
 */
export const makeApiRequest = async (method, url, data = null, setError, errorMessage) => {
  try {
    const config = createRequestConfig();
    
    let response;
    if (method.toLowerCase() === 'get') {
      response = await axios.get(url, config);
    } else if (method.toLowerCase() === 'post') {
      response = await axios.post(url, data, config);
    } else if (method.toLowerCase() === 'put') {
      response = await axios.put(url, data, config);
    } else if (method.toLowerCase() === 'delete') {
      response = await axios.delete(url, config);
    }
    
    return response.data;
  } catch (error) {
    handleApiError(error, setError, errorMessage);
    throw error;
  }
}; 