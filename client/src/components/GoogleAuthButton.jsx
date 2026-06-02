import { assets } from '../assets/assets';
import PropTypes from 'prop-types';

function GoogleAuthButton({ type = 'login' }) {
  // Get the correct API URL based on environment variables
  const getApiUrl = () => {
    // Use the environment variable VITE_API_URL
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // Fallback for production
    if (import.meta.env.PROD) {
      return 'https://backend.investuptrading.com';
    }
    
    // Fallback for development
    return 'http://localhost:5000';
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    
    // Use the correct API URL for Google authentication
    // Add the current client URL as a parameter so the server knows where to redirect back to
    const clientUrl = encodeURIComponent(window.location.origin);
    
    // Generate a random state parameter to prevent caching issues
    const state = Math.random().toString(36).substring(2, 15);
    
    // Add timestamp to force fresh authentication
    const timestamp = new Date().getTime();
    
    // First, clear ALL Google authentication cookies thoroughly
    document.cookie.split(";").forEach(function(c) {
      // Target all possible Google auth cookies
      if (c.includes('G_') || c.includes('goog') || c.includes('google') || c.includes('SID') || c.includes('HSID')) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        // Also try with domain path
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=.google.com");
      }
    });
    
    // Add a specific prompt parameter to force account selection
    const url = `${getApiUrl()}/api/auth/google?client_url=${clientUrl}&auth_type=${type}&state=${state}&t=${timestamp}&prompt=select_account`;
    console.log('Redirecting to Google OAuth:', url);
    
    // Open in the same window to ensure cookies are properly set
    window.location.href = url;
  };

  return (
    <button
      onClick={handleGoogleAuth}
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 
        border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <img 
        src={assets.googleLogo} 
        alt="Google" 
        className="w-5 h-5" 
      />
      {type === 'login' ? 'Login with Google' : 'Sign up with Google'}
    </button>
  );
}

// Add PropTypes validation
GoogleAuthButton.propTypes = {
  type: PropTypes.string
};

export default GoogleAuthButton; 