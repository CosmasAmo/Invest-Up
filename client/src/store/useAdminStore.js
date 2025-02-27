import { create } from 'zustand';
import axios from 'axios';

const useAdminStore = create((set) => ({
    stats: null,
    users: [],
    recentUsers: [],
    topReferrers: [],
    isLoading: false,
    error: null,
    pendingDeposits: [],
    approvedDeposits: [],
    pendingInvestments: [],
    approvedInvestments: [],
    pendingWithdrawals: [],
    approvedWithdrawals: [],
    messages: [],
    unreadCount: 0,

    fetchDashboardStats: async () => {
        set({ isLoading: true });
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin/stats');
            if (data.success) {
                set({ 
                    stats: data.stats,
                    recentUsers: data.recentUsers,
                    topReferrers: data.topReferrers
                });
            }
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAllUsers: async () => {
        set({ isLoading: true });
        try {
            const { data } = await axios.get('/api/admin/users');
            if (data.success) {
                set({ users: data.users });
            }
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    updateUserStatus: async (userId, isVerified) => {
        try {
            const { data } = await axios.post('/api/admin/update-user-status', {
                userId,
                isVerified
            });
            if (data.success) {
                await useAdminStore.getState().fetchAllUsers();
            }
        } catch (error) {
            set({ error: error.message });
        }
    },

    fetchPendingDeposits: async () => {
        try {
            const { data } = await axios.get('/api/admin/pending-deposits');
            if (data.success) {
                set({ pendingDeposits: data.deposits || [] });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error fetching pending deposits:', error);
            set({ error: error.message, pendingDeposits: [] });
        }
    },

    handleDeposit: async (depositId, status) => {
        try {
            const { data } = await axios.post('/api/admin/handle-deposit', {
                depositId,
                status
            });
            if (data.success) {
                await useAdminStore.getState().fetchPendingDeposits();
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            set({ error: error.message });
            return false;
        }
    },

    fetchApprovedDeposits: async () => {
        try {
            const { data } = await axios.get('/api/admin/approved-deposits');
            if (data.success) {
                set({ approvedDeposits: data.deposits || [] });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error fetching approved deposits:', error);
            set({ error: error.message, approvedDeposits: [] });
        }
    },

    fetchPendingInvestments: async () => {
        try {
            const { data } = await axios.get('/api/admin/pending-investments');
            if (data.success) {
                set({ pendingInvestments: data.investments || [] });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error fetching pending investments:', error);
            set({ error: error.message, pendingInvestments: [] });
        }
    },

    handleInvestment: async (investmentId, status) => {
        try {
            const { data } = await axios.post('/api/admin/handle-investment', {
                investmentId,
                status
            });
            if (data.success) {
                await useAdminStore.getState().fetchPendingInvestments();
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            set({ error: error.message });
            return false;
        }
    },

    fetchApprovedInvestments: async () => {
        try {
            const { data } = await axios.get('/api/admin/approved-investments');
            if (data.success) {
                set({ approvedInvestments: data.investments || [] });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error fetching approved investments:', error);
            set({ error: error.message, approvedInvestments: [] });
        }
    },

    fetchPendingWithdrawals: async () => {
        try {
            const { data } = await axios.get('/api/admin/pending-withdrawals');
            if (data.success) {
                set({ pendingWithdrawals: data.withdrawals || [] });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error fetching pending withdrawals:', error);
            set({ error: error.message, pendingWithdrawals: [] });
        }
    },

    handleWithdrawal: async (withdrawalId, status) => {
        try {
            const { data } = await axios.post('/api/admin/handle-withdrawal', {
                withdrawalId,
                status
            });
            if (data.success) {
                await useAdminStore.getState().fetchPendingWithdrawals();
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            set({ error: error.message });
            return false;
        }
    },

    markMessageAsRead: async (messageId) => {
        try {
            const { data } = await axios.post('/api/admin/mark-message-read', { messageId });
            if (data.success) {
                await useAdminStore.getState().fetchMessages();
            }
        } catch (error) {
            set({ error: error.message });
        }
    },

    createUser: async (userData) => {
        try {
            const { data } = await axios.post('/api/admin/users', userData);
            if (data.success) {
                return data.user;
            }
            throw new Error(data.message);
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    deleteUser: async (userId) => {
        try {
            const { data } = await axios.delete(`/api/admin/users/${userId}`);
            if (data.success) {
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    updateUser: async (userId, userData) => {
        try {
            const { data } = await axios.put(`/api/admin/users/${userId}`, userData);
            if (data.success) {
                return data.user;
            }
            throw new Error(data.message);
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    fetchMessages: async () => {
        try {
            const { data } = await axios.get('/api/admin/messages');
            if (data.success) {
                set({ messages: data.messages });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    },

    replyToMessage: async (messageId, reply) => {
        try {
            const { data } = await axios.post('/api/admin/reply-message', {
                messageId,
                reply
            });
            if (data.success) {
                set(state => ({
                    messages: state.messages.map(msg =>
                        msg.id === messageId ? { ...msg, status: 'replied', reply } : msg
                    )
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error sending reply:', error);
            return false;
        }
    }
}));

export default useAdminStore; 