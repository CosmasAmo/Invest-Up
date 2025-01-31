import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';

function Invest() {
  const navigate = useNavigate();
  const { submitInvestment, isLoading, userData } = useStore();
  const [amount, setAmount] = useState('');

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < 1000) {
      toast.error('Minimum investment amount is $1,000');
      return;
    }

    if (parseFloat(amount) > parseFloat(userData.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    const success = await submitInvestment({ amount });
    if (success) {
      toast.success('Investment request submitted successfully. Awaiting admin approval.');
      setAmount('');
      navigate('/investments');
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
          <h1 className="text-3xl font-bold text-white mb-6">Create Investment</h1>
          
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
                Minimum investment: $1,000 <br/>
                Available balance: ${parseFloat(userData?.balance || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Investment Details</h3>
              <p className="text-gray-400">Daily Profit: 6%</p>
              {amount && parseFloat(amount) >= 1000 && (
                <p className="text-gray-400">
                  Daily Return: ${(parseFloat(amount) * 0.06).toFixed(2)}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !amount || parseFloat(amount) < 1000}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg
                disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
            >
              {isLoading ? 'Processing...' : 'Create Investment'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Invest; 