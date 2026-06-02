import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaGift } from 'react-icons/fa';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';
import useStore from '../store/useStore';
import axiosInstance from '../api/axios'; 

function CompleteGoogleProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [token, setToken] = useState('');
  const [googleId, setGoogleId] = useState('');
  const [email, setEmail] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [tokenStatus, setTokenStatus] = useState('Not tested');

  useEffect(() => {
    // Extract parameters from URL query parameters
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get('token');
    const googleIdFromUrl = query.get('googleId');
    const emailFromUrl = query.get('email');
    
    console.log('URL parameters:', { 
      token: tokenFromUrl ? 'present' : 'missing', 
      googleId: googleIdFromUrl, 
      email: emailFromUrl 
    });
    
    // Set Google user flags immediately upon detecting Google parameters
    if (googleIdFromUrl && emailFromUrl) {
      console.log('Setting Google user flags on page load...');
      localStorage.setItem('is_google_user', 'true');
      sessionStorage.setItem('is_google_user', 'true');
      
      // Also mark as verified to prevent email verification redirect
      localStorage.setItem('is_verified', 'true');
      sessionStorage.setItem('is_verified', 'true');
      localStorage.setItem('email_verified', 'true');
      sessionStorage.setItem('bypass_email_verification', 'true');
      
      console.log('Google user flags set successfully');
    }
    
    // Check if we have token-based or googleId-based authentication
    if (tokenFromUrl) {
      // Token-based flow
      setToken(tokenFromUrl);
      
      // Test the token
      testToken(tokenFromUrl);
    } else if (googleIdFromUrl && emailFromUrl) {
      // Legacy googleId + email flow
      setGoogleId(googleIdFromUrl);
      setEmail(emailFromUrl);
      
      // For this flow, we'll create an account in the form submission
      console.log('Using googleId + email authentication flow');
    } else {
      // No valid authentication parameters found
      toast.error('Authentication information not found');
      navigate('/login');
    }
  }, [location, navigate]);

  // Add a function to test the token with our debug endpoint
  const testToken = async (tokenToTest) => {
    try {
      setTokenStatus('Testing...');
      const response = await axiosInstance.get('/api/auth/debug-google-token', {
        headers: {
          'Authorization': `Bearer ${tokenToTest}`
        }
      });
      console.log('Token test response:', response.data);
      if (response.data.success) {
        setTokenStatus(`Valid - User: ${response.data.user.email}`);
      } else {
        setTokenStatus('Invalid token');
      }
    } catch (error) {
      console.error('Token test error:', error);
      setTokenStatus(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate password as user types
    if (name === 'password') {
      setPasswordError(validatePassword(value));
      
      // Check if confirm password matches
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }

    // Validate confirm password as user types
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  const validateForm = () => {
    // Validation checks
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setPasswordError(passwordError);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('password', formData.password);
        
        // Add optional referral code if provided
        if (formData.referralCode) {
          formDataToSend.append('referralCode', formData.referralCode);
        }
        
        // Add googleId and email if using that flow
        if (googleId && email) {
          formDataToSend.append('googleId', googleId);
          formDataToSend.append('email', email);
        }
        
        // Select endpoint based on the authentication flow
        // Simplified endpoint selection - use axiosInstance's baseURL configuration
        const endpoint = token 
          ? '/api/auth/complete-google-profile'
          : '/api/auth/complete-profile';
        
        console.log(`Using ${token ? 'token-based' : 'googleId-based'} authentication for profile completion`);
        console.log(`Endpoint: ${endpoint}`);
        
        // Set appropriate headers based on the auth flow
        const headers = token 
          ? { 'Authorization': `Bearer ${token}` } 
          : {};
        
        // Ensure we're using the correct content type
        if (formDataToSend instanceof FormData) {
          console.log('Submitting as FormData'); 
          // Don't set content-type for FormData, browser will handle it
        } else {
          console.log('Submitting as JSON');
          headers['Content-Type'] = 'application/json';
        }
          
        const response = await axiosInstance.post(
          endpoint,
          formDataToSend,
          { headers }
        );

        if (response.data.success) {
          console.log('Profile completion successful:', response.data);
          
          // Save the new token
          localStorage.setItem('auth_token', response.data.token);
          
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          
          // ENHANCED: Mark Google users as verified more aggressively with multiple flags
          // This ensures they won't be redirected to email verification
          console.log('Setting Google verification flags...');
          localStorage.setItem('is_verified', 'true');
          localStorage.setItem('is_google_user', 'true');
          localStorage.setItem('email_verified', 'true');  // Additional flag
          
          // Store these in sessionStorage too for redundancy
          sessionStorage.setItem('is_verified', 'true');
          sessionStorage.setItem('is_google_user', 'true');
          sessionStorage.setItem('bypass_email_verification', 'true');
          
          console.log('Verification flags set successfully');
          
          // Force a store refresh to ensure the user data reflects the verified status
          console.log('Refreshing authentication state...');
          await checkAuth(true);  // Force refresh
          
          // Extra delay to ensure flags are properly set before navigation
          toast.success('Profile completed successfully!');
          
          // Small delay to ensure state is updated before navigation
          setTimeout(() => {
            // Since Google users are already verified, go directly to dashboard
            console.log('Navigating to dashboard...');
            navigate('/dashboard', { replace: true });
          }, 500);
        } else {
          toast.error(response.data.message || 'Failed to complete profile');
        }
      } catch (error) {
        console.error('Error completing profile:', error);
        // Add more detailed error logging
        if (error.response) {
          console.error('Error response details:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          console.error('Error request details:', {
            request: error.request
          });
        }
        const errorMessage = error.response?.data?.message || 'An error occurred while completing your profile';
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <AuthLayout 
      title="Complete Your Profile"
      subtitle="Just a few more details to finish setting up your account"
    >
      {/* Add token status debug info */}
      {token && (
        <div className="mb-4 p-2 bg-gray-800 text-xs rounded">
          <p className="text-gray-400">Token Status: <span className={tokenStatus.includes('Valid') ? 'text-green-400' : 'text-red-400'}>{tokenStatus}</span></p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password (at least 8 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-2 bg-slate-800 border ${passwordError ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                placeholder="Create a password"
              />
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-2 bg-slate-800 border ${confirmPasswordError ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                placeholder="Confirm your password"
              />
            </div>
            {confirmPasswordError && (
              <p className="mt-1 text-sm text-red-500">{confirmPasswordError}</p>
            )}
          </div>

          {/* Optional Referral Code Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Referral Code (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGift className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter referral code (if any)"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || passwordError || confirmPasswordError}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
          >
            {isSubmitting ? (
              'Completing...'
            ) : (
              'Complete Profile'
            )}
          </button>
        </form>
      </motion.div>
    </AuthLayout>
  );
}

export default CompleteGoogleProfile; 