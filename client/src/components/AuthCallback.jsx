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
      // Check for error first
      const error = checkAuthError();
      if (error) {
        toast.error(error === 'google_auth_failed' 
          ? 'Google authentication failed. Please try again.' 
          : `Authentication error: ${error}`);
        navigate('/login');
        return;
      }
      
      // Handle token extraction
      const tokenExtracted = handleAuthCallback();
      
      if (tokenExtracted) {
        // Re-verify authentication status now that we have a token
        try {
          await checkAuth();
          // Navigate based on the pathname
          if (location.pathname.includes('complete-profile')) {
            // Stay on the complete profile page
            console.log('Completing profile...');
          } else {
            // For other paths (like dashboard), refresh the page to apply the auth state
            window.location.reload();
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          toast.error('Authentication verification failed. Please try again.');
          navigate('/login');
        }
      }
    };
    
    processCallback();
  }, [location.pathname, navigate, checkAuth]);
  
  // This component doesn't render anything visible
  return null;
}

export default AuthCallback; 