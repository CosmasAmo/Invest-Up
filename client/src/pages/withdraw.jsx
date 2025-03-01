import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import axios from 'axios';

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
    withdrawalFee: 2
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    // Fetch settings from the server
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await axios.get('/api/settings', { withCredentials: true });
        if (response.data.success) {
          setSettings({
            minWithdrawal: response.data.settings.minWithdrawal,
            withdrawalFee: response.data.settings.withdrawalFee
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-6">Withdraw USDT</h1>
          
          <p className="text-sm my-3 text-white">
            The withdrawal process can take up to 4 hours to complete.
          </p>

          <div className="space-y-6">
            <div>
              <label className="text-gray-400 block mb-2">Amount (USDT)</label>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg"
              />
              <p className="text-sm text-gray-400 mt-1">
                {isLoadingSettings ? (
                  <span>Loading settings...</span>
                ) : (
                  <>
                    Minimum withdrawal: ${settings.minWithdrawal} USDT <br/>
                    Withdrawal fee: ${settings.withdrawalFee} USDT <br/>
                    Available balance: ${parseFloat(userData?.balance || 0).toFixed(2)} USDT
                  </>
                )}
              </p>
            </div>

            <div>
              <label className="text-gray-400 block mb-4">Select Withdrawal Method</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(WITHDRAWAL_METHODS).map(([key, method]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMethod(key)}
                    className={`flex items-center justify-center gap-2 p-4 rounded-lg 
                      ${selectedMethod === key ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'} 
                      transition-colors`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className="text-white">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedMethod && (
              <div>
                <label className="text-gray-400 block mb-2">
                  {selectedMethod === 'BINANCE' ? 'Binance ID' : 'Wallet Address'}
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={WITHDRAWAL_METHODS[selectedMethod].placeholder}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Make sure to enter the correct {selectedMethod === 'BINANCE' ? 'Binance ID' : 'wallet address'} for USDT. 
                  Incorrect information may result in permanent loss of funds.
                </p>
              </div>
            )}

            <div className="bg-amber-500/20 text-amber-400 border border-amber-500/30 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Important:</strong> All withdrawals are processed in USDT only. Please ensure you&apos;re using the correct network for your withdrawal.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !amount || !selectedMethod || !walletAddress}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg
                disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
            >
              {isLoading ? 'Processing...' : 'Submit Withdrawal'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Withdraw; 