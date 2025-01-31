import { create } from 'zustand';
import axios from 'axios';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';

// Set default base URL for axios
axios.defaults.baseURL = 'http://localhost:5000'; // Update this with your backend URL
axios.defaults.withCredentials = true;

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

      // Add checkAuth function
      checkAuth: async () => {
        console.log('Checking authentication...');
        set({ isLoading: true });
        try {
          const { data } = await axios.get('/api/auth/check');
          console.log('Auth check response:', data);
          if (data.success) {
            set({
              isAuthenticated: true,
              userData: data.user,
              isVerified: data.user.isAccountVerified,
              isAdmin: data.user.isAdmin,
              isLoading: false
            });
          } else {
            set({ isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          set({ isAuthenticated: false, isLoading: false });
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
          const { data } = await axios.post('/api/auth/register', userData);
          if (data.success) {
            set({ isLoading: false });
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
          const { data } = await axios.put('/api/user/update-profile', profileData);
          if (data.success) {
            set(state => ({
              userData: { ...state.userData, ...profileData }
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

      // User data actions
      fetchUserData: async () => {
        try {
          const { data } = await axios.get('/api/user/data');
          if (data.success) {
            set({ 
              userData: data.user,
              isAuthenticated: true,
              isVerified: data.user.isAccountVerified 
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
        set({ isLoading: true });
        try {
          const { data } = await axios.post('/api/auth/login', credentials);
          if (data.success) {
            set({ 
              isAuthenticated: true,
              userData: data.userData,
              isVerified: data.userData.isAccountVerified,
              isAdmin: data.userData.isAdmin,
              isLoading: false
            });
            return true;
          }
          throw new Error(data.message);
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await axios.post('/api/auth/logout');
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
          const { data } = await axios.get('/api/user/dashboard');
          if (data.success) {
            set({
              userData: data.user,
              stats: {
                ...data.stats,
                totalWithdrawals: data.stats.totalWithdrawals || 0,
                pendingWithdrawals: data.stats.pendingWithdrawals || 0,
                completedWithdrawals: data.stats.completedWithdrawals || 0
              }
            });
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          set({ error: error.message });
        }
      },

      fetchDeposits: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.get('/api/user/deposits');
          if (data.success) {
            set({ deposits: data.deposits });
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error('Error fetching deposits:', error);
          set({ error: error.message });
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
      submitMessage: async (messageData) => {
        try {
          const { data } = await axios.post('/api/user/contact', {
            subject: messageData.subject,
            message: messageData.message
          });
          
          if (data.success) {
            return true;
          }
          throw new Error(data.message);
        } catch (error) {
          console.error('Error details:', error.response?.data || error.message);
          toast.error(error.response?.data?.message || 'Error sending message. Please try again.');
          return false;
        }
      },

      fetchUserMessages: async () => {
        set({ isLoading: true });
        try {
          const { data } = await axios.get('/api/user/messages');
          if (data.success) {
            set({ messages: data.messages, isLoading: false });
          }
        } catch (error) {
          console.error('Error fetching user messages:', error);
          set({ isLoading: false });
        }
      },

      markMessageAsRead: debounce(async (messageId) => {
        try {
          const { data } = await axios.post('/api/user/mark-message-read', { messageId });
          if (data.success) {
            set(state => ({
              messages: state.messages.map(msg => 
                msg.id === messageId ? { ...msg, isRead: true } : msg
              )
            }));
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }, 300)
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