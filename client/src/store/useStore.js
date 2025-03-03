import { create } from 'zustand';
import axios from 'axios';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createRequestConfig, handleApiError } from '../utils/apiUtils';

// Determine the API URL based on the environment
const getApiUrl = () => {
  // In production, you would use your actual domain
  if (import.meta.env.PROD) {
    return 'https://yourdomain.com'; // Replace with your production URL
  }
  
  // For development, use localhost
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
              userData: userData,
              isVerified: userData.isAccountVerified,
              isAdmin: isAdmin,
              isLoading: false
            });
          } else {
            console.log('Authentication check failed: Not authenticated');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('is_admin');
            set({ isAuthenticated: false, isAdmin: false, isLoading: false });
          }
        } catch (error) {
          // Use the handleApiError utility
          handleApiError(error, (errorMsg) => {
            console.error('Authentication check failed:', errorMsg);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('is_admin');
            set({ isAuthenticated: false, isAdmin: false, isLoading: false, error: errorMsg });
          }, 'Auth check error');
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
        set({ isLoading: true });
        try {
          let endpoint = '/api/auth/register';
          
          // If referredBy (referral code) is provided, use the referral registration endpoint
          if (userData.referredBy) {
            endpoint = '/api/auth/register-with-referral';
            // Rename referredBy to referralCode for the API
            userData = {
              ...userData,
              referralCode: userData.referredBy,
            };
            delete userData.referredBy;
          }
          
          const { data } = await axios.post(endpoint, userData);
          if (data.success) {
            // Store user data with token if registration is successful
            if (data.userData && data.token) {
              const userDataWithToken = {
                ...data.userData,
                token: data.token
              };
              
              set({ 
                userData: userDataWithToken,
                isAuthenticated: true,
                isLoading: false 
              });
            } else {
              set({ isLoading: false });
            }
            return true;
          }
          throw new Error(data.message);
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      verifyEmail: async (otp) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post('/api/auth/verify-account', { otp });
          if (data.success) {
            set(state => ({ 
              userData: { 
                ...state.userData, 
                isAccountVerified: true
              },
              isVerified: true
            }));
            return true;
          }
          throw new Error(data.message);
        } catch (error) {
          set({ error: error.response?.data?.message || error.message });
          return false;
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
            // Fetch updated user data to ensure we have the latest
            await get().fetchUserData();
            return true;
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
        set({ isLoading: true });
        try {
          const { data } = await axios.post('/api/withdrawals/request', withdrawalData);
          if (data.success) {
            set(state => ({
              stats: {
                ...state.stats,
                totalWithdrawals: state.stats.totalWithdrawals + Number(withdrawalData.amount),
                balance: state.stats.balance - Number(withdrawalData.amount)
              }
            }));
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
          // Use the createRequestConfig utility
          const config = createRequestConfig();
          
          const { data } = await axios.post('/api/auth/login', credentials, config);
          if (data.success) {
            // Store the token in userData
            const userData = {
              ...data.userData,
              token: data.token // Save the token in userData
            };
            
            // Set the token in localStorage for mobile devices that might not handle cookies well
            localStorage.setItem('auth_token', data.token);
            
            // Also store isAdmin flag in localStorage for persistence
            localStorage.setItem('is_admin', userData.isAdmin ? 'true' : 'false');
            
            // Set the token in the Authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            console.log('Login successful, user data:', userData);
            console.log('Is admin:', userData.isAdmin);
            
            set({ 
              isAuthenticated: true,
              userData: userData,
              isVerified: userData.isAccountVerified,
              isAdmin: userData.isAdmin === true, // Ensure boolean value
              isLoading: false
            });
            return userData;
          }
          throw new Error(data.message || 'Login failed');
        } catch (error) {
          // Use the handleApiError utility
          handleApiError(error, (errorMsg) => {
            set({ error: errorMsg, isLoading: false });
          }, 'Login error');
          return false;
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
              }
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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
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