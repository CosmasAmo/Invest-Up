import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import axios from 'axios';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';
import { FaWallet, FaInfoCircle, FaExclamationTriangle, FaMoneyBillWave, FaArrowLeft, FaCheckCircle, FaSpinner, FaChartLine, FaPercentage, FaMoneyBillAlt } from 'react-icons/fa';

const WITHDRAWAL_METHODS = {
  BINANCE: {
    name: 'Binance ID',
    icon: '₮',
    placeholder: 'Enter your Binance ID'
  },
  TRC20: {
    name: 'Tron (TRC20)',
    icon: '₮',
    placeholder: 'Enter your USDT TRC20 address'
  },
  BEP20: {
    name: 'BNB Smart Chain (BEP20)',
    icon: '₮',
    placeholder: 'Enter your USDT BEP20 address'
  },
  ERC20: {
    name: 'Ethereum (ERC20)',
    icon: '₮',
    placeholder: 'Enter your USDT ERC20 address'
  },
  OPTIMISM: {
    name: 'Optimism',
    icon: '₮',
    placeholder: 'Enter your USDT Optimism address'
  }
};

function Withdraw() {
  const { requestWithdrawal, isLoading, userData, investments, fetchInvestments } = useStore();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [settings, setSettings] = useState({
    minWithdrawal: 3,
    withdrawalFee: 2,
    minInvestment: 100
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [step, setStep] = useState(1);
  const [hasInvestments, setHasInvestments] = useState(false);
  const [hasProfit, setHasProfit] = useState(false);
  const [isCheckingInvestments, setIsCheckingInvestments] = useState(true);
  const [firstDepositAmount, setFirstDepositAmount] = useState(0);
  const [firstInvestmentAmount, setFirstInvestmentAmount] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [investmentMeetsRequirements, setInvestmentMeetsRequirements] = useState(false);

  useEffect(() => {
    // Fetch settings from the server
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await axios.get('/api/settings', { withCredentials: true });
        if (response.data.success) {
          setSettings({
            minWithdrawal: response.data.settings.minWithdrawal,
            withdrawalFee: response.data.settings.withdrawalFee,
            minInvestment: response.data.settings.minInvestment
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
    // Check if user has investments
    const checkInvestments = async () => {
      setIsCheckingInvestments(true);
      try {
        await fetchInvestments();
        
        // Fetch first deposit
        const depositResponse = await axios.get('/api/user/deposits', { withCredentials: true });
        if (depositResponse.data.success && depositResponse.data.deposits.length > 0) {
          // Sort deposits by date (oldest first)
          const sortedDeposits = [...depositResponse.data.deposits].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          
          // Find first approved deposit
          const firstApprovedDeposit = sortedDeposits.find(d => d.status === 'approved');
          if (firstApprovedDeposit) {
            setFirstDepositAmount(parseFloat(firstApprovedDeposit.amount));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsCheckingInvestments(false);
      }
    };

    checkInvestments();
  }, [fetchInvestments]);

  useEffect(() => {
    // Check if user has any approved investments and calculate profit
    if (investments && investments.length > 0) {
      const approvedInvestments = investments.filter(inv => inv.status === 'approved');
      setHasInvestments(approvedInvestments.length > 0);
      
      if (approvedInvestments.length > 0) {
        // Sort investments by date (oldest first)
        const sortedInvestments = [...approvedInvestments].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        // Get first investment amount
        const firstInv = sortedInvestments[0];
        setFirstInvestmentAmount(parseFloat(firstInv.amount));
        
        // Calculate total profit
        const profit = approvedInvestments.reduce((sum, inv) => {
          return sum + parseFloat(inv.totalProfit || 0);
        }, 0);
        
        setTotalProfit(profit);
        setHasProfit(profit > 0);
      } else {
        setHasProfit(false);
        setTotalProfit(0);
      }
    } else {
      setHasInvestments(false);
      setHasProfit(false);
      setTotalProfit(0);
    }
  }, [investments]);

  useEffect(() => {
    // Check if investment meets requirements (50% of first deposit and not less than minInvestment)
    if (firstDepositAmount > 0 && firstInvestmentAmount > 0) {
      const minRequiredInvestment = Math.max(firstDepositAmount * 0.5, settings.minInvestment);
      setInvestmentMeetsRequirements(firstInvestmentAmount >= minRequiredInvestment);
    } else {
      setInvestmentMeetsRequirements(false);
    }
  }, [firstDepositAmount, firstInvestmentAmount, settings.minInvestment]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMethodSelect = (method) => {
    if (!amount || parseFloat(amount) < settings.minWithdrawal) {
      toast.error(`Minimum withdrawal amount is $${settings.minWithdrawal}`);
      return;
    }

    if (parseFloat(amount) > parseFloat(userData.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setSelectedMethod(method);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < settings.minWithdrawal) {
      toast.error(`Minimum withdrawal amount is $${settings.minWithdrawal}`);
      return;
    }

    if (parseFloat(amount) > parseFloat(userData.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    if (!selectedMethod) {
      toast.error('Please select a withdrawal method');
      return;
    }

    if (!walletAddress) {
      toast.error('Please enter wallet address');
      return;
    }

    const success = await requestWithdrawal({
      amount,
      paymentMethod: selectedMethod,
      walletAddress
    });

    if (success) {
      toast.success('Withdrawal request submitted successfully. Contact support for any delays.');
      setAmount('');
      setSelectedMethod(null);
      setWalletAddress('');
      setStep(1);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.3 }
    }
  };

  // Calculate the amount after fee
  const calculateAmountAfterFee = () => {
    if (!amount) return 0;
    const amountNum = parseFloat(amount);
    return Math.max(0, amountNum - settings.withdrawalFee).toFixed(2);
  };

  const renderWithdrawalBlockMessage = () => {
    if (!hasInvestments) {
      return {
        title: "Investment Required",
        message: "You need to make at least one investment before you can withdraw funds. This is to ensure the security and integrity of our platform.",
        icon: <FaChartLine className="h-10 w-10 text-red-500" />,
        buttonText: "Make Your First Investment",
        buttonLink: "/invest",
        buttonIcon: <FaChartLine className="mr-2" />
      };
    } else if (!investmentMeetsRequirements) {
      const minRequired = Math.max(firstDepositAmount * 0.5, settings.minInvestment).toFixed(2);
      return {
        title: "Investment Amount Too Low",
        message: `Your first investment (${firstInvestmentAmount.toFixed(2)}) must be at least 50% of your first deposit (${(firstDepositAmount * 0.5).toFixed(2)}) and not less than the minimum investment amount (${settings.minInvestment}). Required: $${minRequired}`,
        icon: <FaMoneyBillAlt className="h-10 w-10 text-yellow-500" />,
        buttonText: "Make a Larger Investment",
        buttonLink: "/invest",
        buttonIcon: <FaMoneyBillAlt className="mr-2" />
      };
    } else if (!hasProfit) {
      return {
        title: "No Profit Generated Yet",
        message: "You need to earn some profit from your investments before making a withdrawal. Please wait for your investments to generate profit.",
        icon: <FaPercentage className="h-10 w-10 text-blue-500" />,
        buttonText: "View Your Investments",
        buttonLink: "/investments",
        buttonIcon: <FaChartLine className="mr-2" />
      };
    }
    
    return null;
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdraw Funds</h1>
            <p className="mt-2 text-slate-300">Withdraw your funds to your preferred wallet</p>
          </div>
          
          <div className="p-6 sm:p-8">
            {isLoadingSettings || isCheckingInvestments ? (
              <div className="flex flex-col justify-center items-center py-16">
                <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mb-4" />
                <p className="text-slate-400">Loading withdrawal settings...</p>
              </div>
            ) : renderWithdrawalBlockMessage() ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                  {renderWithdrawalBlockMessage().icon}
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{renderWithdrawalBlockMessage().title}</h2>
                <p className="text-slate-300 mb-6 max-w-lg">
                  {renderWithdrawalBlockMessage().message}
                </p>
                <Link 
                  to={renderWithdrawalBlockMessage().buttonLink}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium"
                >
                  {renderWithdrawalBlockMessage().buttonIcon}
                  {renderWithdrawalBlockMessage().buttonText}
                </Link>
              </div>
            ) : (
              <div>
                {hasProfit && (
                  <div className="mb-6 bg-green-900/20 border border-green-700/30 rounded-lg p-4 flex items-start">
                    <FaInfoCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-green-400 font-medium">Profit Available for Withdrawal</h3>
                      <p className="text-green-300 mt-1">
                        You have earned ${totalProfit.toFixed(2)} in profit from your investments. You can now withdraw funds.
                      </p>
                    </div>
                  </div>
                )}
                
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg mb-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-5 rounded-xl">
                          <div className="flex items-center mb-4 sm:mb-0">
                            <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400">
                              <FaWallet className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                              <h3 className="font-medium text-white">Available Balance</h3>
                              <p className="text-2xl font-bold text-white">${parseFloat(userData?.balance || 0).toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="text-center sm:text-right bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
                            <p className="text-sm text-slate-300">Withdrawal Fee</p>
                            <p className="text-lg font-semibold text-white">${settings.withdrawalFee}</p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-center mb-4 text-blue-400 bg-blue-900/20 p-4 rounded-lg">
                            <FaInfoCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <p className="text-sm">
                              Withdrawals are processed within 24 hours. A fee of ${settings.withdrawalFee} will be deducted from your withdrawal amount.
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
                            Amount to Withdraw (USD)
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
                          
                          {amount && (
                            <div className="mt-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300">Amount:</span>
                                <span className="text-white font-medium">${parseFloat(amount || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-slate-300">Fee:</span>
                                <span className="text-red-400 font-medium">-${settings.withdrawalFee}</span>
                              </div>
                              <div className="border-t border-slate-700 my-3"></div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300">You will receive:</span>
                                <span className="text-green-400 font-bold">${calculateAmountAfterFee()}</span>
                              </div>
                            </div>
                          )}
                          
                          {amount && parseFloat(amount) < settings.minWithdrawal && (
                            <p className="mt-2 text-sm text-red-400 flex items-center">
                              <FaExclamationTriangle className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                              Minimum withdrawal amount is ${settings.minWithdrawal}
                            </p>
                          )}
                          
                          {amount && parseFloat(amount) > parseFloat(userData?.balance || 0) && (
                            <p className="mt-2 text-sm text-red-400 flex items-center">
                              <FaExclamationTriangle className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                              Insufficient balance
                            </p>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-medium text-white mb-4">Select Withdrawal Method</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(WITHDRAWAL_METHODS).map(([key, method]) => (
                            <div
                              key={key}
                              onClick={() => handleMethodSelect(key)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                amount && parseFloat(amount) >= settings.minWithdrawal && parseFloat(amount) <= parseFloat(userData?.balance || 0)
                                  ? 'border-slate-600 hover:border-blue-500 bg-slate-900/70 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-blue-900/10'
                                  : 'border-slate-700 bg-slate-900/30 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold mr-3">
                                  {method.icon}
                                </div>
                                <div>
                                  <h4 className="font-medium text-white">{method.name}</h4>
                                  <p className="text-xs text-slate-400">USDT</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg mb-6">
                        <button 
                          onClick={() => setStep(1)}
                          className="flex items-center text-slate-300 hover:text-white mb-6 transition-colors"
                        >
                          <FaArrowLeft className="mr-2" />
                          <span>Back to Amount</span>
                        </button>
                        
                        <div className="mb-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-5 rounded-xl">
                          <h3 className="font-medium text-white mb-2">Withdrawal Summary</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-400">Amount</p>
                              <p className="text-lg font-semibold text-white">${parseFloat(amount).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-400">Method</p>
                              <p className="text-lg font-semibold text-white">{WITHDRAWAL_METHODS[selectedMethod].name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-400">Fee</p>
                              <p className="text-lg font-semibold text-red-400">-${settings.withdrawalFee}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-400">You Will Receive</p>
                              <p className="text-lg font-semibold text-green-400">${calculateAmountAfterFee()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <label htmlFor="walletAddress" className="block text-sm font-medium text-slate-300 mb-2">
                            {WITHDRAWAL_METHODS[selectedMethod].name} Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaMoneyBillWave className="text-slate-400" />
                            </div>
                            <input
                              type="text"
                              id="walletAddress"
                              value={walletAddress}
                              onChange={(e) => setWalletAddress(e.target.value)}
                              placeholder={WITHDRAWAL_METHODS[selectedMethod].placeholder}
                              className="block w-full pl-10 py-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 transition-all duration-200"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={handleSubmit}
                            disabled={isLoading || !walletAddress}
                            className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center min-w-[180px] ${
                              isLoading || !walletAddress
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
                                <span>Confirm Withdrawal</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Withdraw; 