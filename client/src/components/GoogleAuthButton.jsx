import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

function GoogleAuthButton({ type = 'login' }) {
  const navigate = useNavigate();
  
  const handleGoogleAuth = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
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

export default GoogleAuthButton; 