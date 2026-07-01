import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import PropTypes from 'prop-types';

export function PrivateRoute({ children }) {
  const { isAuthenticated, isVerified, userData, isLoading } = useStore();
  const location = useLocation();
  
  const urlParams = new URLSearchParams(location.search);
  const isEmailVerified = userData?.isEmailVerified;
  const isAccountVerified = userData?.isAccountVerified === true;
  const isVerifiedUser = isVerified === true || isAccountVerified || isEmailVerified === true;
  const shouldRequireVerification = Boolean(userData) && !isVerifiedUser && !userData.isTemporary;

  console.log('Verification status:', {
    isAuthenticated,
    isVerified,
    isEmailVerified,
    userDataAccountVerified: userData?.isAccountVerified,
    currentPath: location.pathname
  });

  // If ?token= is present the auth callback is processing a login response.
  // Hold as a spinner so we don't redirect to /login before the token is
  // extracted and isAuthenticated is set to true.
  const hasOAuthToken = urlParams.has('token');
  if (hasOAuthToken) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (shouldRequireVerification) {
    console.log('Redirecting to email verification...');
    return <Navigate to="/email-verify" />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, userData, isLoading } = useStore();
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';
  const isEmailVerifyPage = location.pathname === '/email-verify';
  const isResetPasswordPage = location.pathname === '/reset-password';
  const isCompleteProfilePage = location.pathname === '/complete-profile';
  
  const urlParams = new URLSearchParams(location.search);
  const hasToken = urlParams.has('token');

  // If a ?token= is present, the auth callback is processing a login response.
  // Show a spinner here so the login form doesn't flash before the redirect.
  if (hasToken && !isCompleteProfilePage && !isResetPasswordPage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (isCompleteProfilePage) {
    if (isAuthenticated && userData && !userData.isTemporary) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  // For other public routes and authenticated users with temporary accounts, check if they need to complete profile
  if (isAuthenticated && userData && userData.isTemporary === true) {
    if (isCompleteProfilePage) {
      console.log('User has temporary account and needs to complete profile');
      return children;
    } else {
      console.log('User has temporary account, redirecting to complete profile');
      return <Navigate to="/complete-profile" replace />;
    }
  }

  // Special case for email verification - allow access even if authenticated
  if (isEmailVerifyPage && isAuthenticated && userData && !userData.isAccountVerified) {
    return children;
  }
  
  // Special case for reset password - always allow access even if authenticated
  if (isResetPasswordPage) {
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

  // For other public routes (like login), redirect to dashboard if authenticated with complete profile
  if (isAuthenticated && userData && !userData.isTemporary) {
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