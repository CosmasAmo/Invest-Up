import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import Footer from '../components/footer';
import { FaPlus, FaWallet, FaSpinner, FaExclamationCircle, FaFilter, FaSearch } from 'react-icons/fa';

function Withdrawals() {
    const { fetchWithdrawals, withdrawals, isLoading, error } = useStore();
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    // Filter withdrawals by status
    const filteredWithdrawals = withdrawals.filter(withdrawal => {
        if (filter !== 'all' && withdrawal.status !== filter) return false;
        
        // Apply search filter (search by amount, method, or wallet)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                withdrawal.amount.toString().includes(searchTerm) ||
                (withdrawal.paymentMethod && withdrawal.paymentMethod.toLowerCase().includes(searchLower)) ||
                (withdrawal.walletAddress && withdrawal.walletAddress.toLowerCase().includes(searchLower))
            );
        }
        
        return true;
    });

    // Calculate total withdrawn amount (approved only)
    const totalWithdrawn = withdrawals
        .filter(w => w.status === 'approved')
        .reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount), 0)
        .toFixed(2);

    // Count withdrawals by status
    const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
    const approvedCount = withdrawals.filter(w => w.status === 'approved').length;

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900">
                <Navbar />
                <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
                        <FaExclamationCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Error Loading Withdrawals</h2>
                        <p className="text-red-400">{error}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />
            
            <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdrawals History</h1>
                        <p className="text-slate-400 mt-1">Track and manage your withdrawal activities</p>
                    </div>
                    <Link 
                        to="/withdraw"
                        className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium"
                    >
                        <FaPlus className="mr-2" />
                        New Withdrawal
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
                    >
                        <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 mr-3">
                                <FaWallet className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-300">Total Withdrawals</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">{withdrawals.length}</p>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
                    >
                        <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 mr-3">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-medium text-slate-300">Approved</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">{approvedCount}</p>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
                    >
                        <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full bg-yellow-900/50 flex items-center justify-center text-yellow-400 mr-3">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-medium text-slate-300">Pending</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">{pendingCount}</p>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 rounded-xl border border-slate-700/50 shadow-lg"
                    >
                        <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-green-400 mr-3">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-medium text-slate-300">Total Amount</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">${totalWithdrawn}</p>
                    </motion.div>
                </div>

                {/* Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl p-4 mb-6 border border-slate-700/50 shadow-lg"
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="filter" className="block text-sm font-medium text-slate-400 mb-1">Filter by Status</label>
                            <div className="relative">
                                <select
                                    id="filter"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Withdrawals</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <FaFilter className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <label htmlFor="search" className="block text-sm font-medium text-slate-400 mb-1">Search</label>
                            <div className="relative">
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search by amount, method..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <FaSearch className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg"
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <FaSpinner className="animate-spin h-10 w-10 text-blue-500 mb-4" />
                            <p className="text-slate-400">Loading your withdrawals...</p>
                        </div>
                    ) : filteredWithdrawals.length > 0 ? (
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full text-left text-slate-300">
                                <thead className="text-slate-400 text-xs sm:text-sm bg-slate-800/80 border-b border-slate-700/50">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">ID</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">Amount</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Method</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Wallet</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4">Status</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {filteredWithdrawals.map((withdrawal) => (
                                        <tr key={withdrawal.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm whitespace-nowrap">
                                                {withdrawal.transactionId?.substring(0, 8) || 'N/A'}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-white">
                                                ${parseFloat(withdrawal.amount).toFixed(2)}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell whitespace-nowrap">
                                                {withdrawal.paymentMethod}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs hidden md:table-cell whitespace-nowrap">
                                                {withdrawal.walletAddress?.substring(0, 10) + '...' || 'N/A'}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                    ${withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                    withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                    'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                                                >
                                                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden sm:table-cell whitespace-nowrap">
                                                {new Date(withdrawal.createdAt).toLocaleDateString()}
                                                <span className="text-slate-500 ml-2 text-xs">
                                                    {new Date(withdrawal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center"
                        >
                            <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                                <FaWallet className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Withdrawals Found</h3>
                            <p className="text-slate-400 mb-6">
                                {filter !== 'all' 
                                    ? `No ${filter} withdrawals found. Try changing your filters.` 
                                    : searchTerm 
                                        ? 'No withdrawals match your search criteria.' 
                                        : "You haven't made any withdrawals yet. Start by making your first withdrawal."}
                            </p>
                            {filter === 'all' && !searchTerm && (
                                <Link 
                                    to="/withdraw"
                                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium"
                                >
                                    <FaPlus className="mr-2" />
                                    Make Your First Withdrawal
                                </Link>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}

export default Withdrawals; 