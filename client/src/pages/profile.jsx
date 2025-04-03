import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../store/useStore'
import { FaUser, FaEnvelope, FaShieldAlt, FaKey, FaCamera, FaCheck, FaExclamationTriangle, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaUserCircle } from 'react-icons/fa'

function Profile() {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, updateProfile, isVerified } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || ''
  });

  useEffect(() => {
    if (!isVerified) {
      navigate('/email-verify');
      toast.info('Please verify your email first');
    }
  }, [isVerified, navigate]);

  useEffect(() => {
    // Check if we have an activeTab in the location state (from navbar security link)
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || ''
      }));
      
      // Handle profile image - get from userData
      const profileImg = userData.profilePicture || userData.profileImage;
      if (profileImg) {
        setImagePreview(profileImg);
      } else {
        setImagePreview(null);
      }
      
      console.log('User data loaded:', userData);
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      
      if (profileImage) {
        console.log('Attaching profile image to form data:', profileImage.name, profileImage.type, profileImage.size);
        formDataToSend.append('profileImage', profileImage);
      }
      
      const success = await updateProfile(formDataToSend);
      
      if (success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        // Reset the profile image state after successful update
        setProfileImage(null);
      }
    } catch (error) {
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Helper function to get profile image
  const getProfileImg = () => {
    // If we have a preview from file upload, use that
    if (imagePreview && imagePreview.startsWith('data:')) {
      return imagePreview; // Data URL from file preview
    }
    
    // Otherwise get from user data and process with getImageUrl
    if (!userData) return null;
    
    const profileImg = userData.profilePicture || userData.profileImage;
    return profileImg; // Already processed by the store
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50"
        >
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-1/4 bg-slate-900/80 p-4 sm:p-6 backdrop-blur-sm">
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-3 sm:mb-4 group">
                  {getProfileImg() ? (
                    <img 
                      src={getProfileImg()} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        console.error('Profile image failed to load:', e.target.src);
                        
                        // Try to determine if this is a client-side URL error
                        const src = e.target.src;
                        if (src && src.includes('https://investuptrading.com/uploads')) {
                          console.log('Detected client URL in profile image, attempting to fix');
                          useStore.getState().refreshUserProfile();
                        }
                        
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.style.display = 'none'; // Hide the broken image
                        
                        // Show fallback with refresh button
                        const fallbackHtml = `
                          <div class="w-full h-full flex flex-col items-center justify-center bg-slate-700 rounded-full">
                            <svg class="text-gray-400 w-12 h-12 sm:w-16 sm:h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                            </svg>
                            <button class="mt-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded" onclick="window.location.reload()">
                              Reload
                            </button>
                          </div>
                        `;
                        e.target.parentNode.innerHTML = fallbackHtml;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700 rounded-full">
                      <FaUserCircle className="text-gray-400 w-16 h-16 sm:w-20 sm:h-20" />
                    </div>
                  )}
                  
                  {isEditing && (
                    <label 
                      htmlFor="profile-image" 
                      className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                      <FaCamera className="text-white" />
                      <input
                        type="file"
                        id="profile-image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                  
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        // Use our dedicated profile refresh function
                        useStore.getState().refreshUserProfile().then(() => {
                          toast.info('Profile data refreshed');
                          // Force reload the page to make sure all images are refreshed
                          setTimeout(() => {
                            window.location.reload();
                          }, 1000);
                        });
                      }}
                      className="absolute top-0 right-0 bg-slate-700 rounded-full p-1.5 cursor-pointer hover:bg-slate-600 transition-colors opacity-70 hover:opacity-100"
                      title="Refresh profile image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{userData?.name}</h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3 text-center break-words max-w-full">{userData?.email}</p>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    userData?.isAccountVerified 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                      : 'bg-amber-900/30 text-amber-400 border border-amber-500/30'
                  }`}>
                    {userData?.isAccountVerified ? (
                      <>
                        <FaCheck className="mr-1.5" />
                        Verified Account
                      </>
                    ) : (
                      <>
                        <FaExclamationTriangle className="mr-1.5" />
                        Unverified Account
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <nav className="flex flex-row md:flex-col gap-2 md:space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 md:w-full flex justify-center md:justify-start items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg md:rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base ${
                    activeTab === 'profile' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/20' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FaUserCircle className={`md:mr-3 mr-1 sm:mr-2 ${activeTab === 'profile' ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span className="font-medium md:inline">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 md:w-full flex justify-center md:justify-start items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg md:rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base ${
                    activeTab === 'security' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/20' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FaShieldAlt className={`md:mr-3 mr-1 sm:mr-2 ${activeTab === 'security' ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span className="font-medium md:inline">Security</span>
                </button>
              </nav>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-3/4 p-4 sm:p-6 md:p-8">
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Profile Information</h1>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={isSubmitting}
                      className={`w-full sm:w-auto px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center sm:justify-start font-medium text-sm sm:text-base ${
                        isEditing
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-blue-900/30'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <FaTimes className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <FaEdit className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>
                  
                  {!isEditing ? (
                    <div className="space-y-3 sm:space-y-4 md:space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-slate-800/50 p-3 sm:p-4 md:p-5 rounded-xl border border-slate-700/50 shadow-md"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-2 sm:mr-3 flex-shrink-0">
                            <FaUser className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                          <label className="text-slate-400 font-medium text-sm sm:text-base">Full Name</label>
                        </div>
                        <p className="text-white text-base sm:text-lg pl-10 sm:pl-13 ml-0 sm:ml-0 break-words">{userData?.name}</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-slate-800/50 p-3 sm:p-4 md:p-5 rounded-xl border border-slate-700/50 shadow-md"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-900/30 flex items-center justify-center text-indigo-400 mr-2 sm:mr-3 flex-shrink-0">
                            <FaEnvelope className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                          <label className="text-slate-400 font-medium text-sm sm:text-base">Email Address</label>
                        </div>
                        <p className="text-white text-base sm:text-lg pl-10 sm:pl-13 ml-0 sm:ml-0 break-words">{userData?.email}</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="bg-slate-800/50 p-3 sm:p-4 md:p-5 rounded-xl border border-slate-700/50 shadow-md"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-900/30 flex items-center justify-center text-green-400 mr-2 sm:mr-3 flex-shrink-0">
                            <FaShieldAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                          <label className="text-slate-400 font-medium text-sm sm:text-base">Account Status</label>
                        </div>
                        <p className="text-white text-base sm:text-lg pl-10 sm:pl-13 ml-0 sm:ml-0 flex items-center">
                          {userData?.isAccountVerified ? (
                            <>
                              <span className="text-green-500 mr-2">●</span> Verified
                            </>
                          ) : (
                            <>
                              <span className="text-amber-500 mr-2">●</span> Not Verified
                            </>
                          )}
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="bg-slate-800/50 p-3 sm:p-4 md:p-5 rounded-xl border border-slate-700/50 shadow-md"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 mr-2 sm:mr-3 flex-shrink-0">
                            <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                          <label className="text-slate-400 font-medium text-sm sm:text-base">Member Since</label>
                        </div>
                        <p className="text-white text-base sm:text-lg pl-10 sm:pl-13 ml-0 sm:ml-0">
                          {formatDate(userData?.createdAt)}
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <label className="text-slate-400 mb-1 sm:mb-2 flex items-center font-medium text-sm sm:text-base">
                          <FaUser className="mr-1.5 sm:mr-2 text-blue-400 w-3 h-3 sm:w-4 sm:h-4" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-slate-800 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner text-sm sm:text-base"
                          disabled={isSubmitting}
                        />
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <label className="text-slate-400 mb-1 sm:mb-2 flex items-center font-medium text-sm sm:text-base">
                          <FaEnvelope className="mr-1.5 sm:mr-2 text-indigo-400 w-3 h-3 sm:w-4 sm:h-4" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-slate-800 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner text-sm sm:text-base"
                          disabled={isSubmitting}
                        />
                      </motion.div>
                      
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 sm:py-3 rounded-lg transition-all duration-300 flex items-center justify-center font-medium shadow-md hover:shadow-blue-900/30 text-sm sm:text-base mt-2 sm:mt-4"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating Profile...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                            Update Profile
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Security Settings</h1>
                    <button
                      onClick={() => navigate('/reset-password')}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-blue-900/30 font-medium flex items-center justify-center sm:justify-start text-sm sm:text-base"
                    >
                      <FaKey className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Reset Password
                    </button>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-3 sm:p-4 md:p-6 rounded-xl border border-slate-700/50 shadow-md"
                    >
                      <div className="flex items-center mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-900/30 flex items-center justify-center text-amber-400 mr-3 sm:mr-4 flex-shrink-0">
                          <FaKey className="text-lg sm:text-xl" />
                        </div>
                        <h3 className="text-white text-base sm:text-lg font-medium">Password Security</h3>
                      </div>
                      <p className="text-slate-400 mb-3 sm:mb-5 ml-0 sm:ml-16 text-xs sm:text-sm">
                        It&apos;s a good idea to use a strong password that you&apos;re not using elsewhere. 
                        Your password should be at least 8 characters long and include a mix of letters, numbers, and symbols.
                      </p>
                      <div className="ml-0 sm:ml-16">
                        <button
                          onClick={() => navigate('/reset-password')}
                          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition-all duration-300 border border-amber-700/30 text-xs sm:text-sm"
                        >
                          <FaKey className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Change Password
                        </button>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-3 sm:p-4 md:p-6 rounded-xl border border-slate-700/50 shadow-md"
                    >
                      <div className="flex items-center mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-900/30 flex items-center justify-center text-green-400 mr-3 sm:mr-4 flex-shrink-0">
                          <FaShieldAlt className="text-lg sm:text-xl" />
                        </div>
                        <h3 className="text-white text-base sm:text-lg font-medium">Account Verification</h3>
                      </div>
                      <p className="text-slate-400 mb-3 sm:mb-5 ml-0 sm:ml-16 text-xs sm:text-sm">
                        Your account verification status determines what features you can access.
                        Verified accounts have full access to all platform features including deposits and withdrawals.
                      </p>
                      <div className="ml-0 sm:ml-16">
                        <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
                          userData?.isAccountVerified 
                            ? 'bg-green-900/30 text-green-400 border border-green-700/30' 
                            : 'bg-amber-900/30 text-amber-400 border border-amber-700/30'
                        }`}>
                          {userData?.isAccountVerified ? (
                            <>
                              <FaCheck className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Account Verified
                            </>
                          ) : (
                            <>
                              <FaExclamationTriangle className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Verification Required
                            </>
                          )}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Profile; 