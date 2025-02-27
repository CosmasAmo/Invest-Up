import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';

const PAYMENT_METHODS = {
  BTC: {
    name: 'Bitcoin',
    icon: '₿',
    placeholder: 'Enter BTC wallet address'
  },
  ETH: {
    name: 'Ethereum',
    icon: 'Ξ',
    placeholder: 'Enter ETH wallet address'
  },
  USDT: {
    name: 'USDT TRC20',
    icon: '₮',
    placeholder: 'Enter USDT TRC20 address'
  }
};

function Withdraw() {
  const { requestWithdrawal, isLoading, userData } = useStore();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < 3) {
      toast.error('Minimum withdrawal amount is $3');
      return;
    }

    if (parseFloat(amount) > parseFloat(userData.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    if (!selectedMethod) {
      toast.error('Please select a payment method');
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
          <h1 className="text-3xl font-bold text-white mb-6">Withdraw Funds</h1>
          
          <p className="text-sm my-3 text-white">
            The withdrawal process can take up to 4 hours to complete.
          </p>

          <div className="space-y-6">
            <div>
              <label className="text-gray-400 block mb-2">Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg"
              />
              <p className="text-sm text-gray-400 mt-1">
                Minimum withdrawal: $3 <br/>
                Withdrawal fee: $2 <br/>
                Available balance: ${parseFloat(userData?.balance || 0).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="text-gray-400 block mb-4">Select Payment Method</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
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
                <label className="text-gray-400 block mb-2">Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={PAYMENT_METHODS[selectedMethod].placeholder}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg"
                />
              </div>
            )}

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