import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import useAdminStore from '../../store/useAdminStore';
import { UsersIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

function Dashboard() {
    const { 
        stats, 
        recentUsers, 
        topReferrers, 
        fetchDashboardStats, 
        pendingDeposits,
        approvedDeposits,
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
        replyToMessage
    } = useAdminStore();

    const [replyModal, setReplyModal] = useState({ isOpen: false, message: null });
    const [reply, setReply] = useState('');

    useEffect(() => {
        fetchDashboardStats();
        fetchPendingDeposits();
        fetchApprovedDeposits();
        fetchPendingInvestments();
        fetchApprovedInvestments();
        fetchPendingWithdrawals();
        fetchMessages();
    }, [fetchPendingDeposits, fetchApprovedDeposits, fetchPendingInvestments, fetchPendingWithdrawals, fetchMessages]);

    const statsCards = [
        { 
            title: 'Total Users', 
            value: stats?.totalUsers || 0,
            icon: UsersIcon,
            color: 'bg-blue-500'
        },
        { 
            title: 'Verified Users', 
            value: stats?.verifiedUsers || 0,
            icon: UserGroupIcon,
            color: 'bg-green-500'
        },
        { 
            title: 'Total Referral Earnings', 
            value: `$${stats?.totalReferralEarnings || '0.00'}`,
            icon: CurrencyDollarIcon,
            color: 'bg-purple-500'
        }
    ];

    // Add error handling for pending deposits section
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

    // Add renderApprovedDeposits function
    const renderApprovedDeposits = () => {
        if (!approvedDeposits || approvedDeposits.length === 0) {
            return (
                <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-400">
                        No approved deposits
                    </td>
                </tr>
            );
        }

        return approvedDeposits.map((deposit) => (
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
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500">
                        Approved
                    </span>
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
                <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-400">
                        No messages
                    </td>
                </tr>
            );
        }

        return messages.map((message) => (
            <tr key={message.id} className="border-t border-gray-700">
                <td className="py-3">
                    <div>
                        <p className="font-medium">{message.User?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-400">{message.User?.email}</p>
                    </div>
                </td>
                <td className="py-3">{message.subject}</td>
                <td className="py-3 max-w-xs truncate">{message.message}</td>
                <td className="py-3">{message.reply || '-'}</td>
                <td className="py-3">
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
                </td>
                <td className="py-3">
                    <button
                        onClick={() => handleReplyClick(message)}
                        className="px-3 py-1 rounded-md text-sm bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                    >
                        {message.status === 'replied' ? 'View Reply' : 'Reply'}
                    </button>
                </td>
            </tr>
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

        const success = await replyToMessage(replyModal.message.id, reply);
        if (success) {
            toast.success('Reply sent successfully');
            setReplyModal({ isOpen: false, message: null });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statsCards.map((stat) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-lg p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">
                                        {stat.value}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-full ${stat.color}`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Users */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Users</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 text-sm">
                                <tr>
                                    <th className="pb-3">Name</th>
                                    <th className="pb-3">Email</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers?.map((user) => (
                                    <tr key={user.id} className="border-t border-gray-700">
                                        <td className="py-3">{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                user.isAccountVerified 
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                                {user.isAccountVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Referrers */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Top Referrers</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 text-sm">
                                <tr>
                                    <th className="pb-3">Name</th>
                                    <th className="pb-3">Email</th>
                                    <th className="pb-3">Referrals</th>
                                    <th className="pb-3">Earnings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topReferrers?.map((user) => (
                                    <tr key={user.id} className="border-t border-gray-700">
                                        <td className="py-3">{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.referralCount}</td>
                                        <td>${parseFloat(user.referralEarnings).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Deposits */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Pending Deposits</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 text-sm">
                                <tr>
                                    <th className="pb-3">User</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Method</th>
                                    <th className="pb-3">Proof</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderPendingDeposits()}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Approved Deposits */}
                <div className="bg-gray-800 rounded-lg p-6 mt-6">
                    <h2 className="text-xl font-bold text-white mb-4">Approved Deposits</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 text-sm">
                                <tr>
                                    <th className="pb-3">User</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Method</th>
                                    <th className="pb-3">Proof</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderApprovedDeposits()}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Investments */}
                <div className="bg-gray-800 rounded-lg p-6 mt-6">
                    <h2 className="text-xl font-bold text-white mb-4">Pending Investments</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 text-sm">
                                <tr>
                                    <th className="pb-3">User</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderPendingInvestments()}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Withdrawals */}
                <div className="bg-gray-800 rounded-lg p-6 mt-6">
                    <h2 className="text-xl font-bold text-white mb-4">Pending Withdrawals</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 text-sm">
                                <tr>
                                    <th className="pb-3">User</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Method</th>
                                    <th className="pb-3">Wallet Address</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderPendingWithdrawals()}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Messages */}
                <div className="bg-gray-800 rounded-lg p-6 mt-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                        Messages 
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-1 text-sm bg-yellow-500/20 text-yellow-500 rounded-full">
                                {unreadCount} unread
                            </span>
                        )}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 text-sm">
                                <tr>
                                    <th className="pb-3">User</th>
                                    <th className="pb-3">Subject</th>
                                    <th className="pb-3">Message</th>
                                    <th className="pb-3">Reply</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderMessages()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {replyModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-4">Reply to Message</h3>
                        <div className="mb-4">
                            <p className="text-gray-400">From: {replyModal.message.user?.name}</p>
                            <p className="text-gray-400">Email: {replyModal.message.email}</p>
                            <p className="text-gray-400">Subject: {replyModal.message.subject}</p>
                            <p className="mt-2">{replyModal.message.message}</p>
                        </div>
                        <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4"
                            rows={4}
                            placeholder="Type your reply..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setReplyModal({ isOpen: false, message: null })}
                                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReplySubmit}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default Dashboard; 