import axios from 'axios';

/**
 * Set the API base URL based on the environment
 * @returns {string} API base URL
 */
export function getApiBaseUrl() {
  if (import.meta.env.PROD) {
    return 'https://investuptrading.com/backend';
  }
  return 'http://localhost:5000';
}

/**
 * Creates a request configuration with proper headers for authentication
 * @param {string} token - Optional existing token
 * @returns {Object} Request configuration for axios
 */
export function createRequestConfig(token = null) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Add authorization token if provided
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
}

/**
 * Handles API errors
 * @param {Error} error - The error object from axios
 * @returns {string} Error message
 */
export function handleApiError(error) {
  if (error.response) {
    // Server responded with an error
    return error.response.data.message || 'An error occurred with the server.';
  } else if (error.request) {
    // Request was made but no response received
    return 'No response received from server. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred.';
  }
}

/**
 * Makes an API request and handles errors consistently
 * @param {Function} apiCallFn - Function that returns a promise (axios call)
 * @param {Function} setError - Function to set error state
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} - Promise resolved with the response data
 */
export const makeApiRequest = async (apiCallFn, setError, errorMessage = 'API Error') => {
  try {
    const response = await apiCallFn();
    return response.data;
  } catch (error) {
    const message = handleApiError(error);
    if (setError) {
      setError(message);
    }
    console.error(`${errorMessage}:`, error);
    throw error;
  }
}; 