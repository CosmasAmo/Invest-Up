import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShieldAlt, FaCheckCircle, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import AuthLayout from '../components/AuthLayout';

function EmailVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmailWithCode, userData } = useStore();
  
  // State
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [otpError, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  
  // Refs for OTP inputs
  const inputRefs = useRef([]);
  
  // Immediately redirect Google users who don't need email verification
  useEffect(() => {
    const isGoogleUser = userData?.googleId || 
                        localStorage.getItem('is_google_user') === 'true' || 
                        sessionStorage.getItem('is_google_user') === 'true';
                        
    // Fix: Ensure we're only checking actual verification status from the userData object
    // and not relying on potentially incorrect localStorage/sessionStorage values
    const isVerified = userData?.isAccountVerified === true;
    
    // Check URL parameters for Google auth flow
    const urlParams = new URLSearchParams(location.search);
    const hasGoogleParams = urlParams.has('googleId') && urlParams.has('email');
    
    console.log('Email Verify Page - User status:', { 
      isGoogleUser, 
      isVerified,
      hasGoogleParams,
      googleId: userData?.googleId,
      isAccountVerified: userData?.isAccountVerified
    });
    
    // Only redirect if it's a Google user or the user is actually verified in userData
    if (isGoogleUser || (userData && userData.isAccountVerified === true) || hasGoogleParams) {
      console.log('Google user or verified user detected on email verification page. Redirecting to dashboard...');
      toast.info('Your email is already verified!');
      setTimeout(() => navigate('/dashboard', { replace: true }), 500);
    }
  }, [userData, navigate, location.search]);
  
  // Parse email from query params or state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    } else if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);
  
  // Focus first input when component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0].focus();
      }, 300);
    }
  }, []);
  
  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update the OTP array
    const newOtpArray = [...otpArray];
    newOtpArray[index] = value;
    setOtpArray(newOtpArray);
    
    // Move to next input if this one has a value and we're not at the end
    if (value !== '' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
    
    // Combine OTP values
    setOtp(newOtpArray.join(''));
  };
  
  // Handle key down events (backspace)
  const handleKeyDown = (index, e) => {
    // If backspace is pressed on an empty input, go to previous input
    if (e.key === 'Backspace' && otpArray[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  
  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      
      // Update all OTP fields with the pasted digits
      setOtpArray(digits);
      setOtp(pastedData);
      
      // Focus the last input field
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };
  
  // Submit verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Get email from state, or try to retrieve from storage if not available
    let verificationEmail = email;
    if (!verificationEmail) {
      // Try to get email from localStorage or sessionStorage
      verificationEmail = localStorage.getItem('registration_email') || 
                         sessionStorage.getItem('registration_email');
      
      // If found, set it to state
      if (verificationEmail) {
        setEmail(verificationEmail);
      }
    }
    
    // Validate email
    if (!verificationEmail) {
      setError('Please ensure your email is provided');
      return;
    }
    
    // Validate OTP
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Starting verification process...');
      console.log('Email:', verificationEmail);
      console.log('OTP:', otp);
      
      console.log('Calling verifyEmailWithCode...');
      const response = await verifyEmailWithCode(verificationEmail, otp);
      console.log('Verification response received:', response);
      
      if (response.success) {
        console.log('Verification successful, setting success state');
        setSuccess(response.message || 'Email verified successfully!');
        
        // Ensure the user data shows verified in the store
        if (response.userData) {
          // Update localStorage to indicate verification status
          localStorage.setItem('is_verified', 'true');
          localStorage.setItem('email_verified', 'true');
        }
        
        setTimeout(() => {
          console.log('Redirecting user after successful verification');
          if (response.userData) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        }, 2000);
      } else {
        console.log('Verification failed with message:', response.message);
        setError(response.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      setError(error.message || 'An error occurred during verification. Please try again.');
    } finally {
      console.log('Verification process completed, loading state set to false');
      setLoading(false);
    }
  };
  
  // Request a new code
  const handleResendCode = async () => {
    // Get email from state, or try to retrieve from storage if not available
    let verificationEmail = email;
    if (!verificationEmail) {
      // Try to get email from localStorage or sessionStorage
      verificationEmail = localStorage.getItem('registration_email') || 
                        sessionStorage.getItem('registration_email');
      
      // If found, set it to state
      if (verificationEmail) {
        setEmail(verificationEmail);
      }
    }
    
    if (!verificationEmail) {
      setError('Unable to resend verification code - email address not found');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const { resendVerificationWithEmail } = useStore.getState();
      const response = await resendVerificationWithEmail(verificationEmail);
      
      if (response.success) {
        toast.success('A new verification code has been sent to your email');
      } else {
        setError(response.message || 'Failed to send a new code. Please try again.');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setError('Failed to send a new verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="Verify Your Email" 
      subtitle={email ? 
        `Enter the 6-digit code we sent to ${email}` : 
        "Enter the verification code sent to your email"}
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="bg-green-600/20 text-green-400 p-4 rounded-lg flex items-center justify-center mb-4">
              <FaCheckCircle className="mr-2 h-5 w-5" />
              <span>{success}</span>
            </div>
            <p className="text-gray-300 text-sm">Redirecting you shortly...</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {otpError && (
              <div className="bg-red-600/20 text-red-400 p-3 rounded-lg text-sm">
                {otpError}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-3 text-center">Verification Code</label>
              <div className="flex justify-between gap-2 mb-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="w-1/6">
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={otpArray[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="bg-slate-700 w-full h-12 text-center text-lg font-bold border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center">
                Enter the code sent to your email address
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-2.5 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 text-sm font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="mr-2" />
                    Verify Email
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 focus:outline-none transition-colors"
              >
                {"Didn't receive a code? Click to resend"}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2 text-sm text-gray-400 hover:text-white focus:outline-none transition-colors flex items-center justify-center"
              >
                <FaArrowLeft className="mr-1.5 h-3 w-3" />
                Back to Login
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}

export default EmailVerify;