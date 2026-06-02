/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/home'
import Login from './pages/login'
import ResetPassword from './pages/PasswordReset'
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
import CompleteGoogleProfile from './pages/CompleteGoogleProfile'
import AuthCallback from './components/AuthCallback'
import Messages from './pages/messages'
import TestApiConnection from './pages/TestApiConnection'

function App() {
  const { initialize, fetchServerConfig, fetchSettings, checkSessionExpiration, error } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Run only once on mount — do NOT include location in deps or initialize will
  // re-run on every navigation (e.g. after login) and set isLoading=true again.
  useEffect(() => {
    // Check if we have a clean parameter that indicates a fresh login after logout
    const urlParams = new URLSearchParams(window.location.search);
    const isCleanLogin = urlParams.has('clean');
    
    if (isCleanLogin) {
      // Ensure all possible stored state is cleared
      localStorage.removeItem('user-store');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('is_admin');
      
      // Clear all Google verification flags
      localStorage.removeItem('is_google_user');
      localStorage.removeItem('is_verified');
      localStorage.removeItem('email_verified');
      localStorage.removeItem('bypass_email_verification');
      
      // Clear all verification flags from sessionStorage too
      sessionStorage.removeItem('auth-storage');
      sessionStorage.removeItem('is_google_user');
      sessionStorage.removeItem('is_verified');
      sessionStorage.removeItem('email_verified');
      sessionStorage.removeItem('bypass_email_verification');
      
      // Remove the clean parameter to prevent reapplying this on page refresh
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('clean');
      window.history.replaceState({}, '', newUrl);
    }
    
    // First fetch server configuration
    fetchServerConfig().then(() => {
      // Also fetch settings
      fetchSettings().then(() => {
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
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  // Show error toast if there's an error in the store
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Check for auth-related parameters in URL (for OAuth callbacks)
  const urlParams = new URLSearchParams(location.search);
  const hasToken = urlParams.has('token');
  const hasError = urlParams.has('error');
  const isOnCompleteProfilePage = location.pathname === '/complete-profile';
  
  // Only consider it an auth callback if we're not already on the complete-profile page
  // or if we're on a different page that needs the callback processing
  const isAuthCallback = (hasToken || hasError || 
                         (location.pathname.includes('/complete-profile') && 
                          urlParams.has('googleId') && urlParams.has('email')));
  
  console.log('URL check for auth callback:', { hasToken, hasError, isAuthCallback, pathname: location.pathname });

  return (
    <div className="app-container bg-slate-900 text-white min-h-screen w-full">
      <ToastContainer theme="dark" />
      {/* Render AuthCallback if we have a token in the URL but only if we need to redirect */}
      {isAuthCallback && !isOnCompleteProfilePage && <AuthCallback />}
      
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
        <Route path="/complete-profile" element={<PublicRoute><CompleteGoogleProfile /></PublicRoute>} />
        <Route path="/api-test" element={<TestApiConnection />} />
        
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
        <Route path="/admin/api-test" element={<AdminRoute><TestApiConnection /></AdminRoute>} />
      </Routes>
    
    </div>
  )
}

export default App