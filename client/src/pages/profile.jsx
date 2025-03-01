import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/navbar'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'
import useStore from '../store/useStore'
import { FaUser, FaEnvelope, FaShieldAlt, FaKey, FaCamera, FaCheck, FaExclamationTriangle } from 'react-icons/fa'

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
      setProfileImage(userData.profileImage || null);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="md:flex">
            {/* Sidebar */}
            <div className="md:w-1/4 bg-slate-900 p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-32 h-32 mb-4">
                  {imagePreview || userData?.profileImage ? (
                    <img 
                      src={imagePreview || (userData?.profileImage ? `http://localhost:5000${userData.profileImage}` : null)} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover border-4 border-blue-600"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                      {userData?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  {isEditing && (
                    <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer">
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
                <h3 className="text-xl font-bold text-white">{userData?.name}</h3>
                <p className="text-gray-400 text-sm">{userData?.email}</p>
                
                <div className="mt-3 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userData?.isAccountVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userData?.isAccountVerified ? (
                      <>
                        <FaCheck className="mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <FaExclamationTriangle className="mr-1" />
                        Unverified
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <FaUser className="mr-3" />
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <FaShieldAlt className="mr-3" />
                  Security
                </button>
              </nav>
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4 p-8">
              {activeTab === 'profile' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Profile Information</h1>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={isSubmitting}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isEditing
                          ? 'bg-gray-600 hover:bg-gray-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>
                  
                  {!isEditing ? (
                    <div className="space-y-6">
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center mb-1">
                          <FaUser className="text-gray-400 mr-2" />
                          <label className="text-gray-400">Full Name</label>
                        </div>
                        <p className="text-white text-lg pl-6">{userData?.name}</p>
                      </div>
                      
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center mb-1">
                          <FaEnvelope className="text-gray-400 mr-2" />
                          <label className="text-gray-400">Email Address</label>
                        </div>
                        <p className="text-white text-lg pl-6">{userData?.email}</p>
                      </div>
                      
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center mb-1">
                          <FaShieldAlt className="text-gray-400 mr-2" />
                          <label className="text-gray-400">Account Status</label>
                        </div>
                        <p className="text-white text-lg pl-6 flex items-center">
                          {userData?.isAccountVerified ? (
                            <>
                              <span className="text-green-500 mr-2">●</span> Verified
                            </>
                          ) : (
                            <>
                              <span className="text-yellow-500 mr-2">●</span> Not Verified
                            </>
                          )}
                        </p>
                      </div>
                      
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center mb-1">
                          <FaUser className="text-gray-400 mr-2" />
                          <label className="text-gray-400">Member Since</label>
                        </div>
                        <p className="text-white text-lg pl-6">
                          {userData?.createdAt 
                            ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="text-gray-400 mb-2 flex items-center">
                          <FaUser className="mr-2" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="text-gray-400 mb-2 flex items-center">
                          <FaEnvelope className="mr-2" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : 'Update Profile'}
                      </button>
                    </form>
                  )}
                </>
              )}
              
              {activeTab === 'security' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Security Settings</h1>
                    <button
                      onClick={() => navigate('/reset-password')}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Reset Password
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-slate-700/50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <FaKey className="text-gray-400 mr-2 text-xl" />
                        <h3 className="text-white text-lg font-medium">Password</h3>
                      </div>
                      <p className="text-gray-400 mb-4">
                        It&apos;s a good idea to use a strong password that you&apos;re not using elsewhere
                      </p>
                      <button
                        onClick={() => navigate('/reset-password')}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Reset password
                      </button>
                    </div>
                    
                    <div className="bg-slate-700/50 p-6 rounded-lg">
                      <div className="flex items-center mb-4">
                        <FaShieldAlt className="text-gray-400 mr-2 text-xl" />
                        <h3 className="text-white text-lg font-medium">Account Verification</h3>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Your account verification status determines what features you can access
                      </p>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          userData?.isAccountVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userData?.isAccountVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile; 