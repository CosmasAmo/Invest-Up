import { useState, useEffect, useRef } from 'react';
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
  const [validationErrors, setValidationErrors] = useState({});
  const submitTimeoutRef = useRef(null);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else {
      // Additional client-side validation for common email providers
      const [username, domain] = formData.email.split('@');
      const lowerDomain = domain.toLowerCase();
      
      // Gmail-specific validation
      if (lowerDomain === 'gmail.com' || lowerDomain === 'googlemail.com') {
        if (username.length < 6) {
          errors.email = 'Gmail addresses must be at least 6 characters long';
        } else if (/[^a-zA-Z0-9.+_-]/.test(username)) {
          errors.email = 'Gmail addresses can only contain letters, numbers, periods, plus signs, underscores, and hyphens';
        } else if (username.replace(/\./g, '').length === 0) {
          errors.email = 'This Gmail address format is invalid';
        }
        
        // Check for common patterns of fake Gmail addresses
        const suspiciousGmailPatterns = [
          /^test\d*$/i,
          /^user\d*$/i,
          /^admin\d*$/i,
          /^[a-z]{1,3}\d{1,3}$/i,
          /^temp\d*$/i,
          /^fake\d*$/i,
          /^dummy\d*$/i,
          /^sample\d*$/i,
          /^random\d*$/i,
          /^anonymous\d*$/i
        ];
        
        if (suspiciousGmailPatterns.some(pattern => pattern.test(username))) {
          errors.email = 'This Gmail address appears to be invalid or suspicious. Please use your real Gmail address';
        }
      }
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting || isLoading) {
      return;
    }
    
    // Client-side validation
    if (!validateForm()) {
      // Show the first validation error
      const firstError = Object.values(validationErrors).find(error => error);
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }
    
    // Set submitting state
    setIsSubmitting(true);
    
    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    
    // Use a timeout to debounce the submission
    submitTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Registering user with email:', formData.email);
        const response = await register(formData);
        console.log('Registration response:', response);
        
        if (response.success) {
          toast.success(response.message || 'Registration successful! Please verify your email.');
          navigate('/email-verify');
        } else {
          if (response.errorType === 'EMAIL_EXISTS') {
            toast.error('This email is already registered. Please use a different email address or try to log in.');
            setValidationErrors({
              ...validationErrors,
              email: 'This email is already registered'
            });
          } else if (response.errorType === 'INVALID_EMAIL') {
            toast.error(response.message || 'The email address you entered is invalid. Please use a valid email address.');
            setValidationErrors({
              ...validationErrors,
              email: response.message || 'Invalid email address'
            });
          } else if (response.errorType === 'INVALID_REFERRAL') {
            toast.error('The referral code you entered is invalid. Please check and try again.');
            setValidationErrors({
              ...validationErrors,
              referredBy: 'Invalid referral code'
            });
          } else if (response.message && (
            response.message.includes('email') || 
            response.message.includes('Email') ||
            response.message.includes('domain')
          )) {
            toast.error(response.message);
            setValidationErrors({
              ...validationErrors,
              email: response.message
            });
          } else {
            toast.error(response.message || 'Registration failed. Please try again.');
          }
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error('Registration error:', err);
        toast.error(err.message || 'Registration failed. Please try again.');
        setIsSubmitting(false);
      }
    }, 300); // 300ms debounce
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
                      className={`bg-slate-700 block w-full pl-10 pr-3 py-3 border ${validationErrors.name ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="John Doe"
                      disabled={buttonDisabled}
                    />
                  </div>
                  {validationErrors.name && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
                  )}
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
                      className={`bg-slate-700 block w-full pl-10 pr-3 py-3 border ${validationErrors.email ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="you@example.com"
                      disabled={buttonDisabled}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Please enter a valid email address that you have access to. We&apos;ll verify if this email exists and send a verification code to it.
                  </p>
                  {validationErrors.email && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
                  )}
                  {error && error.toLowerCase().includes('email') && (
                    <p className="mt-1 text-xs text-red-500">
                      {error}
                    </p>
                  )}
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
                      className={`bg-slate-700 block w-full pl-10 pr-10 py-3 border ${validationErrors.password ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                  {validationErrors.password && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
                  )}
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
                      className={`bg-slate-700 block w-full pl-10 pr-10 py-3 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
                  )}
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
                      className={`bg-slate-700 block w-full pl-10 pr-3 py-3 border ${validationErrors.referredBy ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter referral code"
                      disabled={buttonDisabled}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    Enter a friend&apos;s referral code to join their network
                  </p>
                  {validationErrors.referredBy && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.referredBy}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={buttonDisabled}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
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