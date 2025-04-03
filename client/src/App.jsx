/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/home'
import Login from './pages/login'
import ResetPassword from './pages/resetPassword'
import EmailVerify from './pages/emailVerify'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import About from './pages/about'
import Contact from './pages/contact'
import FAQs from './pages/faqs'
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute'
import Dashboard from './pages/dashboard'
import Profile from './pages/profile'
import Deposit from './pages/deposit'
import useStore from './store/useStore'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminSettings from './pages/admin/Settings'
import AdminRoute from './components/AdminRoute'
import Invest from './pages/invest'
import Investments from './pages/Investments'
import Deposits from './pages/Deposits'
import Withdraw from './pages/withdraw'
import Withdrawals from './pages/withdrawals'
import Transactions from './pages/transactions'
import Terms from './pages/terms'
import MakeMoneyOnline from './pages/make-money-online'
import ApiDebug from './components/ApiDebug'
import CompleteGoogleProfile from './pages/CompleteGoogleProfile'
import AuthCallback from './components/AuthCallback'
import Messages from './pages/messages'

function App() {
  const { initialize, fetchServerConfig, checkSessionExpiration, error } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // First fetch server configuration
    fetchServerConfig().then(() => {
      // Check for session expiration next
      const isExpired = checkSessionExpiration();
      if (isExpired) {
        toast.info('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        // Initialize the store
        initialize();
      }
    });
  }, [initialize, fetchServerConfig, checkSessionExpiration, navigate]);

  // Show error toast if there's an error in the store
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Check for token in URL (for OAuth callbacks)
  const hasToken = new URLSearchParams(location.search).has('token');

  return (
    <div className="app-container bg-slate-900 text-white min-h-screen">
      <ToastContainer theme="dark" />
      {/* Render AuthCallback if we have a token in the URL */}
      {hasToken && <AuthCallback />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/email-verify" element={<PublicRoute><EmailVerify /></PublicRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/make-money-online" element={<MakeMoneyOnline />} />
        <Route path="/complete-profile" element={<CompleteGoogleProfile />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/deposit" element={<PrivateRoute><Deposit /></PrivateRoute>} />
        <Route path="/invest" element={<PrivateRoute><Invest /></PrivateRoute>} />
        <Route path="/investments" element={<PrivateRoute><Investments /></PrivateRoute>} />
        <Route path="/deposits" element={<PrivateRoute><Deposits /></PrivateRoute>} />
        <Route path="/withdraw" element={<PrivateRoute><Withdraw /></PrivateRoute>} />
        <Route path="/withdrawals" element={<PrivateRoute><Withdrawals /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
      </Routes>
      
      {/* Add the API Debug component */}
      <ApiDebug />
    </div>
  )
}

export default App