import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleAuthCallback, checkAuthError } from '../utils/authUtils';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';

/**
 * Component to handle authentication callbacks
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
      
      // Check for error first
      const error = checkAuthError();
      if (error) {
        console.error('Auth error detected:', error);
        toast.error(`Authentication error: ${error}`);
        navigate('/login');
        return;
      }

      // Handle token extraction
      const tokenExtracted = handleAuthCallback();
      console.log('Token extracted result:', tokenExtracted);
      
      // Ensure we have a fresh state by checking auth status
      if (tokenExtracted) {
        try {
          // Force a fresh authentication check
          await checkAuth(true);
          
          // Navigate to dashboard
          navigate(`/dashboard?t=${new Date().getTime()}`);
        } catch (error) {
          console.error('Error during auth check:', error);
          toast.error('Error while processing authentication. Please try again.');
          navigate('/login');
        }
      } else {
        // No token extracted, go to login
        navigate('/login');
      }
    };
    
    processCallback();
  }, [navigate, checkAuth, location]);
  
  return null; // No UI needed
}

export default AuthCallback;