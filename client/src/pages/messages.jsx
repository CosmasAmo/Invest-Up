import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/dashboardLayout';
import useUserStore from '../store/userStore';

const MessagesPage = () => {
    const { userMessages, fetchUserMessages, markMessageAsRead, isLoading } = useUserStore();
    const [viewMessageModal, setViewMessageModal] = useState({ isOpen: false, message: null });
    
    useEffect(() => {
        fetchUserMessages();
    }, [fetchUserMessages]);
    
    useEffect(() => {
        // When opening a message, mark it as read if needed
        if (viewMessageModal.isOpen && viewMessageModal.message && viewMessageModal.message.status === 'unread') {
            markMessageAsRead(viewMessageModal.message.id);
        }
    }, [viewMessageModal, markMessageAsRead]);

    const handleViewMessage = (message) => {
        setViewMessageModal({ isOpen: true, message });
    };
    
    const renderMessages = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            );
        }
        
        if (!userMessages || userMessages.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-gray-400 mb-4 text-5xl">📫</div>
                    <p className="text-gray-400">You don&apos;t have any messages yet.</p>
                    <p className="text-gray-400 mt-2">
                        You can contact support by visiting the <a href="/contact" className="text-blue-400 hover:underline">Contact page</a>.
                    </p>
                </div>
            );
        }
        
        return userMessages.map((message) => (
            <div 
                key={message.id} 
                className={`bg-slate-800/40 rounded-lg p-4 mb-4 border-l-4 ${
                    message.status === 'replied' 
                        ? 'border-green-500' 
                        : message.status === 'unread' 
                        ? 'border-yellow-500' 
                        : 'border-blue-500'
                } hover:bg-slate-800/60 transition-colors cursor-pointer`}
                onClick={() => handleViewMessage(message)}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-semibold text-white">
                            {message.subject || 'No subject'}
                            {message.status === 'unread' && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                                    New
                                </span>
                            )}
                            {message.status === 'replied' && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                                    Replied
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            {new Date(message.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
                
                <div className="mt-2 text-gray-300 line-clamp-2">
                    {message.message}
                </div>
                
                {message.reply && (
                    <div className="mt-2 bg-slate-700/50 p-2 rounded border-l-2 border-green-500">
                        <div className="text-xs text-green-400 mb-1">Admin Response:</div>
                        <div className="text-gray-300 text-sm line-clamp-1">{message.reply}</div>
                    </div>
                )}
            </div>
        ));
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4"
            >
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Your Messages</h1>
                    <p className="text-gray-400 mt-1">
                        View all your messages and replies from the support team.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {renderMessages()}
                </div>
            </motion.div>
            
            {/* View Message Modal */}
            {viewMessageModal.isOpen && viewMessageModal.message && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
                        <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                            <h3 className="text-lg font-semibold text-white">
                                {viewMessageModal.message.subject || 'Message Details'}
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="text-sm text-gray-400 mb-3">
                                    <span className="text-white">Date:</span> {new Date(viewMessageModal.message.createdAt).toLocaleString()}
                                </div>
                                
                                <div className="font-semibold text-white mb-2">Your Message:</div>
                                <div className="bg-slate-700/50 p-3 rounded text-gray-300 whitespace-pre-wrap mb-6">
                                    {viewMessageModal.message.message}
                                </div>
                                
                                {viewMessageModal.message.reply ? (
                                    <div>
                                        <div className="font-semibold text-white mb-2 mt-4">Admin Response:</div>
                                        <div className="bg-slate-700/50 p-3 rounded text-gray-300 whitespace-pre-wrap border-l-2 border-green-500">
                                            {viewMessageModal.message.reply}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-yellow-400 mt-4 text-sm">
                                        Our team will respond to your message soon. Please check back later.
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setViewMessageModal({ isOpen: false, message: null })}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default MessagesPage; 