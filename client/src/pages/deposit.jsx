import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import axios from 'axios';
import Footer from '../components/footer';
import { FaClipboard, FaCheck, FaUpload, FaArrowLeft, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

function Deposit() {
  const { submitDeposit, isLoading } = useStore();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState(1);
  const [proofFile, setProofFile] = useState(null);
  const [settings, setSettings] = useState({
    minDeposit: 3, // Default value
    depositAddresses: {}
  });
  const [depositMethods, setDepositMethods] = useState({});
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [copied, setCopied] = useState(false);
  const addressInputRef = useRef(null);

  useEffect(() => {
    // Fetch settings from the server
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await axios.get('/api/settings', { withCredentials: true });
        
        if (response.data.success) {
          const fetchedSettings = response.data.settings;
          
          // Check if depositAddresses exists in server response
          let depositAddressesData = fetchedSettings.depositAddresses || {};
          
          // If depositAddresses is empty, try to get it from localStorage
          if (Object.keys(depositAddressesData).length === 0) {
            try {
              const savedSettings = localStorage.getItem('adminSettings');
              if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                if (parsedSettings.depositAddresses && Object.keys(parsedSettings.depositAddresses).length > 0) {
                  depositAddressesData = parsedSettings.depositAddresses;
                  console.log('Using deposit addresses from localStorage:', depositAddressesData);
                }
              }
            } catch (localStorageError) {
              console.error('Error reading from localStorage:', localStorageError);
            }
          }
          
          setSettings({
            minDeposit: fetchedSettings.minDeposit,
            depositAddresses: depositAddressesData
          });
          
          // Set up deposit methods based on the addresses from admin settings
          const methods = {};
          
          // Dynamically create methods for all deposit addresses
          Object.entries(depositAddressesData).forEach(([key, address]) => {
            methods[key] = {
              name: key === 'BINANCE' ? 'Binance ID' : 
                     key === 'TRC20' ? 'Tron (TRC20)' :
                     key === 'BEP20' ? 'BNB Smart Chain (BEP20)' :
                     key === 'ERC20' ? 'Ethereum (ERC20)' :
                     key === 'OPTIMISM' ? 'Optimism' : key,
              icon: '₮',
              address: address,
              description: key === 'BINANCE' ? 'Deposit USDT to this Binance ID' :
                         key === 'TRC20' ? 'Send USDT via Tron network' :
                         key === 'BEP20' ? 'Send USDT via BNB Smart Chain' :
                         key === 'ERC20' ? 'Send USDT via Ethereum network' :
                         key === 'OPTIMISM' ? 'Send USDT via Optimism network' :
                         `Send USDT via ${key} network`
            };
          });
          
          setDepositMethods(methods);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // If there's an error, try to load from localStorage
        try {
          const savedSettings = localStorage.getItem('adminSettings');
          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            if (parsedSettings.depositAddresses) {
              // Set up deposit methods based on localStorage
              const methods = {};
              const depositAddressesData = parsedSettings.depositAddresses;
              
              // Dynamically create methods for all deposit addresses
              Object.entries(depositAddressesData).forEach(([key, address]) => {
                methods[key] = {
                  name: key === 'BINANCE' ? 'Binance ID' : 
                         key === 'TRC20' ? 'Tron (TRC20)' :
                         key === 'BEP20' ? 'BNB Smart Chain (BEP20)' :
                         key === 'ERC20' ? 'Ethereum (ERC20)' :
                         key === 'OPTIMISM' ? 'Optimism' : key,
                  icon: '₮',
                  address: address,
                  description: key === 'BINANCE' ? 'Deposit USDT to this Binance ID' :
                             key === 'TRC20' ? 'Send USDT via Tron network' :
                             key === 'BEP20' ? 'Send USDT via BNB Smart Chain' :
                             key === 'ERC20' ? 'Send USDT via Ethereum network' :
                             key === 'OPTIMISM' ? 'Send USDT via Optimism network' :
                             `Send USDT via ${key} network`
                };
              });
              
              setDepositMethods(methods);
              setSettings({
                minDeposit: parsedSettings.minDeposit || 3,
                depositAddresses: depositAddressesData
              });
            }
          }
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError);
        }
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
      if (parseFloat(value) < settings.minDeposit) {
        toast.error(`Minimum deposit amount is $${settings.minDeposit}`);
        return;
      }
      setAmount(value);
    }
  };

  const handleMethodSelect = (method) => {
    if (parseFloat(amount) < settings.minDeposit) {
      toast.error(`Please enter an amount of $${settings.minDeposit} or more`);
      return;
    }
    
    if (Object.keys(depositMethods).length === 0) {
      toast.error('No deposit methods available. Please contact support.');
      return;
    }
    
    setSelectedMethod(method);
    setStep(2);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!proofFile) {
      toast.error('Please upload proof of payment');
      return;
    }

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('paymentMethod', selectedMethod);
    formData.append('proofImage', proofFile);

    try {
      const success = await submitDeposit(formData);
      if (success) {
        toast.success('Deposit submitted successfully. Awaiting admin approval.');
        // Redirect is now handled in the store
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
    }
  };

  const copyToClipboard = (address) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(address).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for browsers that don't support navigator.clipboard
      fallbackCopy();
    }

    function fallbackCopy() {
      if (addressInputRef.current) {
        addressInputRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
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

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Make a Deposit</h1>
            <p className="text-slate-400">Add funds to your account</p>
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
        
        <motion.div 
          className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-b border-slate-700/50">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Deposit Funds</h1>
            <p className="mt-2 text-slate-300">Add funds to your account to start investing</p>
          </div>
          
          <div className="p-6 sm:p-8">
            {isLoadingSettings ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {/* Steps indicator */}
                <div className="mb-8 flex justify-center">
                  <div className="flex items-center w-full max-w-xs">
                    <div className={`flex-1 h-1 ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      step >= 1 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>1</div>
                    <div className={`flex-1 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      step >= 2 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>2</div>
                    <div className={`flex-1 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      step >= 3 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>3</div>
                    <div className={`flex-1 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Make a Deposit</h1>
                        <p className="mt-2 text-slate-300">Add funds to your account</p>
                      </div>
                      
                      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 shadow-lg mb-6">
                        <div className="flex items-start space-x-3 mb-4 text-amber-400 bg-amber-900/20 p-4 rounded-lg">
                          <FaInfoCircle className="h-5 w-5 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-amber-300">Important Information</h3>
                            <p className="text-sm text-amber-200/80 mt-1">
                              The minimum deposit amount is ${settings.minDeposit}. Please ensure you send the exact amount you specify.
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
                            Amount to Deposit (USD)
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
                          {amount && parseFloat(amount) < settings.minDeposit && (
                            <p className="mt-2 text-sm text-red-400 flex items-center">
                              <FaExclamationTriangle className="mr-1.5 h-3.5 w-3.5" />
                              Minimum deposit amount is ${settings.minDeposit}
                            </p>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-medium text-white mb-4">Select Payment Method</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {Object.keys(depositMethods).length === 0 ? (
                            <div className="col-span-1 p-4 sm:p-6 text-center bg-slate-900/50 border border-slate-700 rounded-xl">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-slate-500 mb-2 sm:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <h4 className="text-lg sm:text-xl font-medium text-white mb-2">No Deposit Methods Available</h4>
                              <p className="text-sm text-slate-400">
                                The admin has not configured any deposit methods. Please contact support for assistance.
                              </p>
                            </div>
                          ) : (
                            Object.entries(depositMethods).map(([key, method]) => (
                              <div
                                key={key}
                                onClick={() => handleMethodSelect(key)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  amount && parseFloat(amount) >= settings.minDeposit
                                    ? 'border-slate-600 hover:border-blue-500 bg-slate-900/70 hover:bg-slate-800/70'
                                    : 'border-slate-700 bg-slate-900/30 opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="min-w-[40px] w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 font-bold mr-3">
                                    {method.icon}
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <h4 className="font-medium text-white truncate">{method.name}</h4>
                                    <p className="text-sm text-slate-400 truncate">{method.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
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
                          className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors duration-200"
                        >
                          <FaArrowLeft className="mr-2" />
                          <span>Back to payment methods</span>
                        </button>
                        
                        {depositMethods[selectedMethod] ? (
                          <>
                            <div className="mb-6">
                              <h3 className="text-lg font-medium text-white mb-2">
                                Send {amount} USDT via {depositMethods[selectedMethod].name}
                              </h3>
                              <p className="text-slate-300 mb-4">
                                Please send exactly <span className="font-semibold text-white">{amount} USDT</span> to the address below:
                              </p>
                              
                              <div className="mb-6">
                                <div className="relative">
                                  <input
                                    ref={addressInputRef}
                                    type="text"
                                    value={depositMethods[selectedMethod].address}
                                    readOnly
                                    className="block w-full pr-12 py-3 px-4 bg-slate-900/70 border border-slate-700 rounded-lg text-white font-mono text-xs sm:text-sm overflow-x-auto whitespace-nowrap"
                                  />
                                  <button
                                    onClick={() => copyToClipboard(depositMethods[selectedMethod].address)}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors duration-200"
                                  >
                                    {copied ? <FaCheck className="h-5 w-5" /> : <FaClipboard className="h-5 w-5" />}
                                  </button>
                                </div>
                                {copied && (
                                  <p className="mt-2 text-sm text-green-400">Address copied to clipboard!</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="mb-6">
                              <h3 className="text-lg font-medium text-white mb-4">Upload Payment Proof</h3>
                              <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 sm:p-6 text-center hover:border-blue-500 transition-colors duration-200">
                                <input
                                  type="file"
                                  id="proofFile"
                                  onChange={handleFileChange}
                                  className="hidden"
                                  accept="image/*"
                                />
                                <label
                                  htmlFor="proofFile"
                                  className="cursor-pointer flex flex-col items-center justify-center p-2"
                                >
                                  {proofFile ? (
                                    <div className="text-center">
                                      <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-900/30 text-green-400 mb-2 sm:mb-3">
                                        <FaCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                                      </div>
                                      <p className="text-white font-medium text-sm sm:text-base break-all">{proofFile.name}</p>
                                      <p className="text-slate-400 text-xs sm:text-sm mt-1">
                                        {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                      <p className="text-blue-400 text-xs sm:text-sm mt-2 sm:mt-3 hover:text-blue-300">
                                        Click to change file
                                      </p>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-900/30 text-blue-400 mb-2 sm:mb-3">
                                        <FaUpload className="h-5 w-5 sm:h-6 sm:w-6" />
                                      </div>
                                      <p className="text-white font-medium text-sm sm:text-base">Click to upload</p>
                                      <p className="text-slate-400 text-xs sm:text-sm mt-1">
                                        Upload a screenshot of your payment
                                      </p>
                                    </>
                                  )}
                                </label>
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <button
                                onClick={handleSubmit}
                                disabled={!proofFile || isLoading}
                                className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center min-w-[150px] ${
                                  !proofFile || isLoading
                                    ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-900/30'
                                } transition-all duration-300`}
                              >
                                {isLoading ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                  'Submit Deposit'
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="p-6 text-center bg-red-900/20 border border-red-700/30 rounded-xl mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h4 className="text-xl font-medium text-white mb-2">Payment Method Unavailable</h4>
                            <p className="text-slate-300 mb-4">
                              This payment method is no longer available. Please go back and select a different method.
                            </p>
                          </div>
                        )}
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

export default Deposit; 