import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import useStore from '../store/useStore';
import Footer from '../components/footer';

function Withdrawals() {
    const { fetchWithdrawals, withdrawals } = useStore();

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
            <Navbar />
            
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdrawals History</h1>
                    <Link 
                        to="/withdraw"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto text-center"
                    >
                        New Withdrawal
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-xl overflow-hidden"
                >
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full text-left text-gray-300">
                            <thead className="text-gray-400 text-xs sm:text-sm bg-gray-700/50">
                                <tr>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4">ID</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4">Amount</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Method</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Wallet</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4">Status</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {withdrawals.length > 0 ? (
                                    withdrawals.map((withdrawal) => (
                                        <tr key={withdrawal.id} className="hover:bg-gray-700/30">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm whitespace-nowrap">
                                                {withdrawal.transactionId?.substring(0, 8) || 'N/A'}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                ${parseFloat(withdrawal.amount).toFixed(2)}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell whitespace-nowrap">
                                                {withdrawal.paymentMethod}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs hidden md:table-cell whitespace-nowrap">
                                                {withdrawal.walletAddress?.substring(0, 10) + '...' || 'N/A'}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs
                                                    ${withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                                    'bg-red-500/20 text-red-500'}`}
                                                >
                                                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden sm:table-cell whitespace-nowrap">
                                                {new Date(withdrawal.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                                            No withdrawals found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}

export default Withdrawals; 