import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/navbar';
import DepositCard from '../components/DepositCard';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';

function Deposits() {
  const { deposits = [], fetchDeposits, isLoading, error } = useStore();

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Deposits History</h1>
          <div className="space-x-4">
            
            <Link 
              to="/deposit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              New Deposit
            </Link>
            
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Deposits
          </h1>
          <p className="text-gray-400">
            Track all your deposit activities here
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : deposits?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deposits.map((deposit) => (
              <DepositCard key={deposit.id} deposit={deposit} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            No deposits found. Make a deposit now!
          </div>
        )}
      </div>
    </div>
  );
}

export default Deposits; 