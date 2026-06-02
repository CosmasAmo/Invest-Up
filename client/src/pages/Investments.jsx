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
  const { investments, fetchInvestments, stopInvestment, fetchProfitStatus, isLoading, error } = useStore();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [profitStatus, setProfitStatus] = useState(null);
  
  // State for edit/delete modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [investmentToEdit, setInvestmentToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for stop investment modal
  const [showStopModal, setShowStopModal] = useState(false);
  const [investmentToStop, setInvestmentToStop] = useState(null);

  useEffect(() => {
    fetchInvestments();
    if (fetchProfitStatus) {
      fetchProfitStatus().then(status => setProfitStatus(status));
    }
  }, [fetchInvestments, fetchProfitStatus]);

  // Add additional useEffect to refresh data periodically
  useEffect(() => {
    // Refresh data initially
    fetchInvestments();
    
    // Set up a refresh interval
    const refreshInterval = setInterval(() => {
      fetchInvestments();
    }, 30000); // Refresh every 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [fetchInvestments]);

  // Filter investments by status
  const filteredInvestments = investments.filter(investment => {
    // Exclude stopped investments or investments with invalid status
    if (investment.status === 'stopped' || !investment.status) return false;
    
    // Apply status filter
    if (filter !== 'all' && investment.status !== filter) return false;
    
    // Apply search filter (search by amount)
    if (searchTerm) {
      return (
        investment.amount.toString().includes(searchTerm)
      );
    }
    
    return true;
  });

  // Calculate total invested amount
  const totalInvested = investments
    .filter(i => i.status === 'approved')
    .reduce((sum, investment) => sum + parseFloat(investment.amount), 0)
    .toFixed(2);

  // Calculate total profit earned
  const totalProfit = investments
    .filter(i => i.status === 'approved')
    .reduce((sum, investment) => sum + parseFloat(investment.totalProfit || 0), 0)
    .toFixed(2);

  // Count active investments
  const activeCount = investments.filter(i => i.status === 'approved').length;

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
  
  // Handle stop investment button click
  const handleStopInvestmentClick = (investment) => {
    setInvestmentToStop(investment);
    setShowStopModal(true);
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
  
  // Handle stop investment confirm
  const handleStopInvestmentConfirm = async () => {
    setIsSubmitting(true);

    try {
      const result = await stopInvestment(investmentToStop.id);
      
      if (result.success) {
        toast.success(result.message);
        setShowStopModal(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error stopping investment:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
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
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
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
              <h3 className="text-lg font-medium text-white">Active Investments</h3>
            </div>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
          </div>
        </div>

        {profitStatus && (
          <div className={`border rounded-xl p-4 mb-6 flex items-center justify-between ${profitStatus.isProfitEnabled ? 'bg-green-900/30 border-green-700/50' : 'bg-blue-900/30 border-blue-700/50'}`}>
            <div className="flex items-center">
              <FaChartLine className={`h-6 w-6 mr-3 ${profitStatus.isProfitEnabled ? 'text-green-400' : 'text-blue-400'}`} />
              <div>
                <h3 className="text-white font-medium">Profit Distribution: {profitStatus.isProfitEnabled ? 'Active Today' : 'Paused Today'}</h3>
                <p className="text-sm text-slate-300">Next Distribution: {profitStatus.nextProfitDayFormatted}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/60 mb-8 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by amount"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm('')}
                  >
                    <FaTimes className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-slate-300 text-sm">
              <span>Filter:</span>
              <button
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900/70 hover:bg-slate-900'
                }`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filter === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-900/70 hover:bg-slate-900'
                }`}
                onClick={() => setFilter('approved')}
              >
                Active
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mb-4" />
            <p className="text-slate-400">Loading your investments...</p>
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/60 py-12 px-4 text-center">
            <div className="bg-slate-900/50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              <FaExclamationCircle className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No investments found</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {filter !== 'all' 
                ? `You don't have any ${filter} investments.` 
                : searchTerm 
                  ? 'No investments match your search.' 
                  : "You have no active investments. Start growing your portfolio"}
            </p>
            <Link 
              to="/invest" 
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow transition-all duration-300 font-medium"
            >
              <FaPlus className="mr-2" />
              Create an Investment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestments.map(investment => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onStopInvestment={handleStopInvestmentClick}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Investment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Investment</h3>
            
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    className="block w-full bg-slate-900/80 border border-slate-700 rounded-lg py-2.5 pl-8 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={editFormData.amount}
                    onChange={handleEditFormChange}
                    step="0.01"
                    min="10"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Investment Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Investment</h3>
            <p className="text-slate-300 mb-4">
              Are you sure you want to delete this investment of ${investmentToDelete.amount}?
            </p>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Stop Investment Modal */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-2">Stop Investment</h3>
            <p className="text-slate-300 mb-4">
              Are you sure you want to stop this investment of ${investmentToStop.amount}? 
              Your investment amount will be refunded to your account balance.
            </p>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                onClick={() => setShowStopModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                onClick={handleStopInvestmentConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : 'Stop Investment'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default Investments; 