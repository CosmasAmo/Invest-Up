import { assets } from '../assets/assets';
import PropTypes from 'prop-types';

function GoogleAuthButton({ type = 'login' }) {
  // Get the correct API URL based on environment
  const getApiUrl = () => {
    if (import.meta.env.PROD) {
      return import.meta.env.VITE_BACKEND_URL || window.location.origin.replace(/:\d+$/, ':5000');
    }
    return 'http://localhost:5000';
  };

  const handleGoogleAuth = () => {
    window.location.href = `${getApiUrl()}/api/auth/google`;
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
      {type === 'login' ? 'Continue with Google' : 'Sign up with Google'}
    </button>
  );
}

// Add PropTypes validation
GoogleAuthButton.propTypes = {
  type: PropTypes.string
};

export default GoogleAuthButton; 