import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import axios from 'axios';
import Footer from '../components/footer';
import { FaChartLine, FaExclamationTriangle, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';

function Invest() {
  const { submitInvestment, isLoading: isSubmitting, userData } = useStore();
  const [amount, setAmount] = useState('');
  const [settings, setSettings] = useState({
    minInvestment: 3,
    profitPercentage: 5
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  useEffect(() => {
    // Fetch settings
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const response = await axios.get('/api/settings');
        if (response.data.success) {
          setSettings({
            minInvestment: parseFloat(response.data.settings.minInvestment) || 3,
            profitPercentage: parseFloat(response.data.settings.profitPercentage) || 5
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings. Using default values.');
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
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

    // Check if the investment meets the minimum amount requirement
    if (parseFloat(amount) < settings.minInvestment) {
      toast.error(`Minimum investment amount is $${settings.minInvestment}.`);
      return;
    }

    try {
      const result = await submitInvestment({ amount: parseFloat(amount) });
      if (result.success) {
        toast.success('Investment submitted successfully!');
        setAmount('');
      } else {
        toast.error(result.message);
      }
    } catch (errorObj) {
      console.error('Investment error:', errorObj);
      toast.error('An error occurred. Please try again.');
    }
  };

  // Calculate daily return
  const calculateDailyReturn = () => {
    if (!amount) return 0;
    return (parseFloat(amount) * settings.profitPercentage / 100).toFixed(2);
  };

  // Calculate monthly return (30 days)
  const calculateMonthlyReturn = () => {
    if (!amount) return 0;
    // Calculate for 21 weekdays in a month (average)
    return (parseFloat(amount) * settings.profitPercentage / 100 * 21).toFixed(2);
  };

  // Calculate yearly return
  const calculateYearlyReturn = () => {
    if (!amount) return 0;
    // Calculate for 252 weekdays in a year (average)
    return (parseFloat(amount) * settings.profitPercentage / 100 * 252).toFixed(2);
  };

  // Get minimum investment amount from settings
  const getMinimumInvestmentAmount = () => {
    return settings.minInvestment;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      {isLoadingSettings ? (
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-400 text-lg">Loading investment options...</p>
          </div>
        </div>
      ) : (
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div 
            className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-4 sm:p-6 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Create Investment</h1>
                  <p className="text-slate-400 mt-1 text-sm sm:text-base">Invest your funds and earn daily profits</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-3 sm:mt-0 inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium"
                  onClick={() => window.history.back()}
                >
                  <FaArrowLeft className="mr-2" />
                  Back
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div>
                  <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-amber-700/30">
                    <div className="flex flex-col sm:flex-row sm:items-start">
                      <div className="bg-amber-900/50 rounded-full p-2 sm:p-3 mb-3 sm:mb-0 sm:mr-4 self-start inline-flex">
                        <FaInfoCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Investment Information</h3>
                        <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
                          Investments earn {settings.profitPercentage}% profit daily on weekdays (Monday to Friday). Profits are automatically added to your balance every 24 hours. Withdrawals are processed within 0-4 hours.
                        </p>
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-amber-900/30 rounded-lg border border-amber-700/30">
                          <p className="text-xs sm:text-sm text-amber-200/80 flex items-start">
                            <FaExclamationTriangle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>Important: Profits only accumulate on weekdays (Monday to Friday). No profits are earned on weekends.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                      <label htmlFor="amount" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1 sm:mb-2">
                        Investment Amount (USD)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-sm sm:text-base">$</span>
                        </div>
                        <input
                          type="text"
                          id="amount"
                          value={amount}
                          onChange={handleAmountChange}
                          className="block w-full pl-6 sm:pl-8 pr-10 sm:pr-12 py-2 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm sm:text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter amount"
                        />
                        <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center">
                          <span className="text-slate-400 text-sm sm:text-base">USD</span>
                        </div>
                      </div>
                      
                      {amount && parseFloat(amount) < getMinimumInvestmentAmount() && (
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-400 flex items-center">
                          <FaExclamationTriangle className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          Minimum investment amount is ${settings.minInvestment}
                        </p>
                      )}
                      
                      {amount && parseFloat(amount) > parseFloat(userData?.balance || 0) && (
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-400 flex items-center">
                          <FaExclamationTriangle className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          Insufficient balance
                        </p>
                      )}
                    </div>

                    {amount && parseFloat(amount) >= getMinimumInvestmentAmount() && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 rounded-lg p-2.5 sm:p-4 border border-slate-700/50"
                      >
                        <h4 className="text-xs sm:text-sm font-medium text-slate-300 mb-2 sm:mb-3">Profit Projection (Weekdays Only)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                          <div className="bg-slate-800 p-2.5 sm:p-3 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center sm:block">
                              <p className="text-xs text-slate-400">Daily (Weekday)</p>
                              <p className="text-sm sm:text-base md:text-lg font-semibold text-green-400 sm:mt-1">+${calculateDailyReturn()}</p>
                            </div>
                          </div>
                          <div className="bg-slate-800 p-2.5 sm:p-3 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center sm:block">
                              <p className="text-xs text-slate-400">Monthly (21 Days)</p>
                              <p className="text-sm sm:text-base md:text-lg font-semibold text-green-400 sm:mt-1">+${calculateMonthlyReturn()}</p>
                            </div>
                          </div>
                          <div className="bg-slate-800 p-2.5 sm:p-3 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center sm:block">
                              <p className="text-xs text-slate-400">Yearly (252 Days)</p>
                              <p className="text-sm sm:text-base md:text-lg font-semibold text-green-400 sm:mt-1">+${calculateYearlyReturn()}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 sm:mt-3">
                          * Projections are based on weekday-only profit accumulation (Monday to Friday)
                        </p>
                      </motion.div>
                    )}

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !amount || parseFloat(amount) < getMinimumInvestmentAmount() || parseFloat(amount) > parseFloat(userData?.balance || 0)}
                        className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base text-white ${
                          isSubmitting || !amount || parseFloat(amount) < getMinimumInvestmentAmount() || parseFloat(amount) > parseFloat(userData?.balance || 0)
                            ? 'bg-slate-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        } transition-all duration-300 flex items-center justify-center`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>Create Investment</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-700/30">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Investment Benefits</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-blue-900/30 rounded-full p-2 mr-3 flex-shrink-0">
                        <FaChartLine className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-white">Daily Profits</h4>
                        <p className="text-xs sm:text-sm text-slate-400">Earn {settings.profitPercentage}% profit daily on weekdays (Monday to Friday) on your investment amount.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-green-900/30 rounded-full p-2 mr-3 flex-shrink-0">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-white">Automatic Payments</h4>
                        <p className="text-xs sm:text-sm text-slate-400">Profits are automatically added to your balance every 24 hours.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-purple-900/30 rounded-full p-2 mr-3 flex-shrink-0">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-white">Flexible Terms</h4>
                        <p className="text-xs sm:text-sm text-slate-400">Withdraw your investment at any time within a period of 0-4 hours.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-amber-900/30 rounded-full p-2 mr-3 flex-shrink-0">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-white">Compound Growth</h4>
                        <p className="text-xs sm:text-sm text-slate-400">Reinvest your profits to maximize your earnings through compound growth.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <h4 className="text-sm sm:text-base font-medium text-white mb-1 sm:mb-2">Your Current Balance</h4>
                    <p className="text-xl sm:text-2xl font-bold text-white">${parseFloat(userData?.balance || 0).toFixed(2)}</p>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">Available for investment</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default Invest; 