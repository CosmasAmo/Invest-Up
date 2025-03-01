import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/navbar'
import ReferralLink from '../components/ReferralLink'
import { toast } from 'react-toastify'
import Footer from '../components/footer'
function Dashboard() {
  const navigate = useNavigate();
  const { userData, stats, fetchDashboardData, isVerified, fetchDeposits } = useStore()

  useEffect(() => {
    if (!isVerified) {
      navigate('/email-verify');
      toast.info('Please verify your email first');
      return;
    }
    
    fetchDashboardData();
    fetchDeposits();
  }, [fetchDashboardData, fetchDeposits, isVerified, navigate])

  if (!userData || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const statsData = [
    { 
      title: 'Account Balance', 
      value: `$${parseFloat(userData?.balance || 0).toFixed(2)}`, 
      icon: '💰' 
    },
    { 
      title: 'Total Deposits', 
      value: `$${parseFloat(stats?.totalDeposits || 0).toFixed(2)}`, 
      icon: '💵',
      link: '/deposits'
    },
    { 
      title: 'Total Investments', 
      value: `$${parseFloat(stats?.totalInvestments || 0).toFixed(2)}`, 
      icon: '📊',
      link: '/investments'
    },
    { 
      title: 'Total Withdrawals', 
      value: `$${parseFloat(stats?.totalWithdrawals || 0).toFixed(2)}`, 
      icon: '💳',
      link: '/withdrawals'
    },
    { 
      title: 'Total Profit', 
      value: `$${parseFloat(stats?.totalProfit || 0).toFixed(2)}`, 
      icon: '📈' 
    }
  ]

  const actions = [
    { title: 'Deposit', icon: '💳', path: '/deposit' },
    { title: 'Invest Now', icon: '📊', path: '/invest' },
    { title: 'Withdraw', icon: '🏦', path: '/withdraw' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {userData?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-400">
            Here&apos;s what&apos;s happening with your investments today.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.path}
              className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700 
                transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{action.icon}</span>
                <span className="text-white font-medium">{action.title}</span>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {statsData.map((stat, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-200">{stat.title}</h3>
                        <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <p className="text-2xl font-semibold text-white mb-2">
                        {stat.value}
                    </p>
                    {stat.link && (
                        <Link 
                            to={stat.link}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            View Details →
                        </Link>
                    )}
                </div>
            ))}
        </div>

        {/* Refer and Earn */}
        <ReferralLink />

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 rounded-2xl py-8 mb-8 mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 px-8">Recent Transactions</h2>
          {userData?.recentTransactions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead className="text-gray-400 text-sm">
                  <tr>
                    <th className="px-8 pb-3">Type</th>
                    <th className="px-4 pb-3">Amount</th>
                    <th className="px-4 pb-3">Method</th>
                    <th className="px-4 pb-3">Status</th>
                    <th className="px-4 pb-3">Date</th>
                    <th className="px-4 pb-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-gray-700">
                      <td className="px-8 py-3 capitalize">{transaction.type}</td>
                      <td className="px-4 py-3">
                        ${parseFloat(transaction.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{transaction.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'approved' 
                            ? 'bg-green-500/20 text-green-500'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {transaction.type === 'deposit' && transaction.proofImage ? (
                          <a 
                            href={`http://localhost:5000/uploads/${transaction.proofImage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            View Proof
                          </a>
                        ) : transaction.type === 'investment' ? (
                          <span className="text-gray-400">
                            {transaction.dailyProfitRate}% Daily
                          </span>
                        ) : transaction.type === 'withdrawal' ? (
                          <span className="text-gray-400" title={transaction.walletAddress}>
                            {transaction.walletAddress ? 
                              `${transaction.walletAddress.substring(0, 10)}...` : 
                              'N/A'}
                          </span>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-4">
              No recent transactions
            </div>
          )}
        </motion.div>

      </div>
      <Footer />
    </div>
  )
}

export default Dashboard 