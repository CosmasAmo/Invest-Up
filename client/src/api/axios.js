import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.PROD 
        ? 'https://investuptrading.com/backend'
        : 'http://localhost:5000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the token in the Authorization header
instance.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage first (most reliable)
    let token = localStorage.getItem('auth_token');
    
    if (token) {
      console.log('Using auth_token from localStorage');
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
    
    // Fallback: Try to get token from sessionStorage (where Zustand persist stores it)
    try {
      const authStorage = sessionStorage.getItem('auth-storage');
      if (authStorage) {
        const authData = JSON.parse(authStorage);
        if (authData.state && authData.state.userData && authData.state.userData.token) {
          token = authData.state.userData.token;
          console.log('Using token from sessionStorage');
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error accessing token from storage:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the error is due to an expired token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      console.log('Token expired or invalid. Logging out...');
      
      // Clear auth data from storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('is_admin');
      sessionStorage.removeItem('auth-storage');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default instance; 