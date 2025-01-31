import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';

function Withdrawals() {
    const { fetchWithdrawals, withdrawals, isLoading } = useStore();

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Withdrawals History</h1>
                    <Link 
                        to="/withdraw"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        New Withdrawal
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 text-sm bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Wallet Address</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {withdrawals.map((withdrawal) => (
                                    <tr key={withdrawal.id} className="hover:bg-gray-700/30">
                                        <td className="px-6 py-4 font-mono text-sm">
                                            {withdrawal.transactionId}
                                        </td>
                                        <td className="px-6 py-4">
                                            ${parseFloat(withdrawal.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">{withdrawal.paymentMethod}</td>
                                        <td className="px-6 py-4 font-mono text-sm">
                                            {withdrawal.walletAddress}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs
                                                ${withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                                'bg-red-500/20 text-red-500'}`}
                                            >
                                                {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Withdrawals; 