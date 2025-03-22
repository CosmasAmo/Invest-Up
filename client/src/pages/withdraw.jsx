import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import axios from 'axios';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';
import { FaWallet, FaInfoCircle, FaExclamationTriangle, FaMoneyBillWave, FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa';

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
  const { requestWithdrawal, isLoading, userData } = useStore();
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

  // Calculate the amount after fee
  const calculateAmountAfterFee = () => {
    if (!amount) return 0;
    const amountNum = parseFloat(amount);
    return Math.max(0, amountNum - settings.withdrawalFee).toFixed(2);
  };

  const renderWithdrawalBlockMessage = () => {
    return null; // Remove all restriction messages
  };

  // Monitor step changes for debugging
  useEffect(() => {
    console.log('Step changed to:', step);
    
    // Only reset wallet address when going back to step 1
    // We need to be careful not to create a circular dependency
    if (step === 1) {
      // We only want to reset the wallet address here, not the selected method
      setWalletAddress('');
    }
  }, [step]); // Only depend on step to avoid circular updates
  
  // Monitor selectedMethod changes separately
  useEffect(() => {
    console.log('Selected method changed to:', selectedMethod);
  }, [selectedMethod]);

  // Handle transition to step 2
  useEffect(() => {
    // When we transition to step 2 and have a selected method
    if (step === 2 && selectedMethod) {
      console.log('In step 2 with method:', selectedMethod);
      // Force a re-render of the wallet address field
      setWalletAddress('');
    }
  }, [step, selectedMethod]);

  // Add debugging information to the UI
  const renderDebugInfo = () => {
    if (import.meta.env.DEV) {
      return (
        <div className="fixed bottom-0 right-0 bg-black/80 text-white p-2 text-xs z-50">
          Step: {step}, Method: {selectedMethod || 'none'}, Address: {walletAddress || 'none'}
        </div>
      );
    }
    return null;
  };

  // Log render conditions
  console.log('Render conditions:', {
    step,
    selectedMethod,
    shouldShowStep2: step === 2 && selectedMethod,
    walletAddress
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      {renderDebugInfo()}
      
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdraw Funds</h1>
            <p className="text-slate-400">Request a withdrawal to your wallet</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium"
            onClick={() => window.history.back()}
          >
            <FaArrowLeft className="mr-2" />
            Back
          </motion.button>
        </div>
        
        {/* Step 1: Select amount and method */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50"
          >
            <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-b border-slate-700/50">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdraw Funds</h1>
              <p className="mt-2 text-slate-300">Request a withdrawal to your wallet</p>
            </div>
            
            <div className="p-6 sm:p-8">
              {isLoadingSettings ? (
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
                    
                    <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                      <p className="text-sm text-blue-300 flex items-start">
                        <FaInfoCircle className="mr-2 flex-shrink-0 mt-0.5" />
                        <span>Enter an amount above the minimum withdrawal limit (${settings.minWithdrawal}), then select a withdrawal method to continue.</span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(WITHDRAWAL_METHODS).map(([key, method]) => (
                        <div
                          key={key}
                          onClick={() => {
                            // Always allow clicking, but show error message if conditions aren't met
                            if (!amount || parseFloat(amount) < settings.minWithdrawal) {
                              toast.error(`Minimum withdrawal amount is $${settings.minWithdrawal}`);
                              return;
                            }
                            
                            if (parseFloat(amount) > parseFloat(userData?.balance || 0)) {
                              toast.error('Insufficient balance');
                              return;
                            }
                            
                            // Use a single state update to avoid race conditions
                            const methodKey = key;
                            console.log('Setting method to:', methodKey);
                            
                            // First set the selected method
                            setSelectedMethod(methodKey);
                            
                            // Then clear the wallet address and change the step
                            // Use a small timeout to ensure React processes the first state change
                            setTimeout(() => {
                              setWalletAddress('');
                              setStep(2);
                              console.log('Method selected:', methodKey, 'Step set to:', 2);
                            }, 10);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                            amount && parseFloat(amount) >= settings.minWithdrawal && parseFloat(amount) <= parseFloat(userData?.balance || 0)
                              ? 'border-slate-600 hover:border-blue-500 bg-slate-900/70 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-blue-900/10'
                              : 'border-slate-700 bg-slate-900/30 opacity-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="min-w-[40px] w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold mr-3">
                              {method.icon}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="font-medium text-white truncate">{method.name}</h4>
                              <p className="text-xs text-slate-400">USDT</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Step 2: Enter wallet address */}
        {step === 2 && selectedMethod && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50"
          >
            <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-b border-slate-700/50">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Enter Withdrawal Address</h1>
              <p className="mt-2 text-slate-300">Provide your {WITHDRAWAL_METHODS[selectedMethod].name} address</p>
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg mb-6">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center text-slate-300 hover:text-white mb-6 transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  <span>Back to Amount</span>
                </button>
                
                <div className="mb-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-4 sm:p-5 rounded-xl">
                  <h3 className="font-medium text-white mb-3">Withdrawal Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-slate-400">Amount</p>
                      <p className="text-base sm:text-lg font-semibold text-white">${parseFloat(amount).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-slate-400">Method</p>
                      <p className="text-base sm:text-lg font-semibold text-white truncate">{WITHDRAWAL_METHODS[selectedMethod].name}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-slate-400">Fee</p>
                      <p className="text-base sm:text-lg font-semibold text-red-400">-${settings.withdrawalFee}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-slate-400">You Will Receive</p>
                      <p className="text-base sm:text-lg font-semibold text-green-400">${calculateAmountAfterFee()}</p>
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
                      key={`wallet-address-${selectedMethod}`}
                      type="text"
                      id="walletAddress"
                      value={walletAddress}
                      onChange={(e) => {
                        console.log('Wallet address changed:', e.target.value);
                        setWalletAddress(e.target.value);
                      }}
                      placeholder={WITHDRAWAL_METHODS[selectedMethod].placeholder}
                      className="block w-full pl-10 py-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 transition-all duration-200 text-sm"
                      autoFocus
                    />
                  </div>
                  {/* Debug info */}
                  {import.meta.env.DEV && (
                    <div className="mt-2 text-xs text-slate-500">
                      Debug: Step {step}, Method: {selectedMethod}, Address field rendered
                    </div>
                  )}
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
            </div>
          </motion.div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default Withdraw; 