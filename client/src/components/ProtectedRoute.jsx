import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import PropTypes from 'prop-types';

export function PrivateRoute({ children }) {
  const { isAuthenticated, isVerified, userData, isLoading } = useStore();
  const location = useLocation();
  
  // Check various ways a user might be verified
  const isGoogleVerified = localStorage.getItem('is_verified') === 'true';
  
  // Check URL parameters for Google auth flow
  const urlParams = new URLSearchParams(location.search);
  const hasGoogleParams = urlParams.has('googleId') && urlParams.has('email');
  const isCompletingGoogleProfile = location.pathname === '/complete-profile' && hasGoogleParams;
  
  // Enhanced Google user detection - check for Google users during profile completion flow
  const isGoogleUser = userData?.googleId || 
                      localStorage.getItem('is_google_user') === 'true' || 
                      sessionStorage.getItem('is_google_user') === 'true' ||
                      isCompletingGoogleProfile || // Also consider users currently completing Google profile
                      hasGoogleParams;
  
  const isEmailVerified = userData?.isEmailVerified;
  
  // Check for mismatched verification - this happens when a user previously logged in with Google
  // but is now trying to use a different account without verifying email
  const hasMismatchedVerification = 
    // User doesn't have Google ID in their profile
    !userData?.googleId && 
    // But still has Google verification flags set
    (localStorage.getItem('is_verified') === 'true' || 
     localStorage.getItem('is_google_user') === 'true') &&
    // And their account is not actually verified according to backend
    userData?.isAccountVerified !== true;
  
  // If we detect mismatched verification, clear the incorrect flags
  if (hasMismatchedVerification) {
    console.log('Detected mismatched verification flags, clearing them');
    localStorage.removeItem('is_verified');
    localStorage.removeItem('is_google_user');
    localStorage.removeItem('email_verified');
    localStorage.removeItem('bypass_email_verification');
    sessionStorage.removeItem('is_verified');
    sessionStorage.removeItem('is_google_user');
    sessionStorage.removeItem('email_verified');
    sessionStorage.removeItem('bypass_email_verification');
  }
  
  // Log the verification status for debugging
  console.log('Verification status:', {
    isAuthenticated,
    isVerified,
    isGoogleUser,
    isGoogleVerified,
    isEmailVerified,
    userDataAccountVerified: userData?.isAccountVerified,
    hasGoogleParams,
    isCompletingGoogleProfile,
    hasMismatchedVerification,
    currentPath: location.pathname
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Enhanced check for Google users to skip email verification
  // Skip email verification for Google users or if they're in the process of completing Google profile
  // But don't skip if we detected mismatched verification
  if ((!isVerified && !isGoogleUser && !isGoogleVerified && !isEmailVerified && 
      userData && !userData.isAccountVerified && !isCompletingGoogleProfile) || 
      hasMismatchedVerification) {
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
  
  // Check if this is the Google profile completion page by checking the URL parameters
  const urlParams = new URLSearchParams(location.search);
  const hasGoogleParams = urlParams.has('googleId') && urlParams.has('email');
  const hasToken = urlParams.has('token');
  const isGoogleAuthFlow = hasGoogleParams || hasToken;
  
  // Special case for complete-profile - always allow access if it's Google authentication flow
  // If the user is already authenticated and not temporary, redirect to dashboard
  if (isCompleteProfilePage) {
    if (isGoogleAuthFlow) {
      // Check if the user already has a complete profile
      if (isAuthenticated && userData && !userData.isTemporary) {
        console.log('Google user already has complete profile, redirecting to dashboard');
        // User already has a complete profile, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
      }
      console.log('Google auth flow detected, allowing access to complete profile');
      return children;
    }
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