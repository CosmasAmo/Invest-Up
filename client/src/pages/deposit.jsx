import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import axios from 'axios';
import Footer from '../components/footer';

const DEPOSIT_METHODS = {
  BINANCE: {
    name: 'Binance ID',
    icon: '₮',
    address: '374592285',
    description: 'Deposit USDT to this Binance ID'
  },
  TRC20: {
    name: 'Tron (TRC20)',
    icon: '₮',
    address: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
    description: 'Send USDT via Tron network'
  },
  BEP20: {
    name: 'BNB Smart Chain (BEP20)',
    icon: '₮',
    address: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
    description: 'Send USDT via BNB Smart Chain'
  },
  ERC20: {
    name: 'Ethereum (ERC20)',
    icon: '₮',
    address: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
    description: 'Send USDT via Ethereum network'
  },
  OPTIMISM: {
    name: 'Optimism',
    icon: '₮',
    address: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
    description: 'Send USDT via Optimism network'
  }
};

function Deposit() {
  const { submitDeposit, isLoading } = useStore();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState(1);
  const [proofFile, setProofFile] = useState(null);
  const [settings, setSettings] = useState({
    minDeposit: 3 // Default value
  });
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
          setSettings({
            minDeposit: response.data.settings.minDeposit
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
    setSelectedMethod(method);
    setStep(2);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setProofFile(file);
    } else {
      toast.error('File size should be less than 5MB');
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
    formData.append('status', 'pending');

    const success = await submitDeposit(formData);
    if (success) {
      toast.success('Deposit submitted successfully. Awaiting admin approval.');
      setStep(1);
      setAmount('');
      setSelectedMethod(null);
      setProofFile(null);
    }
  };

  const copyToClipboard = (address) => {
    // Try using the Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address)
        .then(() => {
          setCopied(true);
          toast.success('Address copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    
    // Fallback method for mobile devices
    function fallbackCopy() {
      try {
        // Focus and select the input
        if (addressInputRef.current) {
          addressInputRef.current.select();
          addressInputRef.current.setSelectionRange(0, 99999); // For mobile devices
          
          // Try execCommand for older browsers
          const successful = document.execCommand('copy');
          
          if (successful) {
            setCopied(true);
            toast.success('Address copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
          } else {
            toast.info('Please tap and hold to copy the address manually');
          }
        } else {
          toast.info('Please tap and hold to copy the address manually');
        }
      } catch {
        toast.info('Please tap and hold to copy the address manually');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      <Navbar />
      
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl p-4 sm:p-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Deposit USDT</h1>
          
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="text-gray-400 block mb-2">Amount (USDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  required
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg"
                />
                <p className="text-sm text-gray-400 mt-1">
                  {isLoadingSettings 
                    ? "Loading minimum deposit amount..." 
                    : `Minimum deposit: $${settings.minDeposit} USDT`}
                </p>
              </div>

              <div>
                <label className="text-gray-400 block mb-4">Select Deposit Method</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(DEPOSIT_METHODS).map(([key, method]) => (
                    <button
                      key={key}
                      onClick={() => handleMethodSelect(key)}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-slate-700 
                        hover:bg-slate-600 transition-colors"
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-white font-medium">{method.name}</span>
                      <span className="text-gray-400 text-sm text-center">{method.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-700 p-4 sm:p-6 rounded-lg">
                <h3 className="text-xl text-white mb-4">Payment Details</h3>
                <p className="text-gray-400 mb-2">Amount: {amount} USDT</p>
                <p className="text-gray-400 mb-4">Method: {DEPOSIT_METHODS[selectedMethod].name}</p>
                
                <div className="bg-slate-600 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-300 mb-2">Send payment to:</p>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={DEPOSIT_METHODS[selectedMethod].address}
                      readOnly
                      ref={addressInputRef}
                      onClick={(e) => e.target.select()}
                      className="bg-transparent text-white w-full sm:flex-1 outline-none mb-2 sm:mb-0 text-center sm:text-left p-2 border border-slate-500 rounded"
                    />
                    <button
                      onClick={() => copyToClipboard(DEPOSIT_METHODS[selectedMethod].address)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white w-full sm:w-auto"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-amber-500/20 text-amber-400 border border-amber-500/30 p-4 rounded-lg mb-4">
                  <p className="text-sm">
                    <strong>Important:</strong> Only send USDT using the {DEPOSIT_METHODS[selectedMethod].name} method. 
                    Sending any other currency may result in permanent loss of funds.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-gray-400">Upload Payment Proof</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-700"
                    />
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg order-2 sm:order-1"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !proofFile}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex-1 order-1 sm:order-2"
                    >
                      {isLoading ? 'Processing...' : 'Submit Deposit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

export default Deposit; 