import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import AuthLayout from '../components/AuthLayout';

function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clear any previous error messages
    toast.dismiss(); // Dismiss any existing error toasts
    
    // Clear any previous errors in the store
    if (clearError) clearError();
    
    try {
      const userData = await login(formData);
      if (userData) {
        if (userData.isAdmin === true) {
          navigate('/admin', { replace: true });
          toast.success('Admin login successful!');
        } else {
          navigate('/dashboard', { replace: true });
          toast.success('Login successful!');
        }
      }
    } catch (err) {
      // Display the error message from the store
      if (error) {
        toast.error(error, {
          toastId: 'login-error', // Use a consistent ID to prevent duplicates
          position: 'top-center',
          autoClose: 5000
        });
      }
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonDisabled = isSubmitting || isLoading;

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account"
      isRegister={false}
    >
      {buttonDisabled ? (
        <div className="flex justify-center my-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-5 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-4 w-4 text-gray-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-slate-700 block w-full pl-10 pr-3 py-2.5 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Email Address"
              />
            </div>
          </div>

          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="bg-slate-700 block w-full pl-10 pr-10 py-2.5 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Password"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 hover:text-white focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-xs">
              <Link to="/reset-password" className="font-medium text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 text-sm font-medium"
            >
              Sign In
            </button>
          </div>
        </motion.form>
      )}

      <motion.div 
        className="mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-slate-800 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-4">
          <GoogleAuthButton type="login" />
        </div>
      </motion.div>
    </AuthLayout>
  );
}

export default Login;