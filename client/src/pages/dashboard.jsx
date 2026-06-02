import { useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/navbar'
import ReferralLink from '../components/ReferralLink'
import { toast } from 'react-toastify'
import Footer from '../components/footer'
import axios from 'axios'
import { FaChartLine, FaWallet, FaMoneyBillWave, FaExchangeAlt, FaChartBar, FaHistory } from 'react-icons/fa'

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, stats, fetchDashboardData, checkAuth } = useStore();

  // Memoize the data loading function
  const loadData = useCallback(async () => {
    console.log('Loading fresh dashboard data');
    try {
      await fetchDashboardData();
      // Ensure transactions are loaded
      await useStore.getState().fetchTransactions();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    // Check for token in URL (from Google OAuth redirect)
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    
    if (token) {
      try {
        console.log('Found token in URL with length:', token.length);
        
        // Save token to localStorage
        localStorage.setItem('auth_token', token);
        console.log('Token saved to localStorage');
        
        // Check if token was actually saved
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken === token) {
          console.log('Token verification successful, correctly saved to localStorage');
        } else {
          console.error('Token saved but verification failed! Expected vs Actual:', 
            token.substring(0, 5) + '...', '!=', 
            savedToken ? savedToken.substring(0, 5) + '...' : 'null');
        }
        
        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set with Bearer token');
        
        // Remove token from URL without refreshing page
        navigate('/dashboard', { replace: true });
        
        // Verify authentication with the new token
        console.log('Calling checkAuth() with new token');
        checkAuth().then(success => {
          if (success) {
            toast.success('Successfully logged in with Google!');
          } else {
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
          }
        });
      } catch (err) {
        console.error('Error handling token from URL:', err);
        toast.error('Error processing authentication. Please try logging in again.');
      }
    } else {
      console.log('No token found in URL, regular dashboard load');
    }
    
    // Initial data load
    loadData();
    
    // Set up data refresh interval every 240 seconds
    const refreshInterval = setInterval(loadData, 240000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [location.search, navigate, checkAuth, loadData]);

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
      value: `$${parseFloat(stats?.balance || 0).toFixed(2)}`, 
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
      title: 'Total Amount on active Investments', 
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
      title: 'Total Profit on active Investments', 
      value: `$${parseFloat(stats?.totalProfit || 0).toFixed(2)}`, 
      icon: <FaChartLine className="text-emerald-400 w-6 h-6" />,
      color: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      <Navbar />
      
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 pb-20">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <Link
            to="/deposit"
            className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 border border-blue-700 shadow-lg hover:bg-blue-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Deposit Funds</h3>
                <p className="text-blue-100 text-sm mt-1">Add money to your account</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FaMoneyBillWave className="text-white w-6 h-6" />
              </div>
            </div>
          </Link>

          <Link
            to="/invest"
            className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 border border-purple-700 shadow-lg hover:bg-purple-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Invest</h3>
                <p className="text-purple-100 text-sm mt-1">Start earning profits</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FaChartBar className="text-white w-6 h-6" />
              </div>
            </div>
          </Link>

          <Link
            to="/withdraw"
            className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-2xl p-6 border border-orange-700 shadow-lg hover:bg-orange-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Withdraw</h3>
                <p className="text-orange-100 text-sm mt-1">Get your earnings</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FaExchangeAlt className="text-white w-6 h-6" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 border ${stat.borderColor} shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-white text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-full">
                  {stat.icon}
                </div>
              </div>
              {stat.link && (
                <Link
                  to={stat.link}
                  className="mt-4 inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  View Details
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Referral Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className='mb-2'>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Referral Program</h2>
              <p className="text-gray-400">
                Invite friends and earn rewards! Share your unique referral link below.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <ReferralLink />
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FaHistory className="mr-2" /> Recent Transactions
            </h2>
            <Link to="/transactions" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
              View All
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="p-4 overflow-x-auto">
            {userData?.recentTransactions && userData.recentTransactions.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {userData.recentTransactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs 
                          ${transaction.type === 'deposit' 
                              ? 'bg-blue-500/20 text-blue-500'
                              : transaction.type === 'investment'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-purple-500/20 text-purple-500'
                          }`}
                        >
                          {transaction.type ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">${parseFloat(transaction.amount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs 
                          ${transaction.status === 'pending' 
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : transaction.status === 'approved'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {transaction.type === 'investment' && transaction.status === '' 
                            ? 'Stopped'
                            : transaction.status 
                              ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) 
                              : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No recent transactions found.</p>
                <Link to="/deposits" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                  Make your first deposit
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  )
}

export default Dashboard 