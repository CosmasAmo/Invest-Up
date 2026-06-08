import { create } from 'zustand';
import axios from 'axios';
import { persist, createJSONStorage } from 'zustand/middleware';
import axiosInstance from '../api/axios';  // Make sure this import is correct

// Use the axios instance from api/axios.js instead of setting defaults here

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
  if (newUrl && typeof newUrl === 'string') {
    console.log('Updating API URL to:', newUrl);
    axiosInstance.defaults.baseURL = newUrl;
    return true;
  }
  return false;
};

// Helper for generating full URLs for profile images
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Get the current store state to access serverUrl
  const store = useStore.getState();
  const baseUrl = store.serverUrl || '';
  
  // Ensure path starts with /uploads/
  let path = imagePath;
  
  // If imagePath has no directory structure (just filename), add /uploads/
  if (!path.includes('/')) {
    path = `/uploads/${path}`;
  } 
  // If path doesn't start with /, add it
  else if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  
  // If path doesn't include /uploads/ but should, add it
  if (!path.includes('/uploads/') && !path.startsWith('/uploads/')) {
    path = `/uploads${path.startsWith('/') ? path : `/${path}`}`;
  }
  
  return `${baseUrl}${path}`;
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
      isLoading: true,
      serverUrl: 'https://backend.investuptrading.com', // Set default server URL
      uploadsUrl: 'https://backend.investuptrading.com/uploads', // Set default uploads URL
      settings: null, // Store admin settings
      isScrolled: false,
      isMobileMenuOpen: false,
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
      investments: [],
      messages: [],
      
      // Add updateApiUrl function to the store
      updateApiUrl,

      // UI state management functions
      setIsScrolled: (isScrolled) => set({ isScrolled }),
      toggleMobileMenu: (isOpen) => set({ isMobileMenuOpen: isOpen !== undefined ? isOpen : !get().isMobileMenuOpen }),

      // Get server configuration
      fetchServerConfig: async () => {
        try {
          const { data } = await axiosInstance.get('/');
          if (data.success) {
            console.log('Server config loaded:', data);
            set({
              serverUrl: data.serverUrl,
              uploadsUrl: data.uploadsUrl
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to load server configuration:', error);
          return false;
        }
      },

      // Helper function to get the full image URL
      getImageUrl: (imagePath) => {
        if (!imagePath) return null;
        return getFullImageUrl(imagePath);
      },

      // Fetch admin settings
      fetchSettings: async (forceRefresh = false) => {
        try {
          // Check if we already have settings and don't need to force refresh
          const currentState = get();
          const savedSettings = localStorage.getItem('adminSettings');
          
          if (!forceRefresh && currentState.settings) {
            console.log('Using cached settings from state');
            return currentState.settings;
          }
          
          if (!forceRefresh && savedSettings) {
            try {
              console.log('Using cached settings from localStorage');
              const parsedSettings = JSON.parse(savedSettings);
              set({ settings: parsedSettings });
              return parsedSettings;
            } catch (parseError) {
              console.error('Error parsing saved settings:', parseError);
            }
          }
          
          console.log('Fetching settings from server');
          
          // First try the public endpoint which doesn't require authentication
          try {
            const publicResponse = await axiosInstance.get('/api/settings/public', {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            if (publicResponse.data.success) {
              console.log('Public settings fetched successfully');
              const settingsData = publicResponse.data.settings;
              
              // Ensure depositAddresses is an object, not a string
              let depositAddresses = settingsData.depositAddresses;
              if (typeof depositAddresses === 'string') {
                try {
                  depositAddresses = JSON.parse(depositAddresses);
                } catch (error) {
                  console.error('Error parsing depositAddresses:', error);
                  depositAddresses = {
                    BINANCE: '374592285',
                    TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
                    BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                    ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                    OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
                  };
                }
              }
              
              // Create a complete settings object
              const completeSettings = {
                ...settingsData,
                depositAddresses
              };
              
              set({ settings: completeSettings });
              localStorage.setItem('adminSettings', JSON.stringify(completeSettings));
              return completeSettings;
            }
          } catch (publicError) {
            console.error('Failed to fetch public settings:', publicError);
            // Continue to try the authenticated endpoint
          }
          
          // If public endpoint fails or user is admin, try the authenticated endpoint
          const response = await axiosInstance.get('/api/settings', { 
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data.success) {
            const settingsData = response.data.settings;
            
            // Ensure depositAddresses exists and is an object, not a string
            let depositAddresses = settingsData.depositAddresses;
            if (!depositAddresses) {
              depositAddresses = {
                BINANCE: '374592285',
                TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
                BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
              };
            } else if (typeof depositAddresses === 'string') {
              try {
                depositAddresses = JSON.parse(depositAddresses);
              } catch (error) {
                console.error('Error parsing depositAddresses:', error);
                depositAddresses = {
                  BINANCE: '374592285',
                  TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
                  BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                  ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                  OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
                };
              }
            }
            
            // Create a complete settings object
            const completeSettings = {
              ...settingsData,
              depositAddresses
            };
            
            // Save to state and localStorage
            set({ settings: completeSettings });
            localStorage.setItem('adminSettings', JSON.stringify(completeSettings));
            
            console.log('Settings fetched and stored successfully');
            return completeSettings;
          } else {
            throw new Error(response.data.message || 'Failed to fetch settings');
          }
        } catch (error) {
          console.error('Failed to fetch settings:', error);
          
          // Try to use cached settings from localStorage as fallback
          try {
            const savedSettings = localStorage.getItem('adminSettings');
            if (savedSettings) {
              const parsedSettings = JSON.parse(savedSettings);
              set({ settings: parsedSettings });
              return parsedSettings;
            }
          } catch (localError) {
            console.error('Failed to load settings from localStorage:', localError);
          }
          
          // If all else fails, use default settings
          const defaultSettings = {
            referralBonus: 5,
            minWithdrawal: 3,
            minDeposit: 3,
            minInvestment: 3,
            profitPercentage: 5,
            profitInterval: 1440,
            withdrawalFee: 2,
            referralsRequired: 2,
            depositAddresses: {
              BINANCE: '374592285',
              TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
              BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
              ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
              OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
            }
          };
          
          set({ settings: defaultSettings });
          localStorage.setItem('adminSettings', JSON.stringify(defaultSettings));
          
          return defaultSettings;
        }
      },

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
      checkAuth: async (forceUpdate = false) => {
        try {
          const token = localStorage.getItem('auth_token');
          const tokenPrefix = token ? token.substring(0, 10) + '...' : 'none';
          console.log('Using auth_token from localStorage');
          console.log('Token prefix:', tokenPrefix);
          
          // Check if there's a reset token in sessionStorage that might be confused with an auth token
          const pwResetToken = sessionStorage.getItem('pw_reset_token') || sessionStorage.getItem('resetToken');
          if (pwResetToken && token && token.startsWith(pwResetToken.substring(0, 10))) {
            console.warn('Detected possible reset token confusion - auth token matches reset token pattern');
            
            // This is likely a reset token being mistaken as an auth token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('is_admin');
            delete axios.defaults.headers.common['Authorization'];
            
            set({ 
              isAuthenticated: false, 
              userData: null,
              isVerified: false,
              isAdmin: false,
              isLoading: false
            });
            
            return false;
          }
          
          if (!token) {
            console.log('No auth token found');
            set({ 
              isAuthenticated: false, 
              userData: null,
              isLoading: false
            });
            return false;
          }
          
          // Only set Authorization header if token exists and doesn't match a reset token pattern
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const { data } = await axiosInstance.get('/api/user/data');
          console.log('Request to /api/user/data result:', data.success ? 'success' : 'failed');
          
          if (data.success && data.userData) {
            const userData = { ...data.userData };
            
            // Check for profile image
            if (userData.profileImage) {
              userData.profileImage = getFullImageUrl(userData.profileImage);
            }
            if (userData.profilePicture) {
              userData.profilePicture = getFullImageUrl(userData.profilePicture);
            }
            
            // Check if this is a Google user
            const isGoogleUser = userData.googleId || 
                               localStorage.getItem('is_google_user') === 'true' ||
                               sessionStorage.getItem('is_google_user') === 'true';
            
            // Check if user was previously verified with Google
            const isGoogleVerified = 
              localStorage.getItem('is_verified') === 'true' || 
              sessionStorage.getItem('is_verified') === 'true';
            
            // For Google users, we consider them verified
            const isVerified = 
              userData.isAccountVerified === true || 
              isGoogleUser || 
              isGoogleVerified ||
              userData.isEmailVerified === true;

            // Log detailed information about the user's state
            console.log('User state details:', { 
              isGoogleUser, 
              isGoogleVerified, 
              isTemporary: userData.isTemporary,
              name: userData.name,
              hasGoogleId: !!userData.googleId,
              isAccountVerified: userData.isAccountVerified
            });
              
            set({ 
              isAuthenticated: true, 
              userData,
              isVerified: isVerified,
              isAdmin: userData.isAdmin === true,
              isLoading: false
            });
            
            return true;
          } else {
            // Clear invalid token
            console.log('Invalid token or user not found');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('is_admin');
            localStorage.removeItem('user-store'); // Clear zustand store
            sessionStorage.removeItem('auth-storage');
            delete axios.defaults.headers.common['Authorization'];
            
            set({ 
              isAuthenticated: false, 
              userData: null,
              isVerified: false,
              isAdmin: false,
              isLoading: false
            });
            return false;
          }
        } catch (error) {
          console.error('Auth check error:', error);
          
          // Clear potentially invalid token
          localStorage.removeItem('auth_token');
          localStorage.removeItem('is_admin');
          localStorage.removeItem('user-store'); // Clear zustand store
          sessionStorage.removeItem('auth-storage');
          delete axios.defaults.headers.common['Authorization'];
          
          set({ 
            isAuthenticated: false, 
            userData: null,
            isVerified: false,
            isAdmin: false,
            isLoading: false
          });
          return false;
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

      // Initialize auth state and fetch config/settings once on app mount
      initialize: async () => {
        // Re-read live state right now — do NOT use a snapshot captured
        // before async work, or isAuthenticated will always look false.
        const liveState = get();

        // If the user just logged in, isAuthenticated is already true.
        // Avoid setting isLoading=true (which would flash the spinner) and
        // skip the expensive checkAuth round-trip — we already have a valid session.
        if (liveState.isAuthenticated) {
          try {
            // Just fix any profile image URLs if needed
            if (liveState.userData) {
              const userData = { ...liveState.userData };
              if (userData.profileImage) {
                userData.profileImage = liveState.getImageUrl(userData.profileImage);
              }
              if (userData.profilePicture) {
                userData.profilePicture = liveState.getImageUrl(userData.profilePicture);
              }
              set({ userData });
            }
          } catch (error) {
            console.error('Error updating profile images:', error);
          }
          set({ isLoading: false }); // Ensure we clear the loading state when returning early!
          return;
        }

        set({ isLoading: true });
        
        try {
          // Initialize authentication from localStorage
          liveState.initAuth();
          
          // Fetch server configuration
          try {
            await get().fetchServerConfig();
          } catch (error) {
            console.error('Error fetching server config:', error);
          }
          
          // Fetch admin settings
          try {
            await get().fetchSettings();
          } catch (error) {
            console.error('Error fetching settings:', error);
          }
          
          // Re-read state AFTER async work to get the latest isAuthenticated value
          if (!get().isAuthenticated) {
            try {
              await get().checkAuth();
            } catch (error) {
              console.error('Error checking auth:', error);
              set({ 
                isAuthenticated: false, 
                isAdmin: false, 
                userData: null
              });
            }
          } else {
            // Already authenticated — just fix image URLs
            const currentState = get();
            if (currentState.userData) {
              try {
                const userData = { ...currentState.userData };
                if (userData.profileImage) {
                  userData.profileImage = currentState.getImageUrl(userData.profileImage);
                }
                if (userData.profilePicture) {
                  userData.profilePicture = currentState.getImageUrl(userData.profilePicture);
                }
                set({ userData });
              } catch (error) {
                console.error('Error updating profile images:', error);
              }
            }
          }
        } catch (error) {
          console.error('Initialization error:', error);
          set({ 
            isAuthenticated: false, 
            isAdmin: false, 
            userData: null,
            error: 'Failed to initialize application'
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Auth Actions
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          let endpoint = '/api/auth/register';
          
          // Check if userData is FormData (for profile image upload)
          const isFormData = userData instanceof FormData;
          
          // If referral code is provided (check both possible field names), use the referral registration endpoint
          if (userData.referralCode || userData.referredBy) {
            console.log('Referral code found:', userData.referralCode || userData.referredBy);
            endpoint = '/api/auth/register-with-referral';
            
            // Ensure the field name is consistent for the backend
            if (isFormData) {
              // For FormData, rename the field if needed
              if (userData.has('referredBy') && !userData.has('referralCode')) {
                const referredBy = userData.get('referredBy');
                userData.append('referralCode', referredBy);
              }
            } else {
              // For JSON, rename the field if needed
              if (userData.referredBy && !userData.referralCode) {
                userData.referralCode = userData.referredBy;
              }
            }
          }
          
          // For FormData, we need to use different headers - Don't set Content-Type, let the browser set it
          const config = isFormData ? {} : {
            headers: {
              'Content-Type': 'application/json'
            }
          };
          
          console.log('Sending registration request:', endpoint, 'with', isFormData ? 'FormData' : 'JSON data');
          
          // Log data keys and values for debugging
          if (isFormData) {
            console.log('FormData entries:');
            for (let pair of userData.entries()) {
              console.log(pair[0] + ': ' + (pair[0] === 'password' ? '[REDACTED]' : pair[1]));
            }
          } else {
            console.log('JSON data keys:', Object.keys(userData));
          }
          
          // Use the imported axiosInstance instead of the global axios
          const response = await axiosInstance.post(endpoint, userData, config);
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
              
              // Set token in localStorage and axios headers
              localStorage.setItem('auth_token', data.token);
              axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
              
              set({ 
                userData: userDataWithToken,
                isAuthenticated: true,
                isVerified: false, // New user needs to verify email
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

      login: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Logging in user:', userData.email);
          
          const { data } = await axiosInstance.post('/api/auth/login', userData);
          
          if (!data.success) {
            set({ 
              error: data.message || 'Login failed', 
              isLoading: false 
            });
            return null;
          }
          
          // Store user data with token if login is successful
          if (data.user && data.token) {
            const userDataWithToken = {
              ...data.user,
              token: data.token
            };
            
            // Set token in localStorage and axios headers
            localStorage.setItem('auth_token', data.token);
            if (data.user.isAdmin) {
              localStorage.setItem('is_admin', 'true');
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            set({ 
              userData: userDataWithToken,
              isAuthenticated: true,
              isVerified: data.user.isAccountVerified,
              isAdmin: data.user.isAdmin === true,
              isLoading: false,
              error: null
            });
            
            return userDataWithToken;
          }
          
          throw new Error(data.message || 'Unknown login error');
        } catch (error) {
          console.error('Login error:', error);
          
          // Handle server errors
          let errorMessage = 'Login failed. Please try again.';
          
          if (error.response) {
            console.log('Server error response:', error.response.data);
            errorMessage = error.response.data.message || errorMessage;
          } else if (error.request) {
            console.log('No response received:', error.request);
            errorMessage = 'No response from server. Please check your internet connection.';
          } else {
            console.log('Error setting up request:', error.message);
          }
          
          // IMPORTANT: Always set isLoading to false on error
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          
          return null;
        }
      },

      logout: async () => {
        // Immediately clear auth state to prevent routing flashes
        set({
          isAuthenticated: false,
          isAdmin: false,
          userData: null,
          isVerified: false
        });
        
        try {
          // Call the logout endpoint to clear server-side cookies
          await axiosInstance.post('/api/auth/logout');
        } catch (error) {
          console.error('Error during logout API call:', error);
          // Continue with local logout even if server call fails
        } finally {
          // Clear all localStorage items related to authentication
          localStorage.removeItem('auth_token');
          localStorage.removeItem('is_admin');
          
          // Clear all Google verification flags
          localStorage.removeItem('is_google_user');
          localStorage.removeItem('is_verified');
          localStorage.removeItem('email_verified');
          localStorage.removeItem('bypass_email_verification');
          
          // Clear Zustand persisted state
          localStorage.removeItem('user-store');
          localStorage.removeItem('adminSettings');
          
          // Clear all sessionStorage items
          sessionStorage.removeItem('auth-storage');
          sessionStorage.removeItem('is_google_user');
          sessionStorage.removeItem('is_verified');
          sessionStorage.removeItem('email_verified');
          sessionStorage.removeItem('bypass_email_verification');
          
          // Clear authorization headers
          delete axios.defaults.headers.common['Authorization'];
          
          // Thoroughly clear ALL Google cookies
          document.cookie.split(";").forEach(function(c) {
            // Target all Google-related cookies
            if (c.includes('G_') || c.includes('goog') || c.includes('google') || c.includes('SID') || c.includes('HSID')) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              // Also try with domain path
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=.google.com");
            }
          });
          
          // Reset store state — navigation to /login is handled by the calling component
          // (navbar / admin layout) using React Router navigate(), avoiding a hard reload
          set({
            isAuthenticated: false,
            isAdmin: false,
            isVerified: false,
            userData: null,
            error: null
          });
        }
      },

      clearError: () => set({ error: null }),

      verifyEmail: async (otp) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Verifying email with OTP:', otp);
          
          // Make sure the Authorization header is set correctly
          const token = localStorage.getItem('auth_token');
          if (!token) {
            console.error('No auth token found in localStorage');
            set({ error: 'Authentication error. Please try logging in again.' });
            return { success: false, message: 'Authentication error' };
          }
          
          console.log('Using auth_token from localStorage');
          console.log('Token prefix:', token.substring(0, 10) + '...');
          
          // Set the default Authorization header for all future requests
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Create a specific config object for this request
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };
          
          console.log('Making verification request with config:', {
            headers: {
              Authorization: 'Bearer ' + token.substring(0, 10) + '...',
              'Content-Type': 'application/json'
            },
            body: { otp }
          });
          
          // Make sure we're sending the OTP as a string
          const otpString = String(otp).trim();
          const response = await axiosInstance.post('/api/auth/verify-account', { otp: otpString }, config);
          const data = response.data;
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
          console.error('API Error Details:', error.response?.data);
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

      // New method for device-independent email verification
      verifyEmailWithCode: async (email, otp) => {
        console.log('verifyEmailWithCode called with email:', email, 'and OTP:', otp);
        set({ isLoading: true, error: null });
        
        try {
          // Input validation
          if (!email) {
            console.error('Email is missing or empty');
            set({ error: 'Email is required for verification' });
            return { 
              success: false, 
              message: 'Email is required for verification' 
            };
          }
          
          // Make sure we're sending the OTP as a string
          const otpString = String(otp).trim();
          console.log('Formatted OTP:', otpString);
          
          // Format the request data
          const requestData = { 
            email: email.trim(), 
            otp: otpString 
          };
          
          console.log('Sending verification request with data:', requestData);
          console.log('User agent:', navigator.userAgent, 'Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
          
          // Use the new endpoint that doesn't require authentication
          console.log('Making POST request to /api/auth/verify-email-with-code');
          const response = await axiosInstance.post(
            '/api/auth/verify-email-with-code', 
            requestData
          );
          
          console.log('Raw response received:', response);
          const data = response.data;
          console.log('Verification response data:', data);
          
          if (data.success) {
            console.log('Verification successful');
            // If verification was successful, save the token and user data
            if (data.token) {
              console.log('Saving token to localStorage');
              localStorage.setItem('auth_token', data.token);
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }
            
            // Update state with the user data
            console.log('Updating user data in state with account verified status');
            console.log('User data from response:', data.userData);
            
            // Force userData to have isAccountVerified set to true
            const updatedUserData = {
              ...data.userData,
              isAccountVerified: true,
              isEmailVerified: true
            };
            
            set({ 
              userData: updatedUserData,
              isAuthenticated: true,
              isVerified: true,
              error: null
            });
            
            console.log('State updated with verified status');
          } else {
            console.log('Verification failed with message:', data.message);
            set({ error: data.message || 'Verification failed' });
          }
          
          // Return the full response object
          return data;
        } catch (error) {
          console.error('Email verification error:', error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Stack trace:', error.stack);
          
          if (error.response) {
            console.error('API Error Status:', error.response.status);
            console.error('API Error Data:', error.response.data);
          }
          
          const errorMessage = error.response?.data?.message || error.message || 'Verification failed';
          console.error('Setting error message:', errorMessage);
          set({ error: errorMessage });
          
          // Return an error response object
          return {
            success: false,
            message: errorMessage
          };
        } finally {
          console.log('Verification process completed, setting isLoading to false');
          set({ isLoading: false });
        }
      },

      resendVerificationEmail: async () => {
        set({ isLoading: true, error: null });
        try {
          // Make sure the Authorization header is set correctly
          const token = localStorage.getItem('auth_token');
          if (!token) {
            console.error('No auth token found in localStorage');
            set({ error: 'Authentication error. Please try logging in again.' });
            return { success: false, message: 'Authentication error' };
          }
          
          console.log('Requesting new verification email');
          
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };
          
          const { data } = await axiosInstance.post('/api/auth/resend-verification', {}, config);
          
          if (data.success) {
            set({ error: null });
            return data;
          } else {
            set({ error: data.message || 'Failed to resend verification email' });
            return data;
          }
        } catch (err) {
          console.error('Error resending verification email:', err);
          const message = err.response?.data?.message || err.message || 'Failed to resend verification email';
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // New method for device-independent resend verification
      resendVerificationWithEmail: async (email) => {
        set({ isLoading: true, error: null });
        try {
          if (!email) {
            set({ error: 'Email is required' });
            return { success: false, message: 'Email is required' };
          }
          
          console.log('Requesting new verification email for:', email);
          
          // Use the new endpoint that doesn't require authentication
          const { data } = await axiosInstance.post('/api/auth/resend-verification-with-email', { email });
          
          if (data.success) {
            set({ error: null });
            return data;
          } else {
            set({ error: data.message || 'Failed to resend verification email' });
            return data;
          }
        } catch (err) {
          console.error('Error resending verification email:', err);
          const message = err.response?.data?.message || err.message || 'Failed to resend verification email';
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (email, newPassword, resetToken) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Starting password reset with token for email:', email);
          
          // Ensure resetToken is a valid string
          if (!resetToken || resetToken === 'null') {
            console.error('Invalid reset token provided:', resetToken);
            return { 
              success: false, 
              message: 'Session expired. Please restart the password reset process.' 
            };
          }
          
          const tokenString = String(resetToken).trim();
          console.log('Token type check:', typeof tokenString, 'Length:', tokenString.length);
          console.log('Token first 10 chars:', tokenString.substring(0, 10) + '...');
          
          const { data } = await axiosInstance.post('/api/auth/reset-password', { 
            email, 
            newPassword,
            resetToken: tokenString
          });
          
          console.log('Password reset response:', data);
          
          if (!data.success) {
            console.error('Password reset failed:', data.message);
            set({ error: data.message || 'Password reset failed' });
          }
          
          return data;
        } catch (error) {
          console.error('Password reset error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'An error occurred during password reset';
          set({ error: errorMessage });
          return { success: false, message: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Verifying reset OTP for email:', email, 'OTP:', otp);
          const { data } = await axiosInstance.post('/api/auth/verify-reset-otp', { 
            email, 
            otp 
          });
          
          console.log('OTP verification response:', data);
          
          if (!data.success) {
            console.error('OTP verification failed:', data.message);
            set({ error: data.message || 'OTP verification failed' });
            return { success: false, message: data.message || 'OTP verification failed' };
          }
          
          // Check for resetToken specifically
          if (!data.resetToken) {
            console.error('Server did not return a reset token');
            set({ error: 'Server error: No reset token provided' });
            return { 
              success: false, 
              message: 'Server error: No reset token provided. Please try again.' 
            };
          }
          
          console.log('Successfully received reset token from server');
          return data;
        } catch (error) {
          console.error('OTP verification error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'An error occurred during OTP verification';
          set({ error: errorMessage });
          return { success: false, message: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      sendResetOtp: async (email) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Sending password reset OTP to email:', email);
          const response = await axiosInstance.post('/api/auth/send-reset-otp', { email });
          console.log('Send reset OTP response:', response.data);
          
          if (response.data && response.data.success) {
            console.log('Reset OTP sent successfully, expires at:', new Date(response.data.expiresAt).toLocaleString());
            return response.data;
          } else {
            const errorMessage = response.data?.message || 'Failed to send verification code';
            console.error('Reset OTP request failed:', errorMessage);
            set({ error: errorMessage });
            return { success: false, message: errorMessage };
          }
        } catch (err) {
          console.error('Error sending reset OTP:', err);
          const message = err.response?.data?.message || err.message || 'Failed to send verification code';
          set({ error: message });
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (formData) => {
        try {
          set({ isLoading: true, error: null });
          console.log('Sending profile update request with data:', {
            name: formData.get('name'),
            email: formData.get('email')
          });
          
          const response = await axiosInstance.put('/api/user/profile', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (response.data.success) {
            const updatedUserData = response.data.userData;
            // Ensure profile image URL is properly formatted
            if (updatedUserData.profilePicture) {
              updatedUserData.profilePicture = getFullImageUrl(updatedUserData.profilePicture);
            }
            set({ userData: updatedUserData });
            return true;
          }
          
          // If the server returns success: false but with a message
          if (response.data.message) {
            set({ error: response.data.message });
          } else {
            set({ error: 'Failed to update profile. Please try again.' });
          }
          
          return false;
        } catch (error) {
          console.error('Error updating profile:', error);
          // More detailed error information
          if (error.response) {
            console.error('Server error data:', error.response.data);
            set({ error: error.response.data.message || 'Server error occurred. Please try again.' });
          } else if (error.request) {
            console.error('No response received:', error.request);
            set({ error: 'No response from server. Please check your internet connection.' });
          } else {
            set({ error: error.message || 'An unexpected error occurred' });
          }
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Dashboard data fetching
      fetchUserDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching user dashboard data...');
          
          // Fetch fresh user data
          try {
            const userDataResponse = await axiosInstance.get('/api/user/data');
            
            if (userDataResponse.data.success && userDataResponse.data.userData) {
              console.log('Fresh user data fetched:', userDataResponse.data.userData);
              
              // Process image URLs if needed
              let userData = userDataResponse.data.userData;
              try {
                if (userData.profileImage && typeof userData.profileImage === 'string') {
                  userData.profileImage = getFullImageUrl(userData.profileImage);
                }
                
                if (userData.profilePicture && typeof userData.profilePicture === 'string') {
                  userData.profilePicture = getFullImageUrl(userData.profilePicture);
                }
              } catch (imageError) {
                console.error('Error updating profile images:', imageError);
              }
              
              // Update userData in state with fresh data
              set({ 
                userData,
                isVerified: userData.isAccountVerified || false,
                isAdmin: userData.isAdmin === true
              });
              console.log('User data updated with fresh values');
            }
          } catch (userDataError) {
            console.error('Error fetching fresh user data:', userDataError);
            // Continue with other requests even if this one fails
          }
          
          try {
            // Fetch user stats
            const statsResponse = await axiosInstance.get('/api/user/stats');
            
            if (statsResponse.data.success) {
              const stats = statsResponse.data.stats || {};
              set({ stats });
              console.log('User stats loaded:', stats);
            }
          } catch (error) {
            console.error('Error fetching stats:', error);
          }
          
          try {
            // Fetch user deposits
            const depositsResponse = await axiosInstance.get('/api/user/deposits');
            
            if (depositsResponse.data.success) {
              const deposits = depositsResponse.data.deposits || [];
              // Store the total deposits amount that includes deleted deposits
              const totalDepositsAmount = depositsResponse.data.totalDepositsAmount || 0;
              set({ 
                deposits, 
                totalDepositsAmount 
              });
              console.log(`Loaded ${deposits.length} user deposits`);
            }
          } catch (error) {
            console.error('Error fetching deposits:', error);
          }
          
          try {
            // Fetch user withdrawals
            const withdrawalsResponse = await axiosInstance.get('/api/withdrawals/history');
            
            if (withdrawalsResponse.data.success) {
              const withdrawals = withdrawalsResponse.data.withdrawals || [];
              set({ withdrawals });
              console.log(`Loaded ${withdrawals.length} user withdrawals`);
            }
          } catch (error) {
            console.error('Error fetching withdrawals:', error);
          }
          
          try {
            // Fetch user investments
            const investmentsResponse = await axiosInstance.get('/api/investments');
            
            if (investmentsResponse.data.success) {
              const investments = investmentsResponse.data.investments || [];
              set({ investments });
              console.log(`Loaded ${investments.length} user investments`);
            }
          } catch (error) {
            console.error('Error fetching investments:', error);
          }
          
          try {
            // Fetch user messages
            const messagesResponse = await axiosInstance.get('/api/user/messages');
            
            if (messagesResponse.data.success) {
              const messages = messagesResponse.data.messages || [];
              set({ messages });
              console.log(`Loaded ${messages.length} user messages`);
            }
          } catch (error) {
            console.error('Error fetching messages:', error);
          }
          
          console.log('Dashboard data loading complete');
          return true;
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          set({ error: error.message || 'Failed to load dashboard data' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch user transactions
      fetchTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching user transactions...');
          
          const response = await axiosInstance.get('/api/user/transactions');
          
          if (response.data.success && response.data.transactions) {
            console.log(`Loaded ${response.data.transactions.length} transactions`);
            // Update userData with transactions
            set(state => ({ 
              userData: {
                ...state.userData,
                recentTransactions: response.data.transactions
              }
            }));
            return response.data.transactions;
          } else {
            console.error('No transactions returned from API or request failed', response.data);
            // Return empty array instead of null, to prevent component crashes
            return [];
          }
        } catch (error) {
          console.error('Error fetching transactions data:', error);
          console.error('Error details:', error.response?.data, error.request, error.message);
          
          // Log additional axios error details
          if (error.response) {
            // Server responded with a status code that's outside of 2xx range
            console.error('Response error data:', error.response.data);
            console.error('Response error status:', error.response.status);
            console.error('Response error headers:', error.response.headers);
          } else if (error.request) {
            // Request was made but no response was received
            console.error('Request was made but no response received');
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up the request:', error.message);
          }
          
          set({ error: error.message || 'Failed to load transactions data' });
          
          // Return empty array instead of null to prevent component crashes
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      // Alias for fetchUserDashboard to maintain compatibility with existing code
      fetchDashboardData: async () => {
        console.log('fetchDashboardData called, delegating to fetchUserDashboard');
        try {
          const result = await get().fetchUserDashboard();
          
          // Additionally fetch transactions to ensure they're always updated
          console.log('Fetching fresh transactions after dashboard data');
          await get().fetchTransactions();
          
          console.log('fetchUserDashboard completed with result:', result);
          return result;
        } catch (error) {
          console.error('Error in fetchDashboardData:', error);
          return false;
        }
      },

      // Fetch only deposits data
      fetchDeposits: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching user deposits...');
          
          const response = await axiosInstance.get('/api/user/deposits');
          
          if (response.data.success) {
            const deposits = response.data.deposits || [];
            // Store the total deposits amount that includes deleted deposits
            const totalDepositsAmount = response.data.totalDepositsAmount || 0;
            set({ 
              deposits, 
              totalDepositsAmount 
            });
            console.log(`Loaded ${deposits.length} user deposits`);
          }
        } catch (error) {
          console.error('Error fetching deposits data:', error);
          set({ error: error.message || 'Failed to load deposits data' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch only withdrawals data
      fetchWithdrawals: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching user withdrawals...');
          
          const response = await axiosInstance.get('/api/withdrawals/history');
          
          if (response.data.success) {
            const withdrawals = response.data.withdrawals || [];
            set({ withdrawals });
            console.log(`Loaded ${withdrawals.length} user withdrawals`);
          }
        } catch (error) {
          console.error('Error fetching withdrawals data:', error);
          set({ error: error.message || 'Failed to load withdrawals data' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch investments data
      fetchInvestments: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching user investments...');
          
          const response = await axiosInstance.get('/api/investments');
          
          if (response.data.success) {
            const investments = response.data.investments || [];
            
            // Log investment status details for debugging
            console.log(`Loaded ${investments.length} user investments`);
            console.log('Investment statuses:', investments.map(inv => ({
              id: inv.id,
              status: inv.status || 'undefined',
              amount: inv.amount
            })));
            
            // Make sure all investments have valid status values
            const validatedInvestments = investments.map(inv => {
              // For existing stopped investments coming from the backend that might have undefined status
              if (!inv.status && inv.id) {
                return { ...inv, status: 'stopped' };
              }
              return { ...inv, status: inv.status || 'unknown' };
            });
            
            set({ investments: validatedInvestments });
          }
        } catch (error) {
          console.error('Error fetching investments data:', error);
          set({ error: error.message || 'Failed to load investments data' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch user stats
      fetchUserStats: async () => {
        try {
          const response = await axiosInstance.get('/api/user/stats');
          if (response.data.success) {
            set({ stats: response.data.stats || {} });
            console.log('User stats updated successfully');
            return response.data.stats;
          }
          return null;
        } catch (error) {
          console.error('Error fetching user stats:', error);
          return null;
        }
      },

      // Fetch profit status
      fetchProfitStatus: async () => {
        try {
          const response = await axiosInstance.get('/api/investments/profit-status');
          if (response.data.success) {
            return response.data;
          }
          return null;
        } catch (error) {
          console.error('Error fetching profit status:', error);
          return null;
        }
      },

      // Stop investment function
      stopInvestment: async (investmentId) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Stopping investment:', investmentId);
          
          const response = await axiosInstance.post(`/api/investments/${investmentId}/stop`, {}, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            withCredentials: true
          });
          
          if (response.data.success) {
            // Update the investment status in state
            const currentInvestments = get().investments;
            const updatedInvestments = currentInvestments.map(inv => 
              inv.id === investmentId ? {...inv, status: 'stopped'} : inv
            );
            
            console.log('Successfully stopped investment:', investmentId);
            console.log('Updated investment status in state');
            
            set({ investments: updatedInvestments });
            
            // Also fetch latest user stats
            await get().fetchUserStats();
            
            // Immediately fetch investments from server to ensure data consistency
            setTimeout(() => {
              get().fetchInvestments();
            }, 1000);
            
            return { success: true, message: response.data.message };
          } else {
            throw new Error(response.data.message || 'Failed to stop investment');
          }
        } catch (error) {
          console.error('Error stopping investment:', error);
          set({ 
            error: error.message || 'Failed to stop investment',
            isLoading: false 
          });
          return { success: false, message: error.message || 'Failed to stop investment' };
        } finally {
          set({ isLoading: false });
        }
      },

      // Submit deposit function
      submitDeposit: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Submitting deposit...');
          
          const response = await axiosInstance.post('/api/transactions/deposit', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (response.data.success) {
            // Refresh deposits and stats after successful submission
            await get().fetchDeposits();
            
            // Also fetch the latest user stats to ensure balance is up-to-date
            try {
              const statsResponse = await axiosInstance.get('/api/user/stats');
              if (statsResponse.data.success) {
                set({ stats: statsResponse.data.stats || {} });
                console.log('User stats refreshed after deposit');
              }
            } catch (statsError) {
              console.error('Error refreshing stats after deposit:', statsError);
            }
            
            set({ isLoading: false });
            
            // Redirect to deposits page after successful submission
            window.location.href = '/deposits';
            
            return true;
          } else {
            throw new Error(response.data.message || 'Failed to submit deposit');
          }
        } catch (error) {
          console.error('Error submitting deposit:', error);
          set({ 
            error: error.message || 'Failed to submit deposit',
            isLoading: false 
          });
          throw error;
        }
      },

      // Submit investment function
      submitInvestment: async (investmentData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Creating investment with data:', investmentData);
          
          const response = await axiosInstance.post('/api/investments/create', investmentData);
          
          if (response.data.success) {
            // Refresh investments list
            await get().fetchInvestments();
            
            // Update user stats to get the latest balance
            try {
              const statsResponse = await axiosInstance.get('/api/user/stats');
              if (statsResponse.data.success) {
                set({ 
                  stats: statsResponse.data.stats || {},
                  userData: {
                    ...get().userData,
                    balance: statsResponse.data.stats.balance
                  }
                });
                console.log('User stats and balance refreshed after investment');
              }
              
              // Also refresh the auth state to ensure userData is up to date
              await get().checkAuth();
            } catch (statsError) {
              console.error('Error refreshing stats after investment:', statsError);
            }
            
            set({ isLoading: false });
            
            // Redirect to investments page after successful submission
            window.location.href = '/investments';
            
            return response.data;
          } else {
            throw new Error(response.data.message || 'Failed to create investment');
          }
        } catch (error) {
          console.error('Error creating investment:', error);
          set({ 
            error: error.message || 'Failed to create investment',
            isLoading: false 
          });
          return { 
            success: false, 
            message: error.message || 'Failed to create investment' 
          };
        }
      },

      // Request withdrawal function
      requestWithdrawal: async (withdrawalData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Requesting withdrawal with data:', withdrawalData);
          
          const response = await axiosInstance.post('/api/withdrawals/request', withdrawalData);
          
          if (response.data.success) {
            // Refresh withdrawals list
            await get().fetchWithdrawals();
            
            // Update user stats to get the latest balance
            try {
              const statsResponse = await axiosInstance.get('/api/user/stats');
              if (statsResponse.data.success) {
                set({ 
                  stats: statsResponse.data.stats || {},
                  userData: {
                    ...get().userData,
                    balance: statsResponse.data.stats.balance
                  }
                });
                console.log('User stats and balance refreshed after withdrawal request');
              }
              
              // Also refresh the auth state to ensure userData is up to date
              await get().checkAuth();
            } catch (statsError) {
              console.error('Error refreshing stats after withdrawal request:', statsError);
            }
            
            set({ isLoading: false });
            
            // Redirect to withdrawals page after successful submission
            window.location.href = '/withdrawals';
            
            return true;
          } else {
            throw new Error(response.data.message || 'Failed to request withdrawal');
          }
        } catch (error) {
          console.error('Error requesting withdrawal:', error);
          set({ 
            error: error.message || 'Failed to request withdrawal',
            isLoading: false 
          });
          return false;
        }
      },

      refreshUserProfile: async () => {
        try {
          const response = await axiosInstance.get('/api/user/data');
          
          if (response.data.success && response.data.userData) {
            let userData = response.data.userData;
            
            // Process the profile image URLs
            if (userData.profileImage) {
              try {
                // Add cache buster to force browser to reload the image
                const baseImageUrl = userData.profileImage.split('?')[0]; // Remove any existing cache busters
                userData.profileImage = getFullImageUrl(baseImageUrl) + `?t=${Date.now()}`;
              } catch (error) {
                console.error('Error processing profile image:', error);
              }
            }
            
            if (userData.profilePicture) {
              try {
                // Add cache buster to force browser to reload the image
                const baseImageUrl = userData.profilePicture.split('?')[0]; // Remove any existing cache busters
                userData.profilePicture = getFullImageUrl(baseImageUrl) + `?t=${Date.now()}`;
              } catch (error) {
                console.error('Error processing profile picture:', error);
              }
            }
            
            // Update the user data in state
            set({ userData });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error refreshing user profile:', error);
          return false;
        }
      },
      
      // Submit contact form message
      submitMessage: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Submitting contact form message...');
          
          // Add explicit headers for better CORS handling
          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: true
          };
          
          const response = await axiosInstance.post('/api/user/contact', formData, config);
          
          if (response.data.success) {
            console.log('Contact message sent successfully');
            set({ isLoading: false });
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Failed to send message');
          }
        } catch (error) {
          console.error('Message submission error:', error);
          
          // Special handling for network errors (likely CORS)
          if (error.message === 'Network Error') {
            console.error('Network error detected - possible CORS issue');
            set({ 
              error: 'Connection to server failed. This might be a CORS issue.',
              isLoading: false 
            });
            return { 
              success: false, 
              error: 'Unable to connect to the server. Please try again later.' 
            };
          }
          
          set({ 
            error: error.message || 'Failed to send message',
            isLoading: false 
          });
          return { success: false, error: error.message || 'Failed to send message' };
        }
      },

      // Calculate referral link
      get referralLink() {
        const userId = get().userData?.id;
        const baseUrl = window.location.origin;
        return userId ? `${baseUrl}/register?ref=${userId}` : '';
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      // Never persist transient runtime flags — they must always start
      // at their defaults on page load.  Persisting isLoading caused the
      // "Verifying session…" spinner to get stuck after login.
      partialize: (state) => {
        const { isLoading, error, ...rest } = state;
        return rest;
      }
    }
  )
);

export { useStore };
export default useStore;
