import { useNavigate, Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEnvelope, FaCheckCircle } from 'react-icons/fa';

function EmailVerify() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyEmail, userData } = useStore();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const handleInputChange = (index, value) => {
    // Update the OTP state when input changes
    const otpArray = inputRefs.current.map((input, i) => 
      i === index ? value : (input ? input.value : '')
    );
    setOtp(otpArray.join(''));
    
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index-1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if(inputRefs.current[index]) {
        inputRefs.current[index].value = char;
        if (index < inputRefs.current.length-1 && char) {
          inputRefs.current[index+1].focus();
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Collect OTP from input fields if not already set
    if (!otp) {
      const otpArray = inputRefs.current.map(input => input.value);
      const collectedOtp = otpArray.join('');
      setOtp(collectedOtp);
      
      if (!collectedOtp || collectedOtp.length !== 6) {
        setError('Please enter the complete 6-digit verification code');
        return;
      }
    }
    
    // Use the collected OTP or the one already in state
    const otpToSubmit = otp || inputRefs.current.map(input => input.value).join('');
    
    if (!otpToSubmit || otpToSubmit.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting verification code:', otpToSubmit);
      const response = await verifyEmail(otpToSubmit);
      console.log('Verification response:', response);
      
      if (response.success) {
        setSuccess(response.message || 'Email verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4 sm:px-6 lg:px-8'>
      <Link 
        to="/"
        className="absolute left-5 top-5 flex items-center text-white hover:text-blue-300 transition-colors"
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
            <div className="flex justify-center mb-2">
              <FaEnvelope className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-white">Verify Your Email</h2>
            <p className="mt-2 text-center text-sm text-blue-200">
              We&apos;ve sent a verification code to your email
            </p>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded-md flex items-center">
                <FaCheckCircle className="mr-2" /> {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Enter the 6-digit code sent to {userData?.email || 'your email'}
                </label>
                <div 
                  onPaste={handlePaste} 
                  className="flex justify-between gap-2"
                >
                  {Array(6).fill(0).map((_, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      className="w-full h-12 text-center bg-slate-700 border border-slate-600 rounded-lg text-white text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onInput={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                      Verifying...
                    </div>
                  ) : (
                    <>
                      <FaCheckCircle className="mr-2 h-5 w-5" />
                      Verify Email
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-gray-400">Didn&apos;t receive the code?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button 
                  className="text-blue-400 hover:text-blue-300 font-medium"
                  // Add resend functionality here
                >
                  Resend Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default EmailVerify;