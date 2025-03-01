import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import useAdminStore from '../../store/useAdminStore';
import { UsersIcon, CurrencyDollarIcon, UserGroupIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

function Dashboard() {
    const { 
        stats, 
        fetchAdminStats,
        pendingDeposits,
        fetchPendingDeposits,
        fetchApprovedDeposits,
        handleDeposit,
        pendingInvestments,
        fetchPendingInvestments,
        handleInvestment,
        fetchApprovedInvestments,
        pendingWithdrawals,
        handleWithdrawal,
        fetchPendingWithdrawals,
        messages,
        unreadCount,
        fetchMessages,
        replyToMessage,
        recentTransactions,
        fetchRecentTransactions
    } = useAdminStore();

    const [replyModal, setReplyModal] = useState({ isOpen: false, message: null });
    const [reply, setReply] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        fetchAdminStats();
        fetchPendingDeposits();
        fetchApprovedDeposits();
        fetchPendingInvestments();
        fetchApprovedInvestments();
        fetchPendingWithdrawals();
        fetchMessages();
        fetchRecentTransactions();

        // Set up interval for periodic updates
        const interval = setInterval(() => {
            fetchAdminStats();
            fetchPendingDeposits();
            fetchApprovedDeposits();
            fetchPendingInvestments();
            fetchApprovedInvestments();
            fetchPendingWithdrawals();
            fetchMessages();
            fetchRecentTransactions();
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [
        fetchAdminStats,
        fetchPendingDeposits,
        fetchApprovedDeposits,
        fetchPendingInvestments,
        fetchApprovedInvestments,
        fetchPendingWithdrawals,
        fetchMessages,
        fetchRecentTransactions
    ]);

    const statsCards = [
        { 
            title: 'Total Users', 
            value: stats?.totalUsers || 0,
            icon: UsersIcon,
            color: 'bg-gradient-to-r from-blue-600 to-blue-400',
            textColor: 'text-blue-100'
        },
        { 
            title: 'Verified Users', 
            value: stats?.verifiedUsers || 0,
            icon: UserGroupIcon,
            color: 'bg-gradient-to-r from-green-600 to-green-400',
            textColor: 'text-green-100'
        },
        { 
            title: 'Total Referral Earnings', 
            value: `$${stats?.totalReferralEarnings || '0.00'}`,
            icon: CurrencyDollarIcon,
            color: 'bg-gradient-to-r from-purple-600 to-purple-400',
            textColor: 'text-purple-100'
        },
        { 
            title: 'Total Investments', 
            value: `$${stats?.totalInvestments || '0.00'}`,
            icon: ArrowTrendingUpIcon,
            color: 'bg-gradient-to-r from-amber-600 to-amber-400',
            textColor: 'text-amber-100'
        },
        { 
            title: 'Pending Transactions', 
            value: (pendingDeposits?.length || 0) + (pendingWithdrawals?.length || 0) + (pendingInvestments?.length || 0),
            icon: ClockIcon,
            color: 'bg-gradient-to-r from-red-600 to-red-400',
            textColor: 'text-red-100'
        }
    ];

    // Add renderPendingDeposits function
    const renderPendingDeposits = () => {
        if (!pendingDeposits || pendingDeposits.length === 0) {
            return (
                <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-400">
                        No pending deposits
                    </td>
                </tr>
            );
        }

        return pendingDeposits.map((deposit) => (
            <tr key={deposit.id} className="border-t border-gray-700">
                <td className="py-3">{deposit.user?.name || 'Unknown User'}</td>
                <td>${parseFloat(deposit.amount).toFixed(2)}</td>
                <td>{deposit.paymentMethod}</td>
                <td>
                    <a 
                        href={`http://localhost:5000/uploads/${deposit.proofImage}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                    >
                        View Proof
                    </a>
                </td>
                <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-500">
                        Pending
                    </span>
                </td>
                <td className="space-x-2">
                    <button
                        onClick={() => handleDeposit(deposit.id, 'approved')}
                        className="px-3 py-1 rounded-md text-sm bg-green-500/20 text-green-500 hover:bg-green-500/30"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleDeposit(deposit.id, 'rejected')}
                        className="px-3 py-1 rounded-md text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    >
                        Reject
                    </button>
                </td>
            </tr>
        ));
    };

    // Add renderPendingInvestments function
    const renderPendingInvestments = () => {
        if (!pendingInvestments || pendingInvestments.length === 0) {
            return (
                <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-400">
                        No pending investments
                    </td>
                </tr>
            );
        }

        return pendingInvestments.map((investment) => (
            <tr key={investment.id} className="border-t border-gray-700">
                <td className="py-3">{investment.user?.name || 'Unknown User'}</td>
                <td>${parseFloat(investment.amount).toFixed(2)}</td>
                <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-500">
                        Pending
                    </span>
                </td>
                <td>{new Date(investment.createdAt).toLocaleDateString()}</td>
                <td className="space-x-2">
                    <button
                        onClick={() => handleInvestment(investment.id, 'approved')}
                        className="px-3 py-1 rounded-md text-sm bg-green-500/20 text-green-500 hover:bg-green-500/30"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleInvestment(investment.id, 'rejected')}
                        className="px-3 py-1 rounded-md text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    >
                        Reject
                    </button>
                </td>
            </tr>
        ));
    };

    // Add this new render function
    const renderPendingWithdrawals = () => {
        if (!pendingWithdrawals || pendingWithdrawals.length === 0) {
            return (
                <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-400">
                        No pending withdrawals
                    </td>
                </tr>
            );
        }

        return pendingWithdrawals.map((withdrawal) => (
            <tr key={withdrawal.id} className="border-t border-gray-700">
                <td className="py-3">{withdrawal.user?.name || 'Unknown User'}</td>
                <td>${parseFloat(withdrawal.amount).toFixed(2)}</td>
                <td>{withdrawal.paymentMethod}</td>
                <td className="font-mono text-sm">{withdrawal.walletAddress}</td>
                <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-500">
                        Pending
                    </span>
                </td>
                <td className="space-x-2">
                    <button
                        onClick={() => handleWithdrawal(withdrawal.id, 'approved')}
                        className="px-3 py-1 rounded-md text-sm bg-green-500/20 text-green-500 hover:bg-green-500/30"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleWithdrawal(withdrawal.id, 'rejected')}
                        className="px-3 py-1 rounded-md text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    >
                        Reject
                    </button>
                </td>
            </tr>
        ));
    };

    // Add this new render function after renderPendingWithdrawals
    const renderMessages = () => {
        if (!messages || messages.length === 0) {
            return (
                <div className="text-center py-8 text-gray-400">
                    <p>No messages found</p>
                </div>
            );
        }

        return messages.map((message) => (
            <div key={message.id} className="bg-slate-700/50 rounded-lg p-4 mb-4 hover:bg-slate-700/70 transition-colors">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center">
                            <span className="font-semibold text-white mr-2">From:</span>
                            <span className="text-gray-300">{message.name || 'Unknown'}</span>
                            {message.status === 'unread' && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                    New
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            <span className="font-medium text-gray-300 mr-2">Email:</span>
                            {message.email || 'No email provided'}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            <span className="font-semibold text-white mr-2">Date:</span>
                            {new Date(message.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <span className={`px-2 py-1 rounded-full text-xs 
                            ${message.status === 'unread' 
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : message.status === 'replied'
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-blue-500/20 text-blue-500'
                            }`}
                        >
                            {message.status}
                        </span>
                    </div>
                </div>
                
                <div className="mb-3">
                    <div className="font-semibold text-white mb-1">Subject:</div>
                    <div className="bg-slate-800/70 p-2 rounded text-gray-200">
                        {message.subject || 'No subject'}
                    </div>
                </div>
                
                <div className="mb-3">
                    <div className="font-semibold text-white mb-1">Message:</div>
                    <div className="bg-slate-800/70 p-3 rounded text-gray-200 max-h-24 overflow-y-auto">
                        {message.message}
                    </div>
                </div>
                
                {message.reply && (
                    <div className="mb-3">
                        <div className="font-semibold text-white mb-1">Your Reply:</div>
                        <div className="bg-blue-900/30 p-3 rounded text-gray-200 border-l-2 border-blue-500">
                            {message.reply}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end mt-3">
                    <button
                        onClick={() => handleReplyClick(message)}
                        className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        {message.status === 'replied' ? 'View Reply' : 'Reply'}
                    </button>
                </div>
            </div>
        ));
    };

    const handleReplyClick = (message) => {
        setReplyModal({ isOpen: true, message });
        setReply('');
    };

    const handleReplySubmit = async () => {
        if (!reply.trim()) {
            toast.error('Please enter a reply');
            return;
        }

        setIsReplying(true);
        try {
            const success = await replyToMessage(replyModal.message.id, reply);
            if (success) {
                toast.success('Reply sent successfully');
                setReplyModal({ isOpen: false, message: null });
            }
        } catch (error) {
            toast.error(error.message || 'Failed to send reply');
        }
        setIsReplying(false);
    };

    // Add this new render function for recent transactions
    const renderRecentTransactions = () => {
        if (!recentTransactions || recentTransactions.length === 0) {
            return (
                <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-400">
                        No recent transactions
                    </td>
                </tr>
            );
        }

        return recentTransactions.map((transaction) => (
            <tr key={transaction.id} className="border-t border-gray-700">
                <td className="py-3">{transaction.user?.name || 'Unknown User'}</td>
                <td>
                    <span className={`px-2 py-1 rounded-full text-xs 
                        ${transaction.type === 'deposit' 
                            ? 'bg-blue-500/20 text-blue-500'
                            : transaction.type === 'investment'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-purple-500/20 text-purple-500'
                        }`}
                    >
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                </td>
                <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                <td>
                    <span className={`px-2 py-1 rounded-full text-xs 
                        ${transaction.status === 'pending' 
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : transaction.status === 'approved'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}
                    >
                        {transaction.status}
                    </span>
                </td>
                <td>{new Date(transaction.createdAt).toLocaleString()}</td>
            </tr>
        ));
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Page header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <motion.h1 
                        className="text-2xl font-bold text-white mb-4 md:mb-0"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Admin Dashboard
                    </motion.h1>
                    <motion.div
                        className="flex flex-wrap gap-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <button 
                            onClick={() => fetchAdminStats()} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Refresh Data
                        </button>
                    </motion.div>
                </div>

                {/* Stats cards */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {statsCards.map((card, index) => (
                        <motion.div
                            key={card.title}
                            className={`${card.color} rounded-xl shadow-lg overflow-hidden`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="px-6 py-5 flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${card.textColor} opacity-80`}>{card.title}</p>
                                    <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <card.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main content sections - Single column layout */}
                <div className="space-y-8">
                    {/* Pending deposits */}
                    <motion.div
                        className="bg-slate-800 rounded-xl shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                            <h2 className="text-lg font-semibold text-white">Pending Deposits</h2>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proof</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {renderPendingDeposits()}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Pending withdrawals */}
                    <motion.div
                        className="bg-slate-800 rounded-xl shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                            <h2 className="text-lg font-semibold text-white">Pending Withdrawals</h2>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {renderPendingWithdrawals()}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Pending investments */}
                    <motion.div
                        className="bg-slate-800 rounded-xl shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                            <h2 className="text-lg font-semibold text-white">Pending Investments</h2>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {renderPendingInvestments()}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Recent messages - Improved styling */}
                    <motion.div
                        className="bg-slate-800 rounded-xl shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-white">Recent Messages</h2>
                            {unreadCount > 0 && (
                                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[600px]">
                            {renderMessages()}
                        </div>
                    </motion.div>

                    {/* Recent transactions */}
                    <motion.div
                        className="bg-slate-800 rounded-xl shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {renderRecentTransactions()}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Reply Modal - Enhanced */}
            {replyModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                            <h3 className="text-lg font-semibold text-white">Reply to Message</h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="flex items-center mb-2">
                                    <span className="font-semibold text-white mr-2">From:</span>
                                    <span className="text-gray-300">{replyModal.message.User?.name || replyModal.message.name || 'User'}</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <span className="font-semibold text-white mr-2">Email:</span>
                                    <span className="text-gray-300">{replyModal.message.User?.email || replyModal.message.email || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center mb-3">
                                    <span className="font-semibold text-white mr-2">Subject:</span>
                                    <span className="text-gray-300">{replyModal.message.subject}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-white">Message:</span>
                                </div>
                                <div className="bg-slate-700 p-3 rounded-lg text-white text-sm mb-4 max-h-40 overflow-y-auto">
                                    {replyModal.message.message}
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold text-white mb-2">Your Reply:</div>
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    className="w-full bg-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="4"
                                    placeholder="Type your reply here..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end mt-4 space-x-2">
                                <button
                                    onClick={() => setReplyModal({ isOpen: false, message: null })}
                                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReplySubmit}
                                    disabled={isReplying || !reply.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isReplying ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default Dashboard; 