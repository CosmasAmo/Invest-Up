import { useState} from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';

const PAYMENT_METHODS = {
  BTC: {
    name: 'Bitcoin',
    icon: '₿',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    minimumDeposit: 100
  },
  ETH: {
    name: 'Ethereum',
    icon: 'Ξ',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    minimumDeposit: 100
  },
  USDT: {
    name: 'USDT TRC20',
    icon: '₮',
    address: 'TWd2yzk3xPBRYwKcaXxMQjBukVeGK7EZ8E',
    minimumDeposit: 100
  }
};

function Deposit() {
  const { submitDeposit, isLoading } = useStore();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState(1);
  const [proofFile, setProofFile] = useState(null);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (parseFloat(value) < 100) {
        toast.error('Minimum deposit amount is $100');
        return;
      }
      setAmount(value);
    }
  };

  const handleMethodSelect = (method) => {
    if (parseFloat(amount) < 100) {
      toast.error('Please enter an amount of $100 or more');
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

  const copyToClipboard = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard!');
    } catch {
      // If clipboard API fails, create a temporary input element
      const tempInput = document.createElement('input');
      tempInput.value = address;
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        await navigator.clipboard.writeText(address);
        toast.success('Address copied to clipboard!');
      } catch {
        toast.error('Failed to copy address');
      }
      document.body.removeChild(tempInput);
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
          <h1 className="text-3xl font-bold text-white mb-6">Deposit Funds</h1>
          
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="text-gray-400 block mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  required
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg"
                />
                <p className="text-sm text-gray-400 mt-1">Minimum deposit: $100</p>
              </div>

              <div>
                <label className="text-gray-400 block mb-4">Select Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
                    <button
                      key={key}
                      onClick={() => handleMethodSelect(key)}
                      className="flex items-center justify-center gap-2 p-4 rounded-lg bg-slate-700 
                        hover:bg-slate-600 transition-colors"
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-white">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-700 p-6 rounded-lg">
                <h3 className="text-xl text-white mb-4">Payment Details</h3>
                <p className="text-gray-400 mb-2">Amount: ${amount}</p>
                <p className="text-gray-400 mb-4">Method: {PAYMENT_METHODS[selectedMethod].name}</p>
                
                <div className="bg-slate-600 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-300 mb-2">Send payment to:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={PAYMENT_METHODS[selectedMethod].address}
                      readOnly
                      className="bg-transparent text-white flex-1 outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(PAYMENT_METHODS[selectedMethod].address)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                    >
                      Copy
                    </button>
                  </div>
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

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !proofFile}
                      className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg
                        disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Submitting...' : 'Submit Deposit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Deposit; 