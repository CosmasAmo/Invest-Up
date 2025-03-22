import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/navbar'
import ReferralLink from '../components/ReferralLink'
import { toast } from 'react-toastify'
import Footer from '../components/footer'
import axios from 'axios'
import { FaChartLine, FaWallet, FaMoneyBillWave, FaExchangeAlt, FaChartBar } from 'react-icons/fa'

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, stats, fetchDashboardData, isVerified, fetchDeposits, checkAuth } = useStore();

  useEffect(() => {
    // Check for token in URL (from Google OAuth redirect)
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    
    if (token) {
      console.log('Found token in URL:', token.substring(0, 10) + '...');
      
      // Save token to localStorage
      localStorage.setItem('auth_token', token);
      console.log('Saved token to localStorage');
      
      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Set Authorization header with token');
      
      // Remove token from URL without refreshing page
      navigate('/dashboard', { replace: true });
      
      // Verify authentication with the new token
      console.log('Calling checkAuth() with new token');
      checkAuth();
      
      toast.success('Successfully logged in with Google!');
    } else {
      console.log('No token in URL, checking auth status');
    }
    
    if (!isVerified) {
      navigate('/email-verify');
      toast.info('Please verify your email first');
      return;
    }
    
    fetchDashboardData();
    fetchDeposits();
  }, [fetchDashboardData, fetchDeposits, isVerified, navigate, location.search, checkAuth]);

  if (!userData || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-lg">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  const statsData = [
    { 
      title: 'Account Balance', 
      value: `$${parseFloat(userData?.balance || 0).toFixed(2)}`, 
      icon: <FaWallet className="text-blue-400 w-6 h-6" />,
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/50'
    },
    { 
      title: 'Total Deposits', 
      value: `$${parseFloat(stats?.totalDeposits || 0).toFixed(2)}`, 
      icon: <FaMoneyBillWave className="text-green-400 w-6 h-6" />,
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/50',
      link: '/deposits'
    },
    { 
      title: 'Total Investments', 
      value: `$${parseFloat(stats?.totalInvestments || 0).toFixed(2)}`, 
      icon: <FaChartBar className="text-purple-400 w-6 h-6" />,
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/50',
      link: '/investments'
    },
    { 
      title: 'Total Withdrawals', 
      value: `$${parseFloat(stats?.totalWithdrawals || 0).toFixed(2)}`, 
      icon: <FaExchangeAlt className="text-amber-400 w-6 h-6" />,
      color: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/50',
      link: '/withdrawals'
    },
    { 
      title: 'Total Profit', 
      value: `$${parseFloat(stats?.totalProfit || 0).toFixed(2)}`, 
      icon: <FaChartLine className="text-emerald-400 w-6 h-6" />,
      color: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/50'
    }
  ]

  const actions = [
    { 
      title: 'Deposit', 
      icon: <FaMoneyBillWave className="w-5 h-5" />, 
      path: '/deposit',
      color: 'from-blue-600 to-blue-800',
      hoverColor: 'from-blue-500 to-blue-700'
    },
    { 
      title: 'Invest Now', 
      icon: <FaChartBar className="w-5 h-5" />, 
      path: '/invest',
      color: 'from-purple-600 to-purple-800',
      hoverColor: 'from-purple-500 to-purple-700'
    },
    { 
      title: 'Withdraw', 
      icon: <FaExchangeAlt className="w-5 h-5" />, 
      path: '/withdraw',
      color: 'from-amber-600 to-amber-800',
      hoverColor: 'from-amber-500 to-amber-700'
    }
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      <Navbar />
      
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800 to-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 border border-slate-700/50 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back, {userData?.name || 'User'}! 👋
              </h1>
              <p className="text-gray-400">
                Here&apos;s what&apos;s happening with your investments today.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/30">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-blue-400 font-medium">Account Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {actions.map((action) => (
            <motion.div key={action.title} variants={itemVariants}>
              <Link
                to={action.path}
                className={`bg-gradient-to-r ${action.color} hover:${action.hoverColor} rounded-xl p-5 
                  transition-all duration-300 shadow-lg hover:shadow-xl border border-white/10 flex items-center justify-between group`}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    {action.icon}
                  </div>
                  <span className="text-white font-medium">{action.title}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8"
        >
          {statsData.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <div className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm p-6 rounded-xl border ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-medium text-white">{stat.title}</h3>
                  {stat.icon}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  {stat.value}
                </p>
                {stat.link && (
                  <Link 
                    to={stat.link}
                    className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    View Details
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Refer and Earn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReferralLink />
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-slate-800 to-slate-800/80 backdrop-blur-sm rounded-2xl py-6 sm:py-8 mb-8 mt-8 w-full border border-slate-700/50 shadow-xl"
        >
          <div className="flex items-center justify-between px-6 mb-6">
            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
            <Link to="/transactions" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
              View All
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
          {userData?.recentTransactions?.length > 0 ? (
            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-700/50">
                    <thead className="bg-slate-700/30">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">Method</th>
                        <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">Date</th>
                        <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30 bg-slate-800/30">
                      {userData.recentTransactions.slice(0, 5).map((transaction, idx) => (
                        <tr key={transaction.id} className={`hover:bg-slate-700/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/50' : ''}`}>
                          <td className="px-6 py-4 capitalize whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                transaction.type === 'deposit' ? 'bg-green-500' :
                                transaction.type === 'withdrawal' ? 'bg-amber-500' :
                                transaction.type === 'investment' ? 'bg-purple-500' : 'bg-blue-500'
                              }`}></span>
                              {transaction.type}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap font-medium">
                            ${parseFloat(transaction.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 hidden sm:table-cell whitespace-nowrap text-gray-300">{transaction.paymentMethod}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'approved' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell whitespace-nowrap text-gray-300">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell whitespace-nowrap">
                            {transaction.type === 'deposit' && transaction.proofImage ? (
                              <a 
                                href={`${axios.defaults.baseURL}/uploads/${transaction.proofImage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                              >
                                View Proof
                                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : transaction.type === 'investment' ? (
                              <span className="text-purple-400 font-medium">
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
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg mb-2">No recent transactions</p>
              <p className="text-gray-500 max-w-md mx-auto">Start your investment journey by making your first deposit or investment.</p>
              <Link to="/deposit" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Make a Deposit
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </div>
          )}
        </motion.div>

      </div>
      <Footer />
    </div>
  )
}

export default Dashboard 