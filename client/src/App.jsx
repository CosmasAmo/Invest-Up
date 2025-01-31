/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './pages/home'
import Login from './pages/login'
import ResetPassword from './pages/resetPassword'
import EmailVerify from './pages/emailVerify'
import { ToastContainer } from 'react-toastify'
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
import Messages from './pages/Messages'



function App() {
  const { checkAuth, isAdmin, initialize } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<FAQs />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/deposit" element={<PrivateRoute><Deposit /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/invest" element={
          <PrivateRoute>
            <Invest />
          </PrivateRoute>
        } />
        <Route path="/investments" element={
          <PrivateRoute>
            <Investments />
          </PrivateRoute>
        } />
        <Route path="/deposits" element={
          <PrivateRoute>
            <Deposits />
          </PrivateRoute>
        } />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/withdrawals" element={<Withdrawals />} />
      </Routes>
    </div>
  )
}

export default App