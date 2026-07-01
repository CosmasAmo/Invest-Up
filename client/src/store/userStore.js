import { create } from 'zustand';
import axios from 'axios';

const useUserStore = create((set) => ({
    userMessages: [],
    isLoading: false,
    error: null,
    
    fetchUserMessages: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await axios.get('/api/user/messages');
            if (data.success) {
                set({ 
                    userMessages: data.messages,
                    isLoading: false,
                    error: null
                });
                return data.messages;
            } else {
                set({ 
                    error: data.message || 'Failed to fetch messages',
                    isLoading: false
                });
                return [];
            }
        } catch (error) {
            console.error('Error fetching user messages:', error);
            set({ 
                error: error.message || 'Failed to fetch messages',
                isLoading: false
            });
            return [];
        }
    },
    
    markMessageAsRead: async (messageId) => {
        try {
            const { data } = await axios.post('/api/user/mark-message-read', { messageId });
            if (data.success) {
                // Update the messages in the store to reflect the message as read
                set(state => ({
                    userMessages: state.userMessages.map(msg =>
                        msg.id === messageId ? { ...msg, status: 'read' } : msg
                    )
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error marking message as read:', error);
            return false;
        }
    }
}));

export default useUserStore; 