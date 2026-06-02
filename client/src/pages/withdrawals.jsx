import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import Footer from '../components/footer';
import { FaPlus, FaWallet, FaSpinner, FaExclamationCircle, FaSearch, FaTimes, FaEyeSlash, FaEye } from 'react-icons/fa';
import WithdrawalCard from '../components/WithdrawalCard';
import axios from 'axios';
import { toast } from 'react-toastify';

function Withdrawals() {
    const { fetchWithdrawals, withdrawals, isLoading, error } = useStore();
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showHidden, setShowHidden] = useState(false);
    
    // State for edit/delete modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [withdrawalToDelete, setWithdrawalToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [withdrawalToEdit, setWithdrawalToEdit] = useState(null);
    const [editFormData, setEditFormData] = useState({
        amount: '',
        paymentMethod: '',
        walletAddress: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    // Filter withdrawals by status and hidden status
    const filteredWithdrawals = withdrawals.filter(withdrawal => {
        // Filter by status if not "all"
        if (filter !== 'all' && withdrawal.status !== filter) return false;
        
        // Filter hidden withdrawals unless showHidden is true
        if (withdrawal.hidden && !showHidden) return false;
        
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
        .filter(w => w.status === 'approved' || w.status === 'deleted')
        .reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount), 0)
        .toFixed(2);

    // Count withdrawals by status
    const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
    const approvedCount = withdrawals.filter(w => w.status === 'approved').length;
    const hiddenCount = withdrawals.filter(w => w.hidden).length;
    
    // Handle edit button click
    const handleEditClick = (withdrawal) => {
        setWithdrawalToEdit(withdrawal);
        setEditFormData({
            amount: withdrawal.amount,
            paymentMethod: withdrawal.paymentMethod || '',
            walletAddress: withdrawal.walletAddress || ''
        });
        setShowEditModal(true);
    };

    // Handle delete button click
    const handleDeleteClick = (withdrawal) => {
        setWithdrawalToDelete(withdrawal);
        setShowDeleteModal(true);
    };

    // Handle toggle hidden status
    const handleToggleHidden = async (withdrawal) => {
        setIsSubmitting(true);
        
        try {
            const response = await axios.patch(`/api/withdrawals/${withdrawal.id}/toggle-hidden`);
            
            if (response.data.success) {
                toast.success(response.data.message);
                // Refresh withdrawals
                fetchWithdrawals();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
            console.error('Error toggling withdrawal visibility:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit form change
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle edit form submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.put('/api/withdrawals/edit', {
                withdrawalId: withdrawalToEdit.id,
                amount: editFormData.amount,
                paymentMethod: editFormData.paymentMethod,
                walletAddress: editFormData.walletAddress
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setShowEditModal(false);
                // Refresh withdrawals
                fetchWithdrawals();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
            console.error('Error updating withdrawal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete confirm
    const handleDeleteConfirm = async () => {
        setIsSubmitting(true);

        try {
            const response = await axios.delete(`/api/withdrawals/${withdrawalToDelete.id}`);

            if (response.data.success) {
                toast.success(response.data.message);
                setShowDeleteModal(false);
                // Refresh withdrawals
                fetchWithdrawals();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
            console.error('Error deleting withdrawal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper functions for wallet address guidance
    const getWalletAddressPlaceholder = (method) => {
        switch (method) {
            case 'BINANCE':
                return 'Enter your Binance ID';
            case 'TRC20':
                return 'Enter your USDT TRC20 address (starts with T)';
            case 'BEP20':
                return 'Enter your USDT BEP20 address (starts with 0x)';
            case 'ERC20':
                return 'Enter your USDT ERC20 address (starts with 0x)';
            case 'OPTIMISM':
                return 'Enter your USDT Optimism address (starts with 0x)';
            default:
                return 'Enter your wallet address';
        }
    };

    const getWalletAddressHelp = (method) => {
        switch (method) {
            case 'BINANCE':
                return 'Your Binance ID can be found in your Binance account profile.';
            case 'TRC20':
                return 'Make sure to use a valid TRC20 address to avoid loss of funds.';
            case 'BEP20':
                return 'Use a BNB Smart Chain (BSC) compatible wallet address.';
            case 'ERC20':
                return 'Standard Ethereum address. Higher network fees may apply.';
            case 'OPTIMISM':
                return 'Optimism L2 address for lower fees and faster transactions.';
            default:
                return 'Enter the correct address format for your selected payment method.';
        }
    };

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
        <div className="bg-slate-900 min-h-screen">
            <Navbar />
            
            <main className="py-10">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 md:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">Withdrawals</h1>
                            <p className="text-sm sm:text-base text-slate-400">Manage your withdrawal requests</p>
                        </div>
                        <Link 
                            to="/withdraw"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FaPlus className="-ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            New Withdrawal
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-3 sm:p-4 md:p-6 rounded-xl border border-slate-700/50 shadow-lg">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-900/50 flex items-center justify-center text-amber-400 mr-2 sm:mr-3 flex-shrink-0">
                                    <FaWallet className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <h3 className="text-sm sm:text-lg font-medium text-white truncate">Total Withdrawn</h3>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-white">${totalWithdrawn}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-3 sm:p-4 md:p-6 rounded-xl border border-slate-700/50 shadow-lg">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-900/50 flex items-center justify-center text-yellow-400 mr-2 sm:mr-3 flex-shrink-0">
                                    <FaWallet className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <h3 className="text-sm sm:text-lg font-medium text-white truncate">Pending Withdrawals</h3>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-white">{pendingCount}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-3 sm:p-4 md:p-6 rounded-xl border border-slate-700/50 shadow-lg">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 mr-2 sm:mr-3 flex-shrink-0">
                                    <FaWallet className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <h3 className="text-sm sm:text-lg font-medium text-white truncate">Approved Withdrawals</h3>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-white">{approvedCount}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sticky top-0 bg-slate-900 py-4 z-10">
                        {/* Search input */}
                        <div className="relative flex-1 max-w-lg w-full">
                            <input
                                type="text"
                                placeholder="Search by amount, method, or wallet..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Status filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('pending')}
                                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    Pending ({pendingCount})
                                </button>
                                <button
                                    onClick={() => setFilter('approved')}
                                    className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    Approved ({approvedCount})
                                </button>
                                
                                {/* Show/Hide hidden withdrawals toggle */}
                                <button
                                    onClick={() => setShowHidden(!showHidden)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${showHidden ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {showHidden ? (
                                        <>
                                            <FaEye className="w-3 h-3" />
                                            <span>Hidden ({hiddenCount})</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaEyeSlash className="w-3 h-3" />
                                            <span>Show Hidden</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {isLoading ? (
                        <div className="text-center py-16">
                            <FaSpinner className="animate-spin mx-auto h-10 w-10 text-blue-500 mb-4" />
                            <p className="text-slate-400">Loading your withdrawals...</p>
                        </div>
                    ) : filteredWithdrawals.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                            {filteredWithdrawals.map(withdrawal => (
                                <WithdrawalCard 
                                    key={withdrawal.id} 
                                    withdrawal={withdrawal} 
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                    onToggleHidden={handleToggleHidden}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <FaWallet className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                            <h2 className="text-xl font-semibold text-white mb-2">No Withdrawals Found</h2>
                            <p className="text-slate-400 max-w-md mx-auto mb-6">
                                {filter !== 'all' 
                                    ? `You don't have any ${filter} withdrawals.` 
                                    : searchTerm 
                                        ? 'No withdrawals match your search criteria.' 
                                        : "You haven't made any withdrawal requests yet or the withdrawals are hidden"}
                            </p>
                            <Link
                                to="/withdraw"
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg shadow-lg transition-all duration-200"
                            >
                                <FaPlus className="mr-2" />
                                Request a Withdrawal
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && withdrawalToDelete && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-3 sm:p-6 max-w-md w-full mx-4 sm:mx-auto"
                    >
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-white">Confirm Delete</h3>
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                            Are you sure you want to delete this withdrawal request? This action cannot be undone.
                            <span className="block mt-2 text-green-400 text-xs sm:text-sm">
                                Your funds will be returned to your balance.
                            </span>
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors w-full sm:w-auto text-sm sm:text-base"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center w-full sm:w-auto text-sm sm:text-base"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>Delete</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            {/* Edit Withdrawal Modal */}
            {showEditModal && withdrawalToEdit && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-3 sm:p-6 max-w-md w-full mx-4 sm:mx-auto my-8"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-white">
                                Edit Withdrawal Request
                            </h3>
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={editFormData.amount}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600 text-sm sm:text-base"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={editFormData.paymentMethod}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600 text-sm sm:text-base"
                                        required
                                    >
                                        <option value="">Select Payment Method</option>
                                        <option value="BINANCE">Binance ID</option>
                                        <option value="TRC20">Tron (TRC20)</option>
                                        <option value="BEP20">BNB Smart Chain (BEP20)</option>
                                        <option value="ERC20">Ethereum (ERC20)</option>
                                        <option value="OPTIMISM">Optimism</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                                        Wallet Address
                                    </label>
                                    <input
                                        type="text"
                                        name="walletAddress"
                                        value={editFormData.walletAddress}
                                        onChange={handleEditFormChange}
                                        className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600 text-sm sm:text-base"
                                        placeholder={getWalletAddressPlaceholder(editFormData.paymentMethod)}
                                        required
                                    />
                                    {editFormData.paymentMethod && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {getWalletAddressHelp(editFormData.paymentMethod)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors w-full sm:w-auto text-sm sm:text-base"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center w-full sm:w-auto text-sm sm:text-base"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>Save Changes</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default Withdrawals; 