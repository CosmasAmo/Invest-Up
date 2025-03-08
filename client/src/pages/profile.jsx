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
  const [profileImage, setProfileImage] = useState(userData?.profileImage || null);
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
      
      // Handle profile image
      if (userData.profileImage) {
        setProfileImage(userData.profileImage);
        // Clear any preview since we're using the stored image
        setImagePreview(null);
      } else {
        setProfileImage(null);
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
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      
      if (profileImage && profileImage !== userData?.profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }
      
      console.log('Updating profile with:', {
        name: formData.name,
        email: formData.email,
        hasNewImage: profileImage !== userData?.profileImage
      });
      
      const success = await updateProfile(formDataToSend);
      
      if (success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50"
        >
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-1/4 bg-slate-900/80 p-6 backdrop-blur-sm">
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-32 h-32 mb-4 group">
                  {imagePreview || userData?.profileImage ? (
                    <img 
                      src={imagePreview || (userData?.profileImage 
                        ? userData.profileImage.startsWith('http') 
                          ? userData.profileImage 
                          : `${axios.defaults.baseURL}${userData.profileImage}`
                        : null)} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        console.error('Profile image failed to load:', e);
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.style.display = 'none'; // Hide the broken image
                        // Show fallback
                        e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-700 rounded-full"><svg class="text-gray-400 w-20 h-20" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700 rounded-full">
                      <FaUserCircle className="text-gray-400 w-20 h-20" />
                    </div>
                  )}
                  
                  {isEditing && (
                    <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-2.5 cursor-pointer shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
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
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{userData?.name}</h3>
                <p className="text-slate-400 text-sm mb-3">{userData?.email}</p>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'profile' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/20' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FaUserCircle className={`mr-3 ${activeTab === 'profile' ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span className="font-medium">Profile Information</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'security' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/20' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FaShieldAlt className={`mr-3 ${activeTab === 'security' ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span className="font-medium">Security Settings</span>
                </button>
              </nav>
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4 p-8">
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Profile Information</h1>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={isSubmitting}
                      className={`px-5 py-2.5 rounded-lg transition-all duration-300 flex items-center font-medium ${
                        isEditing
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-blue-900/30'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <FaTimes className="mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <FaEdit className="mr-2" />
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>
                  
                  {!isEditing ? (
                    <div className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 shadow-md"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 mr-3">
                            <FaUser />
                          </div>
                          <label className="text-slate-400 font-medium">Full Name</label>
                        </div>
                        <p className="text-white text-lg pl-13 ml-13">{userData?.name}</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 shadow-md"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-indigo-900/30 flex items-center justify-center text-indigo-400 mr-3">
                            <FaEnvelope />
                          </div>
                          <label className="text-slate-400 font-medium">Email Address</label>
                        </div>
                        <p className="text-white text-lg pl-13 ml-13">{userData?.email}</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 shadow-md"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center text-green-400 mr-3">
                            <FaShieldAlt />
                          </div>
                          <label className="text-slate-400 font-medium">Account Status</label>
                        </div>
                        <p className="text-white text-lg pl-13 ml-13 flex items-center">
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
                        className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 shadow-md"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 mr-3">
                            <FaCalendarAlt />
                          </div>
                          <label className="text-slate-400 font-medium">Member Since</label>
                        </div>
                        <p className="text-white text-lg pl-13 ml-13">
                          {formatDate(userData?.createdAt)}
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <label className="text-slate-400 mb-2 flex items-center font-medium">
                          <FaUser className="mr-2 text-blue-400" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                          disabled={isSubmitting}
                        />
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <label className="text-slate-400 mb-2 flex items-center font-medium">
                          <FaEnvelope className="mr-2 text-indigo-400" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                          disabled={isSubmitting}
                        />
                      </motion.div>
                      
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg transition-all duration-300 flex items-center justify-center font-medium shadow-md hover:shadow-blue-900/30"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating Profile...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" />
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
                  <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Security Settings</h1>
                    <button
                      onClick={() => navigate('/reset-password')}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-blue-900/30 font-medium flex items-center"
                    >
                      <FaKey className="mr-2" />
                      Reset Password
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-xl border border-slate-700/50 shadow-md"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-amber-900/30 flex items-center justify-center text-amber-400 mr-4">
                          <FaKey className="text-xl" />
                        </div>
                        <h3 className="text-white text-lg font-medium">Password Security</h3>
                      </div>
                      <p className="text-slate-400 mb-5 ml-16">
                        It&apos;s a good idea to use a strong password that you&apos;re not using elsewhere. 
                        Your password should be at least 8 characters long and include a mix of letters, numbers, and symbols.
                      </p>
                      <div className="ml-16">
                        <button
                          onClick={() => navigate('/reset-password')}
                          className="inline-flex items-center px-4 py-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition-all duration-300 border border-amber-700/30"
                        >
                          <FaKey className="mr-2" />
                          Change Password
                        </button>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-xl border border-slate-700/50 shadow-md"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center text-green-400 mr-4">
                          <FaShieldAlt className="text-xl" />
                        </div>
                        <h3 className="text-white text-lg font-medium">Account Verification</h3>
                      </div>
                      <p className="text-slate-400 mb-5 ml-16">
                        Your account verification status determines what features you can access.
                        Verified accounts have full access to all platform features including deposits and withdrawals.
                      </p>
                      <div className="ml-16">
                        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                          userData?.isAccountVerified 
                            ? 'bg-green-900/30 text-green-400 border border-green-700/30' 
                            : 'bg-amber-900/30 text-amber-400 border border-amber-700/30'
                        }`}>
                          {userData?.isAccountVerified ? (
                            <>
                              <FaCheck className="mr-2" />
                              Account Verified
                            </>
                          ) : (
                            <>
                              <FaExclamationTriangle className="mr-2" />
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