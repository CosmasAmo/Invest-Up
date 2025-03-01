import { useNavigate, Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEnvelope, FaCheckCircle } from 'react-icons/fa';

function EmailVerify() {
  const navigate = useNavigate();
  const { verifyEmail, userData, isLoading } = useStore();
  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length-1) {
      inputRefs.current[index+1].focus();
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

  const handleSubmit = async(e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map(input => input.value);
    const otp = otpArray.join('');

    const success = await verifyEmail(otp);
    if (success) {
      navigate('/dashboard');
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
                      onInput={(e) => handleInput(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
                >
                  {isLoading ? (
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