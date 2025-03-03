import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaUserFriends, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const referralCode = queryParams.get('ref');
  const { register, isAuthenticated, error, isLoading } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referredBy: referralCode || ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isLoading && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [isLoading, isSubmitting]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Registering user...');
      const success = await register(formData);
      
      if (success) {
        toast.success('Registration successful! Please verify your email.');
        navigate('/email-verify');
      } else {
        toast.error(error || 'Registration failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const buttonDisabled = isSubmitting || isLoading;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 sm:pt-0'>
      <Link 
        to="/"
        className="absolute left-5 top-5 sm:top-5 flex items-center text-white hover:text-blue-300 transition-colors"
      >
        <FaArrowLeft className="mr-2" />
        <span>Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800 shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-6">
            <h2 className="text-center text-3xl font-extrabold text-white">Create Account</h2>
            <p className="mt-2 text-center text-sm text-blue-200">
              Join our community of investors
            </p>
          </div>

          <div className="px-8 py-8">
            {buttonDisabled ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-slate-700 block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                      disabled={buttonDisabled}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-slate-700 block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                      disabled={buttonDisabled}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-slate-700 block w-full pl-10 pr-10 py-3 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      disabled={buttonDisabled}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-gray-400 hover:text-white focus:outline-none p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        disabled={buttonDisabled}
                      >
                        {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="bg-slate-700 block w-full pl-10 pr-10 py-3 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      disabled={buttonDisabled}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="text-gray-400 hover:text-white focus:outline-none p-1"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        disabled={buttonDisabled}
                      >
                        {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="referredBy" className="block text-sm font-medium text-gray-300">
                    Referral Code (Optional)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUserFriends className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="referredBy"
                      name="referredBy"
                      type="text"
                      value={formData.referredBy}
                      onChange={handleChange}
                      className="bg-slate-700 block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter referral code"
                      disabled={buttonDisabled}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    Enter a friend&apos;s referral code to join their network
                  </p>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={buttonDisabled}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
                  >
                    {isSubmitting || isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                        Processing...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleAuthButton type="register" />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register; 