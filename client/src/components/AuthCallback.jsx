import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleAuthCallback, checkAuthError } from '../utils/authUtils';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';

/**
 * Component to handle authentication callbacks from OAuth providers
 * This should be rendered on routes that receive auth callbacks
 */
function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useStore();
  
  useEffect(() => {
    const processCallback = async () => {
      console.log('Processing authentication callback');
      console.log('Current URL:', window.location.href);
      
      // Clear any lingering Google cookies to prevent session confusion
      document.cookie.split(";").forEach(function(c) {
        if (c.includes('G_') || c.includes('goog') || c.includes('google')) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        }
      });
      
      // Check for error first
      const error = checkAuthError();
      if (error) {
        console.error('Auth error detected:', error);
        toast.error(error === 'google_auth_failed' 
          ? 'Google authentication failed. Please try again.' 
          : `Authentication error: ${error}`);
        navigate('/login');
        return;
      }

      // Check if we're already on the complete-profile page
      const isOnCompleteProfilePage = location.pathname === '/complete-profile';
      
      // Handle token extraction
      const tokenExtracted = handleAuthCallback();
      console.log('Token extracted result:', tokenExtracted);
      
      // If we're on the complete-profile page and have URL params for Google auth, stay on this page
      if (isOnCompleteProfilePage && location.search.includes('googleId=') && location.search.includes('email=')) {
        console.log('Already on profile completion page with valid parameters, staying here');
        return;
      }
      
      // Ensure we have a fresh state by checking auth status
      if (tokenExtracted) {
        try {
          // Force a fresh authentication check
          const authResult = await checkAuth(true);
          
          // Get user data from store state after auth check
          const userData = useStore.getState().userData;
          const isGoogleFlow = location.search.includes('googleId=') || 
                              localStorage.getItem('is_google_user') === 'true' ||
                              (userData && userData.googleId);
          
          // Check if this is a returning Google user (already has a complete profile)
          const hasCompleteProfile = userData && !userData.isTemporary;
          
          console.log('Auth check results:', { 
            authResult, 
            isGoogleFlow, 
            hasCompleteProfile,
            isTemporary: userData?.isTemporary,
            userData: userData ? `User ID: ${userData.id}, Email: ${userData.email}` : 'No user data'
          });
          
          if (isGoogleFlow) {
            if (hasCompleteProfile) {
              // Returning Google user with complete profile - go to dashboard
              console.log('Returning Google user detected, navigating to dashboard');
              navigate(`/dashboard?t=${new Date().getTime()}`);
            } else {
              // New Google user or incomplete profile - go to profile completion
              console.log('New Google user detected, redirecting to complete profile');
              navigate(`/complete-profile${location.search}`);
            }
          } else {
            // Not a Google auth flow, go to dashboard
            navigate(`/dashboard?t=${new Date().getTime()}`);
          }
        } catch (error) {
          console.error('Error during auth check:', error);
          toast.error('Error while processing authentication. Please try again.');
          navigate('/login');
        }
      } else {
        // If no token was extracted but no error either, redirect to profile completion if needed
        if (location.search.includes('googleId=') && location.search.includes('email=')) {
          console.log('Google registration flow detected, proceeding to profile completion');
          // Keep the URL as is since it contains needed parameters
          if (!isOnCompleteProfilePage) {
            navigate(`/complete-profile${location.search}`);
          }
        } else {
          // Otherwise go to login
          navigate('/login');
        }
      }
    };
    
    processCallback();
  }, [navigate, checkAuth, location]);
  
  return null; // No UI needed
}

export default AuthCallback; 