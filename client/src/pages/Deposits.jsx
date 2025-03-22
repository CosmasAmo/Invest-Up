import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/navbar';
import DepositCard from '../components/DepositCard';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';
import { FaPlus, FaHistory, FaExclamationCircle, FaSpinner, FaFilter, FaSearch, FaCalendarAlt, FaTimes, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

function Deposits() {
  const { deposits = [], fetchDeposits, isLoading, error } = useStore();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first
  
  // State for edit/delete modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [depositToEdit, setDepositToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    paymentMethod: ''
  });
  const [editFile, setEditFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState({
    depositAddresses: {}
  });

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  useEffect(() => {
    // Fetch settings
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings', { withCredentials: true });
        if (response.data.success) {
          setSettings(response.data.settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Filter deposits
  const filteredDeposits = deposits.filter(deposit => {
    // Exclude deposits with status "deleted"
    if (deposit.status === 'deleted') return false;
    
    // Apply status filter
    if (filter !== 'all' && deposit.status !== filter) return false;
    
    // Apply search filter (search by amount, status, or payment method)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        deposit.amount.toString().includes(searchTerm) ||
        deposit.status.toLowerCase().includes(searchLower) ||
        (deposit.paymentMethod && deposit.paymentMethod.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Sort deposits
  const sortedDeposits = [...filteredDeposits].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Handle edit button click
  const handleEditClick = (deposit) => {
    setDepositToEdit(deposit);
    setEditFormData({
      amount: deposit.amount,
      paymentMethod: deposit.paymentMethod || ''
    });
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (deposit) => {
    setDepositToDelete(deposit);
    setShowDeleteModal(true);
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file change for deposit edit
  const handleFileChange = (e) => {
    setEditFile(e.target.files[0]);
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('depositId', depositToEdit.id);
      formData.append('amount', editFormData.amount);
      formData.append('paymentMethod', editFormData.paymentMethod);
      if (editFile) {
        formData.append('proofImage', editFile);
      }

      const response = await axios.put('/api/transactions/deposit/edit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowEditModal(false);
        // Refresh deposits
        fetchDeposits();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error updating deposit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);

    try {
      const response = await axios.delete(`/api/transactions/deposit/${depositToDelete.id}`);

      if (response.data.success) {
        toast.success(response.data.message);
        setShowDeleteModal(false);
        // Refresh deposits
        fetchDeposits();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error deleting deposit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get payment method name
  const getPaymentMethodName = (method) => {
    return method === 'BINANCE' ? 'Binance ID' : 
           method === 'TRC20' ? 'Tron (TRC20)' :
           method === 'BEP20' ? 'BNB Smart Chain (BEP20)' :
           method === 'ERC20' ? 'Ethereum (ERC20)' :
           method === 'OPTIMISM' ? 'Optimism' : method;
  };

  // Helper function to get payment method description
  const getPaymentMethodDescription = (method) => {
    return method === 'BINANCE' ? 'Deposit USDT to this Binance ID' :
           method === 'TRC20' ? 'Send USDT via Tron network' :
           method === 'BEP20' ? 'Send USDT via BNB Smart Chain' :
           method === 'ERC20' ? 'Send USDT via Ethereum network' :
           method === 'OPTIMISM' ? 'Send USDT via Optimism network' :
           `Send USDT via ${method} network`;
  };

  // Helper function to get payment address for selected method
  const getPaymentAddress = (method) => {
    return settings.depositAddresses?.[method] || '';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
            <FaExclamationCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Deposits</h2>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Count deposits by status
  const pendingCount = deposits.filter(d => d.status === 'pending').length;
  const approvedCount = deposits.filter(d => d.status === 'approved').length;

  // Calculate total amount deposited
  const totalDeposited = deposits
    .filter(d => d.status === 'approved')
    .reduce((sum, deposit) => sum + parseFloat(deposit.amount), 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Deposits</h1>
            <p className="text-slate-400">View and manage your deposit history</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium"
              onClick={() => window.history.back()}
            >
              <FaArrowLeft className="mr-2" />
              Back
            </motion.button>
            
            <Link 
              to="/deposit" 
              className="inline-flex items-center px-4 py-2.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium text-sm sm:text-base"
            >
              <FaPlus className="mr-2" />
              New Deposit
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 mr-3">
                <FaHistory className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-medium text-slate-300">Total Deposits</h3>
            </div>
            <p className="text-2xl font-bold text-white">{deposits.length}</p>
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
            <p className="text-2xl font-bold text-white">${totalDeposited}</p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-slate-800 to-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 border border-slate-700/50 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-400 mb-1">Filter by Status</label>
              <div className="relative">
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Deposits</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaFilter className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-400 mb-1">Sort by Date</label>
              <div className="relative">
                <select
                  id="sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search deposits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <FaSpinner className="animate-spin h-10 w-10 text-blue-500 mb-4" />
            <p className="text-slate-400">Loading your deposits...</p>
          </motion.div>
        ) : sortedDeposits.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {sortedDeposits.map((deposit) => (
              <DepositCard key={deposit.id} deposit={deposit} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center"
          >
            {searchTerm || filter !== 'all' ? (
              <>
                <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Matching Deposits</h3>
                <p className="text-slate-400 mb-6">No deposits match your current filters. Try adjusting your search criteria.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <FaHistory className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Deposits Yet</h3>
                <p className="text-slate-400 mb-6">You haven&apos;t made any deposits yet. Start by making your first deposit.</p>
                <Link 
                  to="/deposit"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium"
                >
                  <FaPlus className="mr-2" />
                  Make Your First Deposit
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && depositToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this deposit? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
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
      
      {/* Edit Deposit Modal */}
      {showEditModal && depositToEdit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-6 max-w-md w-full my-8"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">
                Edit Deposit
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={editFormData.amount}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={editFormData.paymentMethod}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                    required
                  >
                    <option value="">Select Payment Method</option>
                    {Object.keys(settings.depositAddresses || {}).map(method => (
                      <option key={method} value={method}>
                        {getPaymentMethodName(method)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {editFormData.paymentMethod && (
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700/50">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">Payment Information</h4>
                    <p className="text-sm text-gray-300 mb-2">{getPaymentMethodDescription(editFormData.paymentMethod)}</p>
                    <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700/50">
                      <code className="text-xs text-gray-300 font-mono">{getPaymentAddress(editFormData.paymentMethod)}</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(getPaymentAddress(editFormData.paymentMethod));
                          toast.success('Address copied to clipboard!');
                        }}
                        className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Proof of Payment
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                    accept="image/*"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to keep the current proof image
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
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
      
      <Footer />
    </div>
  );
}

export default Deposits; 