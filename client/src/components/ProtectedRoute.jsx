import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import PropTypes from 'prop-types';

export function PrivateRoute({ children }) {
  const { isAuthenticated, isVerified, userData } = useStore();
  
  // Also check if user was verified through Google OAuth
  const isGoogleVerified = localStorage.getItem('is_verified') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Skip email verification check if Google verified
  if (!isVerified && !isGoogleVerified && userData && !userData.isAccountVerified) {
    return <Navigate to="/email-verify" />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, userData, isLoading } = useStore();
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';
  const isEmailVerifyPage = location.pathname === '/email-verify';
  
  // Show loading state if still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Special case for email verification - allow access even if authenticated
  if (isEmailVerifyPage && isAuthenticated && userData && !userData.isAccountVerified) {
    return children;
  }

  // For register page, always allow access if user has a temporary token
  if (isRegisterPage) {
    // If user is authenticated with a full account (not temporary), redirect to dashboard
    if (isAuthenticated && userData && !userData.isTempUser && userData.isAccountVerified) {
      if (userData.isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
    
    // Otherwise, show the register page
    return children;
  }

  // For other public routes (like login), redirect to dashboard if authenticated
  if (isAuthenticated && userData && !userData.isTempUser) {
    if (userData.isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Add PropTypes validation
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired
};