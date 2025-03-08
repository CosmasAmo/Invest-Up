import { create } from 'zustand';
import axios from 'axios';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createRequestConfig, handleApiError } from '../utils/apiUtils';
import { toast } from 'react-toastify';

// Determine the API URL based on the environment
const getApiUrl = () => {
  // In production, you would use your actual domain
  if (import.meta.env.PROD) {
    return 'https://yourdomain.com'; // Replace with your production URL
  }
  
  // For development, always use localhost
  return 'http://localhost:5000';
};

// Set default base URL for axios
axios.defaults.baseURL = getApiUrl();
axios.defaults.withCredentials = true;

// Add axios interceptors for request handling
axios.interceptors.request.use(
  config => {
    // Add the Authorization header if we have a token in localStorage
    const token = localStorage.getItem('auth_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a function to update the API URL at runtime (for testing purposes)
const updateApiUrl = (newUrl) => {
  if (newUrl) {
    axios.defaults.baseURL = newUrl;
    console.log('API URL updated to:', newUrl);
    return true;
  }
  return false;
};

// Custom storage with expiration
const createExpiringStorage = (storage, expiryTime = 8 * 60 * 60 * 1000) => { // 8 hours default
  return {
    getItem: (name) => {
      const itemStr = storage.getItem(name);
      if (!itemStr) {
        return null;
      }
      
      try {
        const item = JSON.parse(itemStr);
        const now = new Date();
        
        // Check if the item has expired
        if (item.expiry && now.getTime() > item.expiry) {
          storage.removeItem(name);
          return null;
        }
        
        return item.value;
      } catch (error) {
        console.error('Error parsing stored item:', error);
        return null;
      }
    },
    setItem: (name, value) => {
      const now = new Date();
      const item = {
        value: value,
        expiry: now.getTime() + expiryTime,
      };
      storage.setItem(name, JSON.stringify(item));
    },
    removeItem: (name) => {
      storage.removeItem(name);
    }
  };
};

const useStore = create(
  persist(
    (set, get) => ({
      // Initial state
      userData: null,
      isAuthenticated: false,
      isVerified: false,
      isAdmin: false,
      error: null,
      isLoading: false,
      stats: {
        balance: 0,
        totalProfit: 0,
        totalInvestments: 0,
        referralCount: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        completedWithdrawals: 0
      },
      deposits: [],
      withdrawals: [],
      messages: [],
      
      // Add updateApiUrl function to the store
      updateApiUrl,

      // Initialize authentication from localStorage
      initAuth: () => {
        const token = localStorage.getItem('auth_token');
        const isAdmin = localStorage.getItem('is_admin') === 'true';
        
        if (token) {
          // Set the token in the Authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Restored authentication token from localStorage');
          
          // Also restore isAdmin flag if available
          if (isAdmin) {
            console.log('Restored admin status from localStorage');
            set(state => ({ 
              ...state,
              isAdmin: true 
            }));
          }
          
          // We'll still need to verify this token with the server
          // This will happen automatically with the checkAuth function
        }
      },

      // Add checkAuth function
      checkAuth: async () => {
        console.log('Checking authentication...');
        set({ isLoading: true });
        try {
          // Check if the session has expired
          const authStorage = sessionStorage.getItem('auth-storage');
          if (authStorage) {
            try {
              const authData = JSON.parse(authStorage);
              if (authData.expiry && new Date().getTime() > authData.expiry) {
                console.log('Session expired, logging out...');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('is_admin');
                sessionStorage.removeItem('auth-storage');
                set({ 
                  isAuthenticated: false, 
                  isAdmin: false, 
                  userData: null,
                  isLoading: false 
                });
                return;
              }
            } catch (error) {
              console.error('Error checking session expiration:', error);
            }
          }
          
          // Use the createRequestConfig utility
          const config = createRequestConfig();
          
          const { data } = await axios.get('/api/auth/check', config);
          console.log('Auth check response:', data);
          
          if (data.success) {
            const userData = data.userData || data.user;
            const isAdmin = userData.isAdmin === true;
            
            console.log('User authenticated, isAdmin:', isAdmin);
            
            // Update localStorage with current admin status
            localStorage.setItem('is_admin', isAdmin ? 'true' : 'false');
            
            set({
              isAuthenticated: true,
              isVerified: userData.isAccountVerified,
              isAdmin: isAdmin === true, // Ensure boolean value
            });
            
            // Fetch complete user data to ensure we have all details including profile image
            await get().fetchUserData();
          } else {
            console.log('Authentication check failed: Not authenticated');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('is_admin');
            set({ isAuthenticated: false, isAdmin: false, isLoading: false });
          }
        } catch (error) {
          // Handle error
          console.error('Authentication check error:', error);
          set({ isAuthenticated: false, isAdmin: false, isLoading: false });
        } finally {
          set({ isLoading: false });
        }
      },

      // Add a function to check if the session has expired
      checkSessionExpiration: () => {
        try {
          const authStorage = sessionStorage.getItem('auth-storage');
          if (authStorage) {
            const parsedStorage = JSON.parse(authStorage);
            if (parsedStorage.expiry && new Date().getTime() > parsedStorage.expiry) {
              // Session has expired, log the user out
              localStorage.removeItem('auth_token');
              localStorage.removeItem('is_admin');
              sessionStorage.removeItem('auth-storage');
              set({ 
                isAuthenticated: false, 
                isAdmin: false, 
                userData: null,
                error: 'Your session has expired. Please log in again.' 
              });
              return true; // Session expired
            }
          }
          return false; // Session still valid
        } catch (error) {
          console.error('Error checking session expiration:', error);
          return false;
        }
      },

      // Modify the initialize function to only check auth state if needed
      initialize: async () => {
        const state = get();
        if (!state.isAuthenticated) {
          set({ isLoading: true });
          try {
            await state.checkAuth();
          } catch (error) {
            console.error('Initialization error:', error);
          } finally {
            set({ isLoading: false });
          }
        }
      },

      // Auth Actions
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          let endpoint = '/api/auth/register';
          
          // Check if userData is FormData (for profile image upload)
          const isFormData = userData instanceof FormData;
          
          // If referredBy (referral code) is provided and not FormData, use the referral registration endpoint
          if (!isFormData && userData.referredBy) {
            endpoint = '/api/auth/register-with-referral';
            // Rename referredBy to referralCode for the API
            userData = {
              ...userData,
              referralCode: userData.referredBy,
            };
            delete userData.referredBy;
          }
          
          // For FormData, we need to use different headers
          const config = isFormData ? {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          } : {};
          
          console.log('Sending registration request:', endpoint, isFormData ? 'with FormData' : userData.email);
          const response = await axios.post(endpoint, userData, config);
          const { data } = response;
          console.log('Registration response:', data);
          
          if (!data.success) {
            console.log('Registration failed:', data.message, 'Error type:', data.errorType);
            set({ 
              error: data.message, 
              isLoading: false 
            });
            return { 
              success: false, 
              message: data.message, 
              errorType: data.errorType 
            };
          }
          
          if (data.success) {
            console.log('Registration successful');
            // Store user data with token if registration is successful
            if (data.userData && data.token) {
              const userDataWithToken = {
                ...data.userData,
                token: data.token
              };
              
              set({ 
                userData: userDataWithToken,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
            } else {
              set({ isLoading: false, error: null });
            }
            return { success: true, message: data.message };
          }
          
          throw new Error(data.message || 'Unknown registration error');
        } catch (error) {
          console.error('Registration error:', error);
          
          // Handle server errors
          let errorMessage = 'Registration failed. Please try again.';
          let errorType = 'SERVER_ERROR';
          
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('Server error response:', error.response.data);
            errorMessage = error.response.data.message || errorMessage;
            errorType = error.response.data.errorType || errorType;
          } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received:', error.request);
            errorMessage = 'No response from server. Please check your internet connection.';
            errorType = 'NETWORK_ERROR';
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error setting up request:', error.message);
          }
          
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          
          return { 
            success: false, 
            message: errorMessage, 
            errorType: errorType 
          };
        }
      },

      verifyEmail: async (otp) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Verifying email with OTP:', otp);
          const { data } = await axios.post('/api/auth/verify-account', { otp });
          console.log('Verification response:', data);
          
          if (data.success) {
            set(state => ({ 
              userData: { 
                ...state.userData, 
                isAccountVerified: true
              },
              isVerified: true,
              error: null
            }));
          } else {
            set({ error: data.message || 'Verification failed' });
          }
          
          // Return the full response object
          return data;
        } catch (error) {
          console.error('Email verification error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Verification failed';
          set({ error: errorMessage });
          
          // Return an error response object
          return {
            success: false,
            message: errorMessage
          };
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (email, newPassword, otp) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post('/api/auth/reset-password', {
            email, newPassword, otp
          });
          return data.success;
        } catch (error) {
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.put('/api/user/update-profile', profileData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          if (data.success) {
            // If the server returns the updated user data, use it directly
            if (data.userData) {
              set({ userData: data.userData });
              return true;
            } else {
              // Otherwise, fetch updated user data
              await get().fetchUserData();
              return true;
            }
          }
          throw new Error(data.message || 'Failed to update profile');
        } catch (error) {
          console.error('Update profile error:', error);
          set({ error: error.response?.data?.message || error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // User data actions
      fetchUserData: async () => {
        try {
          const { data } = await axios.get('/api/user/data');
          if (data.success) {
            set({ 
              userData: data.userData,
              isAuthenticated: true,
              isVerified: data.userData.isAccountVerified 
            });
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      },

      // Reset Password Actions
      sendResetOtp: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post('/api/auth/send-reset-otp', { email });
          if (data.success) {
            return true;
          }
          throw new Error(data.message);
        } catch (error) {
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Deposit Actions
      submitDeposit: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post('/api/transactions/deposit', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (data.success) {
            // Redirect to deposits page
            window.location.href = '/deposits';
            return true;
          }
          throw new Error(data.message);
        } catch (error) {
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Investment state
      investments: [],
      activeInvestments: 0,
      totalInvested: 0,

      // Investment actions
      fetchInvestments: async () => {
        set({ isLoading: true });
        try {
          const { data } = await axios.get('/api/investments');
          if (data.success) {
            set({ 
              investments: data.investments,
              activeInvestments: data.activeInvestments,
              totalInvested: data.totalInvested
            });
          }
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      submitInvestment: async (investmentData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post('/api/investments/create', investmentData);
          if (data.success) {
            await useStore.getState().fetchDashboardData();
            // Redirect to investments page
            window.location.href = '/investments';
            return true;
          }
          throw new Error(data.message);
        } catch (error) {
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Withdrawal actions
      requestWithdrawal: async (withdrawalData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post('/api/withdrawals/request', withdrawalData);
          if (data.success) {
            // Update user balance after withdrawal request
            await useStore.getState().fetchDashboardData();
            toast.success(data.message);
            // Redirect to withdrawals page
            window.location.href = '/withdrawals';
            return true;
          }
          throw new Error(data.message);
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          toast.error(errorMessage);
          set({ error: errorMessage });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Navigation state
      isScrolled: false,
      isMobileMenuOpen: false,

      // Navigation actions
      setIsScrolled: (value) => set({ isScrolled: value }),
      toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      // Auth verification
      getReferralLink: () => {
        const { user } = get();
        return `${window.location.origin}/register?ref=${user?.referralCode}`;
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post('/api/auth/login', credentials);
          
          if (data.success) {
            // Store the token in localStorage for mobile clients
            if (data.token) {
              localStorage.setItem('auth_token', data.token);
            }
            
            // Store admin status in localStorage
            localStorage.setItem('is_admin', data.user.isAdmin ? 'true' : 'false');
            
            set({ 
              isAuthenticated: true, 
              userData: data.user,
              isVerified: data.user.isAccountVerified,
              isAdmin: data.user.isAdmin === true,
              isLoading: false,
              error: null
            });
            
            return data.user;
          } else {
            throw new Error(data.message || 'Login failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          
          // Handle specific error types from the server
          if (error.response && error.response.data) {
            const { errorType, message } = error.response.data;
            
            switch (errorType) {
              case 'EMAIL_NOT_FOUND':
                set({ error: 'Email not registered. Please check your email or create an account.', isLoading: false });
                break;
              case 'INVALID_PASSWORD':
                set({ error: 'Invalid password. Please try again.', isLoading: false });
                break;
              case 'EMAIL_NOT_VERIFIED':
                set({ error: 'Please verify your email before logging in.', isLoading: false });
                break;
              default:
                set({ error: message || 'Login failed. Please try again.', isLoading: false });
            }
          } else {
            set({ error: error.message || 'Login failed. Please try again.', isLoading: false });
          }
          
          throw error; // Re-throw to be caught by the component
        }
      },

      logout: async () => {
        try {
          await axios.post('/api/auth/logout');
          
          // Clear the token from localStorage
          localStorage.removeItem('auth_token');
          
          // Clear the isAdmin flag from localStorage
          localStorage.removeItem('is_admin');
          
          // Remove the Authorization header
          delete axios.defaults.headers.common['Authorization'];
          
          set({ 
            userData: null, 
            isAuthenticated: false,
            isVerified: false,
            isAdmin: false
          });
          return true;
        } catch (error) {
          console.error('Logout failed:', error);
          return false;
        }
      },

      // Add fetchDashboardData action
      fetchDashboardData: async () => {
        try {
          console.log('Fetching dashboard data...');
          
          // Check if we already have dashboard data and it's recent (less than 30 seconds old)
          const currentState = get();
          const lastFetchTime = currentState.lastDashboardFetch || 0;
          const now = Date.now();
          const timeSinceLastFetch = now - lastFetchTime;
          
          // If we have recent data (less than 30 seconds old), use it instead of fetching again
          if (currentState.userData && currentState.stats && timeSinceLastFetch < 30000) {
            console.log('Using cached dashboard data');
            return;
          }
          
          // Use the createRequestConfig utility
          const config = createRequestConfig();
          
          const { data } = await axios.get('/api/user/dashboard', config);
          
          if (data.success) {
            console.log('Dashboard data fetched successfully');
            set({
              userData: data.user,
              stats: {
                ...data.stats,
                totalWithdrawals: data.stats.totalWithdrawals || 0,
                pendingWithdrawals: data.stats.pendingWithdrawals || 0,
                completedWithdrawals: data.stats.completedWithdrawals || 0
              },
              lastDashboardFetch: now
            });
          } else {
            console.error('Dashboard data fetch failed:', data.message);
            set({ error: data.message || 'Failed to fetch dashboard data' });
          }
        } catch (error) {
          // Use the handleApiError utility
          handleApiError(error, (errorMsg) => {
            set({ error: errorMsg });
          }, 'Error fetching dashboard data');
        }
      },

      fetchDeposits: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching deposits...');
          
          // Use the createRequestConfig utility
          const config = createRequestConfig();
          
          const { data } = await axios.get('/api/user/deposits', config);
          
          if (data.success) {
            console.log('Deposits fetched successfully');
            set({ deposits: data.deposits });
          } else {
            console.error('Deposits fetch failed:', data.message);
            throw new Error(data.message || 'Failed to fetch deposits');
          }
        } catch (error) {
          // Use the handleApiError utility
          handleApiError(error, (errorMsg) => {
            set({ error: errorMsg });
          }, 'Error fetching deposits');
        } finally {
          set({ isLoading: false });
        }
      },

      fetchWithdrawals: async () => {
        try {
          const { data } = await axios.get('/api/withdrawals/history');
          if (data.success) {
            set({ withdrawals: data.withdrawals });
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error('Error fetching withdrawals:', error);
          set({ error: error.message });
        }
      },

      // Add submitMessage action
      submitMessage: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await axios.post('/api/user/contact', formData);
          if (data.success) {
            set({ isLoading: false });
            return true;
          }
          throw new Error(data.message);
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return false;
        }
      },

      // Utility functions
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => createExpiringStorage(sessionStorage)),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isVerified: state.isVerified,
        isAdmin: state.isAdmin,
        userData: state.userData,
        deposits: state.deposits
      })
    }
  )
);

export default useStore; 