import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaUserFriends, FaEye, FaEyeSlash, FaCamera } from 'react-icons/fa';
import AuthLayout from '../components/AuthLayout';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const referralCode = queryParams.get('ref');
  const { register, isAuthenticated, isLoading } = useStore();
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
  
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
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
    
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile image must be less than 5MB');
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only image files are allowed');
        return;
      }
      
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => fileInputRef.current.click();
  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading) return;
    
    if (!validateForm()) {
      const firstError = Object.values(validationErrors).find(error => error);
      if (firstError) toast.error(firstError);
      return;
    }
    
    setIsSubmitting(true);
    
    if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    
    submitTimeoutRef.current = setTimeout(async () => {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        if (formData.referredBy) {
          formDataToSend.append('referralCode', formData.referredBy);
        }
        
        if (profileImage) {
          formDataToSend.append('profileImage', profileImage);
        }
        
        const response = await register(formDataToSend);
        
        if (response.success) {
          toast.success('Registration successful! Please verify your email.');
          navigate('/email-verify');
        } else {
          if (response.errorType === 'EMAIL_EXISTS') {
            toast.error('This email is already registered.');
            setValidationErrors({...validationErrors, email: 'Email already registered'});
          } else if (response.errorType === 'INVALID_EMAIL') {
            toast.error('The email address you entered is invalid.');
            setValidationErrors({...validationErrors, email: 'Invalid email address'});
          } else if (response.errorType === 'INVALID_REFERRAL') {
            toast.error('Invalid referral code.');
            setValidationErrors({...validationErrors, referredBy: 'Invalid referral code'});
          } else {
            toast.error(response.message || 'Registration failed. Please try again.');
          }
          setIsSubmitting(false);
        }
      } catch {
        toast.error('Registration failed. Please try again.');
        setIsSubmitting(false);
      }
    }, 300);
  };

  const buttonDisabled = isSubmitting || isLoading;

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join our community"
      isRegister={true}
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
          {/* Profile Image */}
          <div className="flex justify-center mb-4">
            <div 
              className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-700 border border-slate-600 cursor-pointer flex items-center justify-center hover:border-blue-500 transition-colors"
              onClick={triggerFileInput}
            >
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaCamera className="text-gray-400 text-xl" />
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
              />
            </div>
            {profileImagePreview && (
              <button
                type="button"
                onClick={removeProfileImage}
                className="absolute mt-16 text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
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
                  className={`bg-slate-700 block w-full pl-10 pr-3 py-2.5 border ${validationErrors.name ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                  placeholder="Full Name"
                  disabled={buttonDisabled}
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
              )}
            </div>

            {/* Email */}
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
                  className={`bg-slate-700 block w-full pl-10 pr-3 py-2.5 border ${validationErrors.email ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                  placeholder="Email Address"
                  disabled={buttonDisabled}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
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
                  className={`bg-slate-700 block w-full pl-10 pr-10 py-2.5 border ${validationErrors.password ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                  placeholder="Password"
                  disabled={buttonDisabled}
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
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
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
                  className={`bg-slate-700 block w-full pl-10 pr-10 py-2.5 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                  placeholder="Confirm Password"
                  disabled={buttonDisabled}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="text-gray-400 hover:text-white focus:outline-none"
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

          {/* Referral Code */}
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
                  className={`bg-slate-700 block w-full pl-10 pr-3 py-2.5 border ${validationErrors.referredBy ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm`}
                  placeholder="Referral Code (Optional)"
                  disabled={buttonDisabled}
                />
              </div>
              {validationErrors.referredBy && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.referredBy}</p>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 text-sm font-medium"
              disabled={buttonDisabled}
            >
              Create Account
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
          <GoogleAuthButton type="register" />
        </div>
      </motion.div>
    </AuthLayout>
  );
}

export default Register; 