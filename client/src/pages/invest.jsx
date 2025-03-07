import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import axios from 'axios';
import Footer from '../components/footer';
import { FaChartLine, FaInfoCircle, FaExclamationTriangle, FaMoneyBillWave, FaPercentage, FaCalendarAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa';

function Invest() {
  const { submitInvestment, isLoading, userData } = useStore();
  const [amount, setAmount] = useState('');
  const [settings, setSettings] = useState({
    minInvestment: 3,
    profitPercentage: 5,
    profitInterval: 5
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [firstDeposit, setFirstDeposit] = useState(null);
  const [hasInvestments, setHasInvestments] = useState(false);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(true);

  useEffect(() => {
    // Fetch settings from the server
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await axios.get('/api/settings', { withCredentials: true });
        if (response.data.success) {
          setSettings({
            minInvestment: response.data.settings.minInvestment,
            profitPercentage: response.data.settings.profitPercentage,
            profitInterval: response.data.settings.profitInterval
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // If there's an error, we'll use the default values
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    // Check if user has any approved investments and get first deposit
    const fetchUserData = async () => {
      try {
        setIsLoadingDeposits(true);
        
        // Get user's investments
        const investmentsResponse = await axios.get('/api/investments', { withCredentials: true });
        if (investmentsResponse.data.success) {
          const approvedInvestments = investmentsResponse.data.investments.filter(inv => inv.status === 'approved');
          setHasInvestments(approvedInvestments.length > 0);
        }
        
        // Get user's first deposit
        const depositsResponse = await axios.get('/api/deposits', { withCredentials: true });
        if (depositsResponse.data.success) {
          const approvedDeposits = depositsResponse.data.deposits.filter(dep => dep.status === 'approved');
          if (approvedDeposits.length > 0) {
            // Sort by creation date and get the first one
            approvedDeposits.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setFirstDeposit(approvedDeposits[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingDeposits(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < settings.minInvestment) {
      toast.error(`Minimum investment amount is $${settings.minInvestment}`);
      return;
    }

    if (parseFloat(amount) > parseFloat(userData.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    // Check if this is the first investment and if it meets the 50% requirement
    if (!hasInvestments && firstDeposit) {
      const firstDepositAmount = parseFloat(firstDeposit.amount);
      const minRequiredInvestment = Math.max(firstDepositAmount * 0.5, settings.minInvestment);
      
      if (parseFloat(amount) < minRequiredInvestment) {
        toast.error(`Your first investment must be at least 50% of your first deposit ($${(firstDepositAmount * 0.5).toFixed(2)}) and not less than the minimum investment amount ($${settings.minInvestment}).`);
        return;
      }
    }

    try {
      const success = await submitInvestment({ amount: parseFloat(amount) });
      if (success) {
        toast.success('Investment request submitted successfully. Awaiting admin approval.');
        setAmount('');
        // Redirect is now handled in the store
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create investment');
    }
  };

  // Calculate expected returns
  const calculateDailyReturn = () => {
    if (!amount) return 0;
    return (parseFloat(amount) * settings.profitPercentage / 100).toFixed(2);
  };

  const calculateMonthlyReturn = () => {
    if (!amount) return 0;
    return (parseFloat(amount) * settings.profitPercentage / 100 * 30).toFixed(2);
  };

  const calculateYearlyReturn = () => {
    if (!amount) return 0;
    return (parseFloat(amount) * settings.profitPercentage / 100 * 365).toFixed(2);
  };

  // Calculate minimum required investment for first-time investors
  const getMinimumInvestmentAmount = () => {
    if (hasInvestments || !firstDeposit) {
      return settings.minInvestment;
    }
    
    const firstDepositAmount = parseFloat(firstDeposit.amount);
    return Math.max(firstDepositAmount * 0.5, settings.minInvestment);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-b border-slate-700/50">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Investment</h1>
            <p className="mt-2 text-slate-300">Invest your funds and earn daily profits</p>
          </div>
          
          <div className="p-6 sm:p-8">
            {isLoadingSettings || isLoadingDeposits ? (
              <div className="flex flex-col justify-center items-center py-16">
                <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mb-4" />
                <p className="text-slate-400">Loading investment options...</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 mr-3">
                        <FaPercentage className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-300">Profit Rate</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">{settings.profitPercentage}% <span className="text-sm font-normal text-slate-400">/ day</span></p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 mr-3">
                        <FaMoneyBillWave className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-300">Min Investment</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">${getMinimumInvestmentAmount()} <span className="text-sm font-normal text-slate-400">USD</span></p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-5 rounded-xl border border-slate-700/50 shadow-lg"
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 mr-3">
                        <FaCalendarAlt className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-300">Available Balance</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">${parseFloat(userData?.balance || 0).toFixed(2)} <span className="text-sm font-normal text-slate-400">USD</span></p>
                  </motion.div>
                </div>
                
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg mb-6">
                  <div className="flex items-start space-x-3 mb-6 text-amber-400 bg-amber-900/20 p-4 rounded-lg border border-amber-900/30">
                    <FaInfoCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-300">Investment Information</h3>
                      <p className="text-sm text-amber-200/80 mt-1">
                        Investments earn {settings.profitPercentage}% profit daily. Profits are automatically added to your balance every 24 hours.
                        You can withdraw your investment at any time after 7 days.
                        {!hasInvestments && firstDeposit && (
                          <span className="block mt-2">
                            <strong>Note:</strong> Your first investment must be at least 50% of your first deposit (${(parseFloat(firstDeposit.amount) * 0.5).toFixed(2)}).
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
                        Investment Amount (USD)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-400">$</span>
                        </div>
                        <input
                          type="text"
                          id="amount"
                          value={amount}
                          onChange={handleAmountChange}
                          placeholder="Enter amount"
                          className="block w-full pl-8 pr-12 py-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 transition-all duration-200"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-slate-400">USD</span>
                        </div>
                      </div>
                      
                      {amount && parseFloat(amount) < getMinimumInvestmentAmount() && (
                        <p className="mt-2 text-sm text-red-400 flex items-center">
                          <FaExclamationTriangle className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                          {!hasInvestments && firstDeposit 
                            ? `Your first investment must be at least 50% of your first deposit ($${(parseFloat(firstDeposit.amount) * 0.5).toFixed(2)})`
                            : `Minimum investment amount is $${settings.minInvestment}`
                          }
                        </p>
                      )}
                      
                      {amount && parseFloat(amount) > parseFloat(userData?.balance || 0) && (
                        <p className="mt-2 text-sm text-red-400 flex items-center">
                          <FaExclamationTriangle className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                          Insufficient balance
                        </p>
                      )}
                    </div>

                    {amount && parseFloat(amount) >= getMinimumInvestmentAmount() && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-r from-slate-900/70 to-slate-800/70 p-5 rounded-xl border border-slate-700/50"
                      >
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                          <FaChartLine className="mr-2 text-blue-400" />
                          Expected Returns
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-green-500/30 transition-colors duration-300">
                            <p className="text-sm text-slate-400 mb-1">Daily Profit</p>
                            <p className="text-xl font-bold text-green-400">${calculateDailyReturn()}</p>
                          </div>
                          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-green-500/30 transition-colors duration-300">
                            <p className="text-sm text-slate-400 mb-1">Monthly Profit</p>
                            <p className="text-xl font-bold text-green-400">${calculateMonthlyReturn()}</p>
                          </div>
                          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-green-500/30 transition-colors duration-300">
                            <p className="text-sm text-slate-400 mb-1">Yearly Profit</p>
                            <p className="text-xl font-bold text-green-400">${calculateYearlyReturn()}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-900/30 rounded-lg">
                          <p className="text-sm text-green-300 flex items-start">
                            <FaInfoCircle className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              By investing ${parseFloat(amount).toFixed(2)}, you&apos;ll earn approximately ${calculateDailyReturn()} every day, 
                              which is ${calculateMonthlyReturn()} per month.
                            </span>
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading || !amount || parseFloat(amount) < getMinimumInvestmentAmount() || parseFloat(amount) > parseFloat(userData?.balance || 0)}
                        className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center min-w-[180px] ${
                          isLoading || !amount || parseFloat(amount) < getMinimumInvestmentAmount() || parseFloat(amount) > parseFloat(userData?.balance || 0)
                            ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-900/30'
                        } transition-all duration-300`}
                      >
                        {isLoading ? (
                          <>
                            <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="mr-2" />
                            <span>Create Investment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Invest; 