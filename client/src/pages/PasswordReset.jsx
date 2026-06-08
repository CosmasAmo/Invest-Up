import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';
import AuthLayout from '../components/AuthLayout';
import useStore from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import zxcvbn from 'zxcvbn';

// Memoized OTP Input Component
const OtpInput = memo(({ index, value, onInput, onKeyDown, onPaste, disabled, inputRef }) => (
  <input
    ref={inputRef}
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    maxLength={1}
    value={value}
    onChange={(e) => onInput(e.target.value)}
    onKeyDown={onKeyDown}
    onPaste={onPaste}
    onClick={(e) => e.target.select()}
    enterKeyHint={index < 5 ? "next" : "done"}
    autoCorrect="off"
    autoCapitalize="none"
    spellCheck="false"
    className="w-10 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-white"
    required
    disabled={disabled}
    autoComplete="one-time-code"
    aria-label={`Digit ${index + 1}`}
  />
));

// Add prop types validation
OtpInput.propTypes = {
  index: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  onInput: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onPaste: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  inputRef: PropTypes.func.isRequired,
};

// Add display name
OtpInput.displayName = 'OtpInput';

function PasswordReset() {
  const { sendResetOtp, verifyOtp, resetPassword } = useStore();
  const navigate = useNavigate();

  // State management
  const [activeStep, setActiveStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetToken, setResetToken] = useState('');

  // Refs for OTP inputs and step tracking
  const otpInputRefs = useRef([]);
  const stepsRef = useRef({
    current: 'email',
    history: ['email'],
  });

  // Clear sessionStorage and reset state on mount for a fresh reset
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    const emailParam = urlParams.get('email');
    const tokenParam = urlParams.get('token') || urlParams.get('reset_token');

    // If no step parameter or starting fresh, reset everything
    if (!stepParam || stepParam === 'email') {
      console.log('Starting fresh password reset, clearing session storage and state');
      sessionStorage.removeItem('resetPasswordStep');
      sessionStorage.removeItem('resetPasswordEmail');
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('pw_reset_token');
      setActiveStep('email');
      setEmail('');
      setOtp('');
      setOtpDigits(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setOtpExpiry(null);
      stepsRef.current = { current: 'email', history: ['email'] };
    } else if (stepParam && ['otp', 'newPassword'].includes(stepParam) && emailParam) {
      // Restore state for valid in-progress reset
      setEmail(emailParam);
      setActiveStep(stepParam);
      stepsRef.current.current = stepParam;
      
      // For newPassword step, also retrieve the resetToken from sessionStorage or URL
      if (stepParam === 'newPassword') {
        let tokenToUse = null;
        
        // First try session storage with multiple possible keys
        const storedToken = sessionStorage.getItem('pw_reset_token') || 
                           sessionStorage.getItem('resetToken');
                           
        if (storedToken && storedToken !== 'null') {
          console.log('Retrieved reset token from session storage');
          tokenToUse = storedToken;
        } 
        // Then try URL parameter as backup
        else if (tokenParam) {
          console.log('Retrieved reset token from URL parameter');
          tokenToUse = tokenParam;
          // Save it to session storage
          sessionStorage.setItem('pw_reset_token', tokenParam);
          sessionStorage.setItem('resetToken', tokenParam);
        }
        
        if (tokenToUse) {
          setResetToken(tokenToUse);
          console.log('Reset token restored successfully');
          
          // IMPORTANT: Do NOT store in localStorage as it can be confused with an auth token
          // Make sure any existing auth tokens aren't mistaken
          if (localStorage.getItem('auth_token')?.startsWith(tokenToUse.substring(0, 10))) {
            console.warn('Removing conflicting auth_token from localStorage to prevent confusion');
            localStorage.removeItem('auth_token');
          }
        } else {
          console.warn('No reset token found in session storage or URL');
        }
      }
    }
  }, []);

  // Add an effect to handle token changes and ensure it's synced with sessionStorage
  useEffect(() => {
    if (resetToken) {
      console.log('Saving reset token to session storage with special key');
      // Use a different key name to avoid confusion with auth tokens
      sessionStorage.setItem('pw_reset_token', resetToken);
      // Also maintain the standard key for backward compatibility
      sessionStorage.setItem('resetToken', resetToken);
    }
  }, [resetToken]);

  // Add an effect to debug session storage issues
  useEffect(() => {
    // Function to check and log session storage state
    const checkSessionStorage = () => {
      const storedToken = sessionStorage.getItem('resetToken');
      const storedStep = sessionStorage.getItem('resetPasswordStep');
      const storedEmail = sessionStorage.getItem('resetPasswordEmail');
      
      const tokenState = {
        resetToken: storedToken ? `${storedToken.substring(0, 10)}...` : 'null',
        tokenType: typeof storedToken,
        tokenLength: storedToken ? storedToken.length : 0,
        resetPasswordStep: storedStep,
        resetPasswordEmail: storedEmail,
        currentStep: activeStep,
        hasTokenInState: Boolean(resetToken),
        stateTokenLength: resetToken ? resetToken.length : 0
      };
      
      console.log('Session storage state:', tokenState);
    };
    
    // Check immediately
    checkSessionStorage();
    
    // Also check when step changes
    if (activeStep === 'newPassword') {
      checkSessionStorage();
    }
  }, [activeStep, resetToken]);

  // Clean up sessionStorage on unmount - ONLY if navigating away from the reset flow
  useEffect(() => {
    // Store current pathname to detect navigation changes
    const currentPath = window.location.pathname;
    
    return () => {
      // Only clear if we're actually navigating away from the reset page
      const isLeavingResetPage = !window.location.pathname.includes('reset-password');
      console.log('PasswordReset component state change', {
        isLeavingResetPage,
        wasAt: currentPath,
        nowAt: window.location.pathname
      });
      
      // Only clear session storage if we're actually leaving the reset flow
      if (isLeavingResetPage) {
        console.log('Clearing session storage as user is leaving reset flow');
        sessionStorage.removeItem('resetPasswordStep');
        sessionStorage.removeItem('resetPasswordEmail');
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('pw_reset_token');
      } else {
        console.log('NOT clearing session storage as user is still in reset flow');
      }
    };
  }, []);

  // Handle countdown timer for OTP expiry
  useEffect(() => {
    let timer;
    if (otpExpiry && activeStep === 'otp') {
      timer = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((otpExpiry - now) / 1000));
        setCountdown(timeLeft);

        if (timeLeft === 0) {
          clearInterval(timer);
          toast.info('Verification code has expired. Please request a new one.');
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpExpiry, activeStep]);

  // Calculate password strength
  useEffect(() => {
    if (newPassword) {
      const result = zxcvbn(newPassword);
      setPasswordStrength(result.score);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  // Focus first OTP input when switching to OTP step
  useEffect(() => {
    if (activeStep === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0].focus();
        console.log('First OTP input focused');
      }, 200);
    }
  }, [activeStep]);

  // Safe step change function
  const safeSetStep = useCallback((newStep) => {
    console.log(`Changing step from ${activeStep} to ${newStep}`);
    stepsRef.current.current = newStep;
    setActiveStep(newStep);
  }, [activeStep]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.dismiss();

    try {
      console.log('Sending reset OTP to email:', email);

      // Clear all previous state and storage
      sessionStorage.clear();
      setOtp('');
      setOtpDigits(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setOtpExpiry(null);
      stepsRef.current = { current: 'email', history: ['email'] };

      const response = await sendResetOtp(email);
      console.log('Response from sendResetOtp:', response);

      if (response.success) {
        toast.success('Verification code sent to your email');
        setOtpExpiry(response.expiresAt);
        sessionStorage.setItem('resetPasswordStep', 'otp');
        sessionStorage.setItem('resetPasswordEmail', email);
        navigate(`/reset-password?step=otp&email=${encodeURIComponent(email)}`);
        safeSetStep('otp');
      } else {
        toast.error(response.message || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Error in handleEmailSubmit:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    toast.dismiss();

    try {
      console.log('Verifying OTP:', otp, 'for email:', email);
      const response = await verifyOtp(email, otp);
      console.log('Response from verifyOtp:', response);

      if (response.success) {
        toast.success('Code verified successfully');
        
        // Make sure token is stored properly
        const token = response.resetToken;
        console.log('Received reset token:', token ? `${token.substring(0, 10)}...` : 'null');
        
        if (token) {
          // Update state
          setResetToken(token);
          
          // Store as string directly in sessionStorage using the special key
          sessionStorage.setItem('pw_reset_token', token);
          // Also maintain the standard key for backward compatibility
          sessionStorage.setItem('resetToken', token);
          console.log('Stored reset token in sessionStorage');
          
          // IMPORTANT: Do NOT store in localStorage as it can be confused with an auth token
          // Make sure any existing auth tokens aren't mistaken
          if (localStorage.getItem('auth_token')?.startsWith(token.substring(0, 10))) {
            console.warn('Removing conflicting auth_token from localStorage to prevent confusion');
            localStorage.removeItem('auth_token');
          }
        } else {
          console.error('No token received from server!');
        }
        
        sessionStorage.setItem('resetPasswordStep', 'newPassword');
        sessionStorage.setItem('resetPasswordEmail', email);
        
        // Double-check storage before navigating
        setTimeout(() => {
          const storedToken = sessionStorage.getItem('pw_reset_token');
          console.log('Verified token in sessionStorage before navigation:', 
            storedToken ? `${storedToken.substring(0, 10)}...` : 'null');
          
          // Navigate to next step - include the token as a URL parameter for backup
          // Use a different parameter name to avoid confusion with auth tokens
          navigate(`/reset-password?step=newPassword&email=${encodeURIComponent(email)}&reset_token=${encodeURIComponent(token)}`);
          safeSetStep('newPassword');
        }, 100);
      } else {
        toast.error(response.message || 'Invalid verification code');
      }
    } catch (err) {
      console.error('Error in handleOtpSubmit:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add an effect to ensure token persists across page loads for newPassword step
  useEffect(() => {
    if (activeStep === 'newPassword') {
      // Try multiple storage keys for backwards compatibility
      const storedToken = sessionStorage.getItem('pw_reset_token') || 
                         sessionStorage.getItem('resetToken');
                         
      console.log('On newPassword step, checking token:', storedToken ? 'Token exists' : 'No token');
      
      if (storedToken && !resetToken) {
        console.log('Restoring token from sessionStorage to state');
        setResetToken(storedToken);
      } else if (!storedToken && resetToken) {
        console.log('Storing token from state to sessionStorage');
        sessionStorage.setItem('pw_reset_token', resetToken);
        sessionStorage.setItem('resetToken', resetToken);
      } else if (!storedToken && !resetToken) {
        console.warn('No token in state or sessionStorage!');
      }
    }
  }, [activeStep, resetToken]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      toast.error('Please choose a stronger password');
      return;
    }

    // Get the token from multiple sources for redundancy
    let tokenToUse = resetToken;
    
    // If not in state, try sessionStorage with multiple keys
    if (!tokenToUse) {
      tokenToUse = sessionStorage.getItem('pw_reset_token') || 
                  sessionStorage.getItem('resetToken');
                  
      console.log('Getting token from sessionStorage:', tokenToUse ? `${tokenToUse.substring(0, 10)}...` : 'null');
      
      // If found in sessionStorage but not in state, update state
      if (tokenToUse) {
        setResetToken(tokenToUse);
      }
    }
    
    // Also check URL parameters as a last resort
    if (!tokenToUse || tokenToUse === 'null') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token') || urlParams.get('reset_token');
      if (tokenParam) {
        console.log('Found token in URL parameters');
        tokenToUse = tokenParam;
        setResetToken(tokenParam);
        sessionStorage.setItem('pw_reset_token', tokenParam);
        sessionStorage.setItem('resetToken', tokenParam);
        
        // IMPORTANT: Do NOT store in localStorage as it can be confused with an auth token
      }
    }
    
    // Last check for token
    if (!tokenToUse || tokenToUse === 'null') {
      console.error('No reset token available');
      toast.error('Session expired. Please restart the password reset process.');
      
      // Clear state and redirect to email step
      sessionStorage.removeItem('resetPasswordStep');
      sessionStorage.removeItem('resetPasswordEmail');
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('pw_reset_token');
      setResetToken('');
      
      setTimeout(() => {
        navigate('/reset-password?step=email');
        safeSetStep('email');
      }, 1000);
      return;
    }

    setIsSubmitting(true);
    toast.dismiss();

    try {
      console.log('Resetting password for email:', email);
      console.log('Using resetToken:', tokenToUse.substring(0, 10) + '...');
      console.log('Token type:', typeof tokenToUse, 'length:', tokenToUse.length);
      
      // Ensure the token is a string before sending
      const response = await resetPassword(email, newPassword, String(tokenToUse));
      console.log('Response from resetPassword:', response);

      if (response.success) {
        toast.success('Password reset successful. You will be redirected shortly.');
        // Clear storage only after successful reset
        setTimeout(() => {
          sessionStorage.removeItem('resetPasswordStep');
          sessionStorage.removeItem('resetPasswordEmail');
          sessionStorage.removeItem('resetToken');
          sessionStorage.removeItem('pw_reset_token');
          safeSetStep('complete');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }, 100);
      } else {
        toast.error(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Error in handlePasswordReset:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    toast.dismiss();

    try {
      console.log('Resending OTP to email:', email);
      const response = await sendResetOtp(email);
      console.log('Response from resend OTP:', response);

      if (response.success) {
        toast.success('New verification code sent to your email');
        setOtpExpiry(response.expiresAt);
        setOtpDigits(['', '', '', '', '', '']);
        setOtp('');
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 100);
      } else {
        toast.error(response.message || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Error in handleResendOtp:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpDigitChange = (index, value) => {
    // Allow only single digit or empty string
    if (value.length > 1 || !/^\d*$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Update OTP string
    const newOtp = newOtpDigits.join('');
    setOtp(newOtp);

    // Move to next input if a digit was entered and not at the last input
    if (value && index < 5) {
      // Improved focus handling for mobile devices
      setTimeout(() => {
        if (otpInputRefs.current[index + 1]) {
          otpInputRefs.current[index + 1].focus();
          // For mobile, try to select any content to ensure keyboard stays up
          otpInputRefs.current[index + 1].select();
        }
      }, 10);
    }
    // Move to previous input if value was cleared and not at the first input
    else if (!value && index > 0) {
      setTimeout(() => {
        if (otpInputRefs.current[index - 1]) {
          otpInputRefs.current[index - 1].focus();
          otpInputRefs.current[index - 1].select();
        }
      }, 10);
    }

    // Auto-submit if all digits are filled
    if (newOtp.length === 6 && !newOtp.includes('')) {
      setTimeout(() => {
        document.getElementById('otpForm')?.requestSubmit();
      }, 300);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
    
    // Handle enter key - submit if we have all 6 digits
    if (e.key === 'Enter') {
      const currentOtp = otpDigits.join('');
      if (currentOtp.length === 6 && !currentOtp.includes('')) {
        document.getElementById('otpForm')?.requestSubmit();
      }
    }
    
    // Handle right arrow key
    if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1].focus();
      e.preventDefault();
    }
    
    // Handle left arrow key
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1].focus();
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    // Extract only numeric characters and take max 6 digits
    const digitsOnly = pastedData.replace(/\D/g, '').substring(0, 6);
    
    if (digitsOnly.length > 0) {
      console.log('Pasting digits:', digitsOnly);
      
      // Create array of digits, padded to length 6 if needed
      const digits = digitsOnly.split('');
      const paddedDigits = [...digits];
      while (paddedDigits.length < 6) {
        paddedDigits.push('');
      }
      
      // Update the OTP input fields
      setOtpDigits(paddedDigits);
      setOtp(digits.join(''));
      
      // Auto-submit if we got all 6 digits
      if (digits.length === 6) {
        // Give time for UI to update
        setTimeout(() => {
          // Focus the last digit for visual feedback
          if (otpInputRefs.current[5]) {
            otpInputRefs.current[5].focus();
          }
          
          // Submit the form after a short delay
          setTimeout(() => {
            document.getElementById('otpForm')?.requestSubmit();
          }, 150);
        }, 50);
      } else {
        // Focus on the next unfilled position
        setTimeout(() => {
          const nextIndex = Math.min(digits.length, 5);
          if (otpInputRefs.current[nextIndex]) {
            otpInputRefs.current[nextIndex].focus();
          }
        }, 50);
      }
    }
  };

  const handleInputBlur = () => {
    // Remove the behavior that forces focus to stay on inputs
    // This was causing issues with text inputs on mobile
    // No need to re-focus inputs after blur
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-gray-500';
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Very Weak';
    }
  };



  // Step 1: Email Entry Form
  const EmailStep = () => (
    <motion.form
      data-step="email"
      onSubmit={handleEmailSubmit}
      className="space-y-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      key="email-step"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-4">
          <FaEnvelope className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-white">Enter your email address</h3>
        <p className="text-gray-400 text-sm mt-1">
          We&apos;ll send a verification code to reset your password
        </p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaEnvelope className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            enterKeyHint="send"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            className="bg-gray-800 border border-gray-700 text-white text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-4"
            placeholder="example@email.com"
            required
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !email}
        className={`w-full flex justify-center items-center py-4 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
          isSubmitting || !email
            ? 'bg-blue-600/50 text-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          'Send Reset Code'
        )}
      </button>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </motion.form>
  );

  // Step 2: OTP Verification Form
  const OtpStep = () => (
    <motion.form
      data-step="otp"
      id="otpForm"
      onSubmit={handleOtpSubmit}
      className="space-y-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      key="otp-step"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-4">
          <FaShieldAlt className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-white">Verify your identity</h3>
        <p className="text-gray-400 text-sm mt-1">
          Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="flex gap-2 sm:gap-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <OtpInput
                key={index}
                index={index}
                value={otpDigits[index]}
                onInput={(value) => handleOtpDigitChange(index, value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                disabled={isSubmitting}
                inputRef={(el) => (otpInputRefs.current[index] = el)}
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Received the code?{' '}
            <button
              type="button"
              onClick={() => {
                // Try to get clipboard content
                if (navigator.clipboard && navigator.clipboard.readText) {
                  navigator.clipboard
                    .readText()
                    .then((text) => {
                      console.log('Clipboard text retrieved:', text ? text.substring(0, 10) + '...' : 'empty');
                      // Create a synthetic clipboard event
                      const clipboardData = new DataTransfer();
                      clipboardData.setData('text/plain', text);
                      
                      const syntheticEvent = {
                        clipboardData,
                        preventDefault: () => {}
                      };
                      
                      // Call our paste handler with the synthetic event
                      handleOtpPaste(syntheticEvent);
                    })
                    .catch((err) => {
                      console.error('Could not read clipboard:', err);
                      // Mobile devices often can't access clipboard via API
                      toast.info('Please copy the code from your email and paste manually by long-pressing any input');
                    });
                } else {
                  // For browsers without clipboard API support
                  toast.info('Please copy the code from your email and paste manually by long-pressing any input');
                }
              }}
              className="text-blue-500 focus:outline-none"
            >
              Tap to paste
            </button>
          </p>
        </div>

        {countdown > 0 && (
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-900/30 rounded-full">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm text-blue-300">Code expires in {formatTime(countdown)}</span>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || otp.length < 6}
        className={`w-full flex justify-center items-center py-4 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
          isSubmitting || otp.length < 6
            ? 'bg-blue-600/50 text-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </button>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => safeSetStep('email')}
          className="flex items-center text-sm text-gray-400 hover:text-white"
        >
          <FaArrowLeft className="mr-1 w-3 h-3" />
          Change Email
        </button>

        <button
          type="button"
          disabled={isSubmitting || countdown > 0}
          onClick={handleResendOtp}
          className={`text-sm ${
            isSubmitting || countdown > 0
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-blue-500 hover:text-blue-400'
          }`}
        >
          {countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend Code'}
        </button>
      </div>
    </motion.form>
  );

  // Step 3: New Password Form
  const NewPasswordStep = () => (
    <motion.form
      data-step="newPassword"
      onSubmit={handlePasswordReset}
      className="space-y-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      key="new-password-step"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full mb-4">
          <FaLock className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-white">Create a new password</h3>
        <p className="text-gray-400 text-sm mt-1">
          Your new password must be different from previous passwords
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaLock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 p-4"
              placeholder="New password"
              required
              autoComplete="new-password"
              onBlur={handleInputBlur}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
            >
              {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
            </button>
          </div>

          {newPassword && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Password strength:</span>
                <span className={`text-sm font-medium ${passwordStrength >= 3 ? 'text-green-500' : 'text-red-500'}`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                ></div>
              </div>
              <ul className="text-xs text-gray-400 mt-2 space-y-1 pl-5 list-disc">
                <li className={newPassword.length >= 8 ? 'text-green-500' : ''}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-green-500' : ''}>
                  At least one uppercase letter
                </li>
                <li className={/[0-9]/.test(newPassword) ? 'text-green-500' : ''}>
                  At least one number
                </li>
                <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-500' : ''}>
                  At least one special character
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaLock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`bg-gray-800 border ${
              confirmPassword && newPassword !== confirmPassword
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-700 focus:ring-blue-500'
            } text-white text-base rounded-lg focus:border-blue-500 block w-full pl-10 p-4`}
            placeholder="Confirm new password"
            required
            autoComplete="new-password"
            onBlur={handleInputBlur}
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || passwordStrength < 3 || newPassword !== confirmPassword}
        className={`w-full flex justify-center items-center py-4 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
          isSubmitting || passwordStrength < 3 || newPassword !== confirmPassword
            ? 'bg-blue-600/50 text-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Resetting...
          </>
        ) : (
          'Reset Password'
        )}
      </button>
    </motion.form>
  );

  // Step 4: Completion Screen
  const CompleteStep = () => (
    <motion.div
      data-step="complete"
      className="text-center space-y-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      key="complete-step"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/20 rounded-full mb-4">
        <FaCheckCircle className="w-10 h-10 text-green-500" />
      </div>

      <h3 className="text-xl font-medium text-white">Password Reset Successful</h3>

      <p className="text-gray-400">
        Your password has been reset successfully. You can now log in with your new password.
      </p>

      <div className="pt-4">
        <Link
          to="/login"
          className="inline-flex justify-center items-center py-3 px-6 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </motion.div>
  );

  // Dynamically render the correct step
  const renderStep = () => {
    console.log('Rendering step:', activeStep);

    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');

    const currentStep = stepParam || activeStep;

    if (stepParam && stepParam !== activeStep) {
      console.log('URL step parameter differs from state, updating to:', stepParam);
      setTimeout(() => {
        setActiveStep(stepParam);
        stepsRef.current.current = stepParam;
      }, 0);
    }

    switch (currentStep) {
      case 'email':
        return EmailStep();
      case 'otp':
        return OtpStep();
      case 'newPassword':
        return NewPasswordStep();
      case 'complete':
        return CompleteStep();
      default:
        console.warn('Unknown step:', currentStep);
        return EmailStep();
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto" data-active-step={activeStep}>
        <AnimatePresence mode="wait" initial={false}>
          {renderStep()}
        </AnimatePresence>


      </div>
    </AuthLayout>
  );
}

export default PasswordReset;