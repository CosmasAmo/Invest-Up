import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import useStore from '../store/useStore';
import Navbar from '../components/navbar';

function Messages() {
    const { messages, fetchUserMessages, isLoading, markMessageAsRead } = useStore();

    useEffect(() => {
        fetchUserMessages();
    }, [fetchUserMessages]);

    useEffect(() => {
        if (messages) {
            const repliedMessages = messages.filter(
                message => message.status === 'replied' && !message.isRead
            );
            repliedMessages.forEach(message => {
                markMessageAsRead(message.id);
            });
        }
    }, [messages, markMessageAsRead]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'unread':
                return 'text-yellow-400';
            case 'read':
                return 'text-blue-400';
            case 'replied':
                return 'text-green-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold mb-4">Your Messages</h1>
                    <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
                </motion.div>

                {isLoading ? (
                    <div className="text-center">Loading...</div>
                ) : messages?.length === 0 ? (
                    <div className="text-center text-gray-400">No messages yet</div>
                ) : (
                    <div className="space-y-6">
                        {messages?.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-800 rounded-lg p-6 shadow-lg"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-1">{message.subject}</h3>
                                        <p className="text-sm text-gray-400">
                                            {format(new Date(message.createdAt), 'PPpp')}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(message.status)}`}>
                                        {message.status}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        <p className="text-sm text-gray-400 mb-2">Your message:</p>
                                        <p>{message.message}</p>
                                    </div>
                                    
                                    {message.reply && (
                                        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-blue-500 rounded-full p-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
                                                        <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                                                    </svg>
                                                </span>
                                                <p className="text-sm text-blue-400">Admin Reply:</p>
                                            </div>
                                            <p>{message.reply}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages; 