import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/navbar';
import InvestmentCard from '../components/InvestmentCard';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';
import { FaPlus, FaChartLine, FaSpinner, FaExclamationCircle, FaSearch, FaTimes, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

function Investments() {
  const { investments, fetchInvestments, isLoading, error } = useStore();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for edit/delete modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [investmentToEdit, setInvestmentToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  // Filter investments by status
  const filteredInvestments = investments.filter(investment => {
    if (filter !== 'all' && investment.status !== filter) return false;
    
    // Apply search filter (search by amount)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        investment.amount.toString().includes(searchTerm) ||
        (investment.status && investment.status.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Calculate total invested amount (approved only)
  const totalInvested = investments
    .filter(i => i.status === 'approved')
    .reduce((sum, investment) => sum + parseFloat(investment.amount), 0)
    .toFixed(2);

  // Calculate total profit earned
  const totalProfit = investments
    .filter(i => i.status === 'approved')
    .reduce((sum, investment) => sum + parseFloat(investment.totalProfit || 0), 0)
    .toFixed(2);

  // Count investments by status
  const pendingCount = investments.filter(i => i.status === 'pending').length;
  
  // Handle edit button click
  const handleEditClick = (investment) => {
    setInvestmentToEdit(investment);
    setEditFormData({
      amount: investment.amount
    });
    setShowEditModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (investment) => {
    setInvestmentToDelete(investment);
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

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.put('/api/investments/edit', {
        investmentId: investmentToEdit.id,
        amount: editFormData.amount
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowEditModal(false);
        // Refresh investments
        fetchInvestments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error updating investment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);

    try {
      const response = await axios.delete(`/api/investments/${investmentToDelete.id}`);

      if (response.data.success) {
        toast.success(response.data.message);
        setShowDeleteModal(false);
        // Refresh investments
        fetchInvestments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error deleting investment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
            <FaExclamationCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Investments</h2>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Investments</h1>
            <p className="text-slate-400">View and manage your investment portfolio</p>
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
              to="/invest" 
              className="inline-flex items-center px-4 py-2.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium text-sm sm:text-base"
            >
              <FaPlus className="mr-2" />
              New Investment
            </Link>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400 mr-3">
                <FaChartLine className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium text-white">Total Invested</h3>
            </div>
            <p className="text-2xl font-bold text-white">${totalInvested}</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 mr-3">
                <FaChartLine className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium text-white">Total Profit</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">+${totalProfit}</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-900/50 flex items-center justify-center text-yellow-400 mr-3">
                <FaChartLine className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium text-white">Pending Investments</h3>
            </div>
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-700/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-400 mb-1">Filter by Status</label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
              >
                <option value="all">All Investments</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search investments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FaSpinner className="animate-spin h-10 w-10 text-purple-500 mb-4" />
            <p className="text-slate-400">Loading your investments...</p>
          </div>
        ) : filteredInvestments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestments.map(investment => (
              <InvestmentCard 
                key={investment.id} 
                investment={investment} 
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <FaChartLine className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Investments Found</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              {filter !== 'all' 
                ? `You don't have any ${filter} investments.` 
                : searchTerm 
                  ? 'No investments match your search criteria.' 
                  : "You haven't made any investments yet."}
            </p>
            <Link
              to="/invest"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg shadow-lg transition-all duration-200"
            >
              <FaPlus className="mr-2" />
              Make Your First Investment
            </Link>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && investmentToDelete && (
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
              Are you sure you want to delete this investment? This action cannot be undone.
              <span className="block mt-2 text-green-400">
                Your funds will be returned to your balance.
              </span>
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
      
      {/* Edit Investment Modal */}
      {showEditModal && investmentToEdit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl p-6 max-w-md w-full my-8"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">
                Edit Investment
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

export default Investments; 