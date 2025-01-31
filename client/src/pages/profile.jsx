import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/navbar'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

function Profile() {

    axios.defaults.withCredentials = true;
    const navigate = useNavigate();
    const { userData, updateProfile, isVerified } = useStore();
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        email: userData?.email || ''
    })

    useEffect(() => {
        if (!isVerified) {
            navigate('/email-verify');
            toast.info('Please verify your email first');
        }
    }, [isVerified, navigate]);

    console.log('userData:', userData)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await updateProfile(formData);
    if (success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400">Name</label>
                <p className="text-white text-lg">{userData?.name}</p>
              </div>
              <div>
                <label className="text-gray-400">Email</label>
                <p className="text-white text-lg">{userData?.email}</p>
              </div>
              <div>
                <label className="text-gray-400">Account Status</label>
                <p className="text-white text-lg">
                  {userData?.isAccountVerified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
              
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 block mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Update Profile
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Profile 