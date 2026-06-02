import axios from 'axios';

// Determine the correct base URL for API calls
const determineBaseURL = () => {
    // Use environment variable if available
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // Fallback logic for when env variables aren't available
    if (import.meta.env.PROD) {
        const hostname = window.location.hostname;
        // If accessing via the main domain, point to the backend subdomain
        if (hostname === 'investuptrading.com' || hostname === 'www.investuptrading.com') {
            return 'https://backend.investuptrading.com';
        }
        // If already on the backend domain, use the same origin
        if (hostname === 'backend.investuptrading.com') {
            return '';  // Empty string means use current origin
        }
        // Default production fallback
        return 'https://backend.investuptrading.com';
    }
    // In development, use localhost
    return 'http://localhost:5000';
};

// Get timeout value from environment variable or use default
const apiTimeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000;

const instance = axios.create({
    baseURL: determineBaseURL(),
    withCredentials: true,
    timeout: apiTimeout, // Use timeout from environment or default
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the token in the Authorization header
instance.interceptors.request.use(
  (config) => {
    // Check if sending FormData and adjust content type appropriately
    if (config.data instanceof FormData) {
      console.log('FormData detected in request, removing Content-Type header');
      delete config.headers['Content-Type'];
      // In some cases, browsers might need this explicit setting
      // config.headers['Content-Type'] = 'multipart/form-data';
    }

    // Try to get token from localStorage first (most reliable)
    let token = localStorage.getItem('auth_token');
    
    if (token) {
      console.log('Using auth_token from localStorage');
      // Log token details for debugging (only the first 10 chars for security)
      console.log('Token prefix:', token.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Additional debug logging for requests
    console.log(`Request to ${config.url}:`, {
      method: config.method,
      hasToken: !!token,
      contentType: config.headers['Content-Type'] || 'Not set (possibly FormData)',
      dataType: config.data instanceof FormData ? 'FormData' : typeof config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error logging
instance.interceptors.response.use(
  response => response,
  error => {
    console.log('API Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      url: error.config?.url,
      method: error.config?.method,
      timeout: error.code === 'ECONNABORTED' ? 'Request timed out' : undefined
    });
    
    // Create a more descriptive error message
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Server may be overloaded or unavailable.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    }
    
    return Promise.reject(error);
  }
);

// Configure the default axios instance as well for components that use it directly
axios.defaults.baseURL = determineBaseURL();
axios.defaults.withCredentials = true;
axios.defaults.timeout = apiTimeout; // Use timeout from environment or default
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add the same request interceptor to default axios
axios.interceptors.request.use(
  (config) => {
    // Check if sending FormData and remove Content-Type header to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Try to get token from localStorage first
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Global axios request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to global axios
axios.interceptors.response.use(
  response => response,
  error => {
    console.log('Global axios error:', {
      status: error.response?.status,
      url: error.config?.url,
      timeout: error.code === 'ECONNABORTED' ? true : undefined
    });
    return Promise.reject(error);
  }
);

export default instance; 