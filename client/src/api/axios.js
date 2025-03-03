import axios from 'axios';

// Determine the API URL based on the environment
const getApiUrl = () => {
  // In production, you would use your actual domain
  if (import.meta.env.PROD) {
    return 'https://yourdomain.com'; // Replace with your production URL
  }
  
  // For development, use the IP address of your computer on the local network
  // If accessing via IP already, use that
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000`;
  }
  
  // Default fallback to localhost
  return 'http://localhost:5000';
};

const instance = axios.create({
    baseURL: getApiUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the token in the Authorization header
instance.interceptors.request.use(
  (config) => {
    // Try to get token from sessionStorage (where Zustand persist stores it)
    let token = null;
    try {
      const authStorage = sessionStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        if (authData.state && authData.state.userData && authData.state.userData.token) {
          token = authData.state.userData.token;
        }
      }
    } catch (error) {
      console.error('Error accessing token from storage:', error);
    }

    // If we have a token, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance; 