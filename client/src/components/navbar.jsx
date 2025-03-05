import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { Link } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaShieldAlt, FaUserShield, FaChartLine, FaWallet, FaExchangeAlt, FaChevronDown } from 'react-icons/fa'
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
      isScrolled 
        ? 'bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md shadow-lg border-b border-slate-700/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img 
                src="/invest-up.png" 
                alt="Invest Up Logo" 
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="block px-4 py-2 text-white font-medium hover:text-blue-400 rounded-md transition-all duration-300 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {userData?.isAccountVerified && (
              <Link 
                to="/dashboard" 
                className="block px-4 py-2 text-white font-medium hover:text-blue-400 rounded-md transition-all duration-300 relative group"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            
            <Link 
              to="/about" 
              className="block px-4 py-2 text-white font-medium hover:text-blue-400 rounded-md transition-all duration-300 relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <Link 
              to="/contact" 
              className="block px-4 py-2 text-white font-medium hover:text-blue-400 rounded-md transition-all duration-300 relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <Link 
              to="/faqs" 
              className="block px-4 py-2 text-white font-medium hover:text-blue-400 rounded-md transition-all duration-300 relative group"
            >
              FAQs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {userData ? (
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg transition-all duration-300 ${
                    isDropdownOpen 
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 shadow-md shadow-blue-900/30' 
                      : 'hover:bg-slate-800/70'
                  }`}
                >
                  <div className="relative">
                    {userData.profileImage ? (
                      <img 
                        src={`http://localhost:5000${userData.profileImage}`}
                        alt="Profile" 
                        className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shadow-md"
                      />
                    ) : (
                      <div className="w-9 h-9 flex justify-center items-center
                        rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md">
                        {getInitial()}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 shadow-sm"></div>
                  </div>
                  <div className="hidden lg:block text-white text-sm font-medium">
                    {userData.name?.split(' ')[0]}
                  </div>
                  <FaChevronDown 
                    className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-72 origin-top-right bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl shadow-xl ring-1 ring-black/5 ring-opacity-5 divide-y divide-slate-700/50 z-50 overflow-hidden border border-slate-700/50"
                    >
                      <div className="p-5 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
                        <div className="flex items-center space-x-4">
                          {userData.profileImage ? (
                            <img 
                              src={`http://localhost:5000${userData.profileImage}`}
                              alt="Profile" 
                              className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 flex justify-center items-center
                              rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold shadow-lg">
                              {getInitial()}
                            </div>
                          )}
                          <div>
                            <p className="text-base font-medium text-white">{userData.name}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{userData.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="group flex items-center px-5 py-3 text-sm text-gray-200 hover:bg-blue-600/20 transition-colors duration-200"
                        >
                          <FaUser className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                          <span>Your Profile</span>
                        </Link>
                        
                        <button 
                          onClick={navigateToSecurity}
                          className="group flex w-full items-center px-5 py-3 text-sm text-gray-200 hover:bg-blue-600/20 transition-colors duration-200 text-left"
                        >
                          <FaShieldAlt className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                          <span>Security</span>
                        </button>
                      </div>
                      
                      {userData?.isAccountVerified && (
                        <div className="py-1">
                          <Link 
                            to="/dashboard" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="group flex items-center px-5 py-3 text-sm text-gray-200 hover:bg-blue-600/20 transition-colors duration-200"
                          >
                            <FaChartLine className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                            <span>Dashboard</span>
                          </Link>
                          
                          <Link 
                            to="/deposit" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="group flex items-center px-5 py-3 text-sm text-gray-200 hover:bg-blue-600/20 transition-colors duration-200"
                          >
                            <FaWallet className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                            <span>Deposit Funds</span>
                          </Link>
                          
                          <Link 
                            to="/withdraw" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="group flex items-center px-5 py-3 text-sm text-gray-200 hover:bg-blue-600/20 transition-colors duration-200"
                          >
                            <FaExchangeAlt className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                            <span>Withdraw Funds</span>
                          </Link>
                        </div>
                      )}
                      
                      {userData.isAdmin && (
                        <div className="py-1">
                          <Link 
                            to="/admin/dashboard" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="group flex items-center px-5 py-3 text-sm text-gray-200 hover:bg-blue-600/20 transition-colors duration-200"
                          >
                            <FaUserShield className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </div>
                      )}
                      
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center px-5 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors duration-200"
                        >
                          <FaSignOutAlt className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-300" />
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
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 
                  rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium">
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-transparent border border-blue-600 hover:border-blue-500 hover:bg-blue-900/20 
                  text-white px-6 py-2.5 rounded-lg transition-all duration-300 font-medium">
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-slate-800/70 transition-colors duration-200"
              aria-label="Toggle menu"
            >
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
            className="md:hidden bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg"
          >
            {/* Make the mobile menu scrollable when it gets too tall */}
            <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              <div className="px-4 pt-3 pb-4 space-y-1.5">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-white font-medium hover:bg-blue-600/20 rounded-lg transition-colors duration-200"
                >
                  Home
                </Link>
                {userData?.isAccountVerified && (
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-white font-medium hover:bg-blue-600/20 rounded-lg transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                )}
                <Link 
                  to="/about" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-white font-medium hover:bg-blue-600/20 rounded-lg transition-colors duration-200"
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-white font-medium hover:bg-blue-600/20 rounded-lg transition-colors duration-200"
                >
                  Contact
                </Link>
                <Link 
                  to="/faqs" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-white font-medium hover:bg-blue-600/20 rounded-lg transition-colors duration-200"
                >
                  FAQs
                </Link>
              </div>
              
              <div className="pt-4 pb-5 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                {userData ? (
                  <div className="px-5 py-3">
                    <div className="flex items-center mb-4">
                      {userData.profileImage ? (
                        <img 
                          src={`http://localhost:5000${userData.profileImage}`}
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 flex justify-center items-center
                          rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md">
                          {getInitial()}
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-base font-medium text-white">{userData.name}</div>
                        <div className="text-sm font-medium text-gray-400">{userData.email}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Link 
                        to="/profile" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-4 py-2.5 text-base font-medium text-white hover:bg-blue-600/20 rounded-lg transition-colors duration-200"
                      >
                        <FaUser className="mr-3 h-5 w-5 text-blue-400" />
                        Your Profile
                      </Link>
                      
                      {userData?.isAccountVerified && (
                        <>
                          <Link 
                            to="/deposit" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-base font-medium text-white hover:bg-blue-600/20 rounded-lg transition-colors duration-200"
                          >
                            <FaWallet className="mr-3 h-5 w-5 text-blue-400" />
                            Deposit Funds
                          </Link>
                          
                          <Link 
                            to="/withdraw" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-base font-medium text-white hover:bg-blue-600/20 rounded-lg transition-colors duration-200"
                          >
                            <FaExchangeAlt className="mr-3 h-5 w-5 text-blue-400" />
                            Withdraw Funds
                          </Link>
                        </>
                      )}
                      
                      {userData.isAdmin && (
                        <Link 
                          to="/admin/dashboard" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-base font-medium text-white hover:bg-blue-600/20 rounded-lg transition-colors duration-200"
                        >
                          <FaUserShield className="mr-3 h-5 w-5 text-blue-400" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2.5 text-base font-medium text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      >
                        <FaSignOutAlt className="mr-3 h-5 w-5 text-red-400" />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4 flex flex-col space-y-3">
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 
                      rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium text-center">
                      Login
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/register');
                      }}
                      className="bg-transparent border border-blue-600 hover:border-blue-500 hover:bg-blue-900/20 
                      text-white px-6 py-2.5 rounded-lg transition-all duration-300 font-medium text-center">
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar