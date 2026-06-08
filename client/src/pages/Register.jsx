import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaUserFriends, FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import AuthLayout from '../components/AuthLayout';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const referralCode = queryParams.get('ref');
  const { register, isAuthenticated, isLoading, userData } = useStore();
  
  // Form state management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referredBy: referralCode || ''
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const submitTimeoutRef = useRef(null);

  // Handle authenticated user navigation
  useEffect(() => {
    if (isAuthenticated && userData) {
      if (userData.isTempUser) {
        navigate('/complete-profile');
      } else if (!userData.isAccountVerified && !userData.googleId && !userData.isEmailVerified) {
        navigate('/email-verify');
      } else if (userData.isAccountVerified || userData.googleId || userData.isEmailVerified) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate, userData]);

  // Reset submitting state when loading finishes
  useEffect(() => {
    if (!isLoading && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [isLoading, isSubmitting]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || isLoading) return;
    
    // Validate form before submitting
    if (!validateForm()) {
      const firstError = Object.values(validationErrors).find(error => error);
      if (firstError) toast.error(firstError);
      return;
    }
    
    setIsSubmitting(true);
    
    // Clear previous timeout
    if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    
    // Add a small delay to prevent accidental double clicks
    submitTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Submitting registration...');
        const response = await register(formData);
        
        if (response?.success) {
          toast.success('Registration successful! Redirecting to email verification...');
          
          // Ensure token is saved
          if (response.token) {
            localStorage.setItem('auth_token', response.token);
          }
          
          // Store email for verification
          localStorage.setItem('registration_email', formData.email);
          
          // Make sure we don't have any other verification flags set incorrectly
          // Remove any potentially conflicting verification flags
          localStorage.removeItem('is_verified');
          localStorage.removeItem('email_verified');
          localStorage.removeItem('bypass_email_verification');
          sessionStorage.removeItem('is_verified');
          sessionStorage.removeItem('bypass_email_verification');
          
          // Redirect to email verification
          setTimeout(() => {
            navigate('/email-verify');
          }, 1500);
        } else {
          // Display error message from response
          toast.error(response?.message || 'Registration failed');
        }
      } catch (err) {
        console.error('Registration error:', err);
        
        // Better error handling with specific messages
        if (err.response) {
          const { data } = err.response;
          
          if (data.errorType === 'EMAIL_EXISTS') {
            setValidationErrors(prev => ({...prev, email: data.message || 'Email already exists'}));
            toast.error(data.message || 'Email already exists');
          } else if (data.errorType === 'INVALID_EMAIL') {
            setValidationErrors(prev => ({...prev, email: data.message || 'Invalid email format'}));
            toast.error(data.message || 'Invalid email format');
          } else {
            toast.error(data.message || 'Registration failed. Please try again.');
          }
        } else if (err.message) {
          toast.error(err.message || 'An error occurred during registration.');
        } else {
          toast.error('Registration failed. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }, 300);
  };

  const buttonDisabled = isSubmitting;

  // Show cross-device verification message
  const crossDeviceVerificationInfo = (
    <div className="mt-4 px-4 py-3 bg-blue-900/50 rounded-lg text-sm text-blue-100 border border-blue-700">
      <p className="flex items-start">
        <FaInfoCircle className="mr-2 mt-1 flex-shrink-0 text-blue-300" />
        <span>
          <strong>Tip:</strong> After registration, you can verify your email from any device. 
          Simply check your email for the verification code, then visit 
          <span className="mx-1 font-semibold text-blue-300">investuptrading.com/email-verify</span> 
          and enter your email and code.
        </span>
      </p>
    </div>
  );

  return (
    <>
      <AuthLayout 
        title="Create Account" 
        subtitle="Join our community"
        isRegister={true}
      >
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-5 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Name and Email Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name Field */}
            <div className="md:col-span-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`bg-slate-700 block w-full pl-10 pr-3 py-2.5 border ${validationErrors.name ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:opacity-50`}
                  placeholder="Full Name"
                  disabled={buttonDisabled}
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="md:col-span-1">
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
                  className={`bg-slate-700 block w-full pl-10 pr-3 py-2.5 border ${validationErrors.email ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:opacity-50`}
                  placeholder="Email Address"
                  disabled={buttonDisabled}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="md:col-span-1">
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
                  className={`bg-slate-700 block w-full pl-10 pr-10 py-2.5 border ${validationErrors.password ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:opacity-50`}
                  placeholder="Password"
                  disabled={buttonDisabled}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-white focus:outline-none disabled:opacity-50"
                    disabled={buttonDisabled}
                  >
                    {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="md:col-span-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`bg-slate-700 block w-full pl-10 pr-10 py-2.5 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:opacity-50`}
                  placeholder="Confirm Password"
                  disabled={buttonDisabled}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="text-gray-400 hover:text-white focus:outline-none disabled:opacity-50"
                    disabled={buttonDisabled}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Referral Code Field - only show if not already provided in URL */}
          {!referralCode && (
            <div className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserFriends className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="referredBy"
                  type="text"
                  value={formData.referredBy}
                  onChange={handleChange}
                  className={`bg-slate-700 block w-full pl-10 pr-3 py-2.5 border ${validationErrors.referredBy ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:opacity-50`}
                  placeholder="Referral Code (Optional)"
                  disabled={buttonDisabled}
                />
              </div>
              {validationErrors.referredBy && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.referredBy}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 text-sm font-medium disabled:opacity-70 flex items-center justify-center"
              disabled={buttonDisabled}
            >
              {buttonDisabled ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : 'Create Account'}
            </button>
          </div>
        </motion.form>

      {/* Social Login Separator */}
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

        {/* Google Auth Button */}
        <div className="mt-4">
          <GoogleAuthButton type="register" />
        </div>
      </motion.div>

      {crossDeviceVerificationInfo}
    </AuthLayout>
    </>
  );
}

export default Register; 