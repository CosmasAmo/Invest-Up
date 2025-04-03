import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaUser, FaCamera, FaSpinner, FaLock, FaTicketAlt } from 'react-icons/fa';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';
import useStore from '../store/useStore';

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
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [token, setToken] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Extract token from URL query parameters
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get('token');
    
    if (!tokenFromUrl) {
      toast.error('Authentication token not found');
      navigate('/login');
      return;
    }
    
    setToken(tokenFromUrl);
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('password', formData.password);
      if (formData.referralCode) {
        formDataToSend.append('referralCode', formData.referralCode);
      }
      
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      // Get API URL based on environment
      const getApiUrl = () => {
        if (import.meta.env.PROD) {
          return import.meta.env.VITE_BACKEND_URL || window.location.origin.replace(/:\d+$/, ':5000');
        }
        return 'http://localhost:5000';
      };

      const response = await axios.post(
        `${getApiUrl()}/api/auth/complete-google-profile`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        console.log('Profile completion successful:', response.data);
        
        // Save the new token
        localStorage.setItem('auth_token', response.data.token);
        
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Update localStorage to mark user as verified (needed for useStore)
        localStorage.setItem('is_verified', 'true');
        
        // Use the checkAuth function from the store we got via the hook
        await checkAuth();
        
        toast.success('Profile completed successfully!');
        // Since Google users are already verified, go directly to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(response.data.message || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while completing your profile';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Complete Your Profile"
      subtitle="Just a few more details to finish setting up your account"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image Upload - Made more compact */}
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-500">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <FaCamera className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
              >
                <FaCamera className="w-3 h-3" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-400">Upload a profile picture (optional)</p>
          </div>

          {/* Name Field */}
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

          {/* Two-column layout for passwords */}
          <div className="grid grid-cols-2 gap-3">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
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
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Create password"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm
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
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Referral Code Field (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Referral Code (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaTicketAlt className="h-4 w-4 text-gray-400" />
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
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Completing...
              </>
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