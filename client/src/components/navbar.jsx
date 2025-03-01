import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { Link } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaShieldAlt, FaUserShield } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

function Navbar() {
  const navigate = useNavigate()
  const { 
    userData,
    isScrolled,
    isMobileMenuOpen,
    setIsScrolled,
    toggleMobileMenu: setIsMobileMenuOpen,
    logout
  } = useStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [setIsScrolled])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getInitial = () => {
    if (userData && userData.name) {
      return userData.name[0].toUpperCase()
    }
    return '?'
  }

  const handleLogout = () => {
    setIsDropdownOpen(false)
    logout()
  }

  const navigateToSecurity = () => {
    setIsDropdownOpen(false)
    navigate('/profile', { state: { activeTab: 'security' } })
  }

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/invest-up.png" alt="Invest Up Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Home</Link>
            {userData?.isAccountVerified && (
              <Link to="/dashboard" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Dashboard</Link>
            )}
            <Link to="/about" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">About</Link>
            <Link to="/contact" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Contact</Link>
            <Link to="/faqs" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">FAQs</Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {userData ? (
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center space-x-2 cursor-pointer p-1.5 rounded-full transition-all duration-300 ${
                    isDropdownOpen ? 'bg-blue-700' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="relative">
                    {userData.profileImage ? (
                      <img 
                        src={`http://localhost:5000${userData.profileImage}`}
                        alt="Profile" 
                        className="w-9 h-9 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-9 h-9 flex justify-center items-center
                        rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md">
                        {getInitial()}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div className="hidden lg:block text-white text-sm font-medium">
                    {userData.name?.split(' ')[0]}
                  </div>
                  <svg 
                    className={`w-4 h-4 text-white transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 origin-top-right bg-white dark:bg-slate-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 dark:divide-slate-700 z-50"
                    >
                      <div className="p-4">
                        <div className="flex items-center space-x-3">
                          {userData.profileImage ? (
                            <img 
                              src={`http://localhost:5000${userData.profileImage}`}
                              alt="Profile" 
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                            />
                          ) : (
                            <div className="w-12 h-12 flex justify-center items-center
                              rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold">
                              {getInitial()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{userData.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userData.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="group flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <FaUser className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                          <span>Your Profile</span>
                        </Link>
                        
                        <button 
                          onClick={navigateToSecurity}
                          className="group flex w-full items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
                        >
                          <FaShieldAlt className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                          <span>Security</span>
                        </button>
                      </div>
                      
                      {userData.isAdmin && (
                        <div className="py-1">
                          <Link 
                            to="/admin/dashboard" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="group flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                          >
                            <FaUserShield className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </div>
                      )}
                      
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <FaSignOutAlt className="mr-3 h-5 w-5 text-red-500" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex space-x-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 
                  rounded-full transition-all duration-300">
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-transparent border-2 border-blue-600 hover:bg-blue-700 
                  hover:border-blue-700 text-white px-6 py-2 rounded-full transition-all duration-300">
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-sm"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Home</Link>
              {userData?.isAccountVerified && (
                <Link to="/dashboard" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Dashboard</Link>
              )}
              <Link to="/about" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">About</Link>
              <Link to="/contact" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Contact</Link>
              <Link to="/faqs" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">FAQs</Link>
            </div>
            
            <div className="pt-4 pb-3 border-t border-slate-700">
              {userData ? (
                <div className="px-5 py-3">
                  <div className="flex items-center mb-3">
                    {userData.profileImage ? (
                      <img 
                        src={`http://localhost:5000${userData.profileImage}`}
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-10 h-10 flex justify-center items-center
                        rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                        {getInitial()}
                      </div>
                    )}
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{userData.name}</div>
                      <div className="text-sm font-medium text-gray-400">{userData.email}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    <Link 
                      to="/profile" 
                      className="block px-3 py-2 text-base font-medium text-white hover:bg-blue-600 rounded-md"
                    >
                      Your Profile
                    </Link>
                    {userData.isAdmin && (
                      <Link 
                        to="/admin/dashboard" 
                        className="block px-3 py-2 text-base font-medium text-white hover:bg-blue-600 rounded-md"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:bg-red-600 rounded-md"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-3 flex flex-col space-y-3">
                  <button 
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 
                    rounded-full transition-all duration-300 text-center">
                    Login
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className="bg-transparent border-2 border-blue-600 hover:bg-blue-700 
                    hover:border-blue-700 text-white px-6 py-2 rounded-full transition-all duration-300 text-center">
                    Register
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar