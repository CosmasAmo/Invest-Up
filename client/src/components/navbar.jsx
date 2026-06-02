import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { Link } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaShieldAlt, FaUserShield, FaChartLine, FaChevronDown } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'

function Navbar() {
  const navigate = useNavigate()
  const { 
    userData,
    isScrolled,
    isMobileMenuOpen,
    setIsScrolled,
    toggleMobileMenu,
    logout
  } = useStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const [activeLink, setActiveLink] = useState('')

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
      // Handle desktop dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      
      // Handle mobile menu
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        toggleMobileMenu(false)
      }
    }
    
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
        toggleMobileMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleMobileMenu])

  useEffect(() => {
    // Set active link based on current path
    const path = window.location.pathname
    setActiveLink(path)
  }, [])

  const getInitial = () => {
    if (userData && userData.name) {
      return userData.name[0].toUpperCase()
    }
    return '?'
  }

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false)
      // Show loading toast
      const toastId = toast.loading("Logging out...")
      
      // Call the logout function
      await logout()
      
      // Update toast on success (will be shown briefly before redirect)
      toast.update(toastId, {
        render: "Logged out successfully",
        type: "success",
        isLoading: false,
        autoClose: 2000
      })
    } catch (error) {
      console.error("Logout failed:", error)
      // If there's an error, show it to the user
      toast.error("Logout failed. Please try again.")
    }
  }

  const navigateToSecurity = () => {
    setIsDropdownOpen(false)
    navigate('/profile', { state: { activeTab: 'security' } })
  }

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/98 backdrop-blur-lg shadow-xl border-b border-slate-700/50 py-2' 
        : 'bg-slate-900/40 backdrop-blur-sm py-4 hover:bg-slate-900/70'
    }`}>
      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => toggleMobileMenu(false)}
          />
        )}
      </AnimatePresence>
      
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex justify-between items-center min-h-[4rem]">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img 
                src="/invest-up.png" 
                alt="Invest Up Logo" 
                className={`h-10 w-auto transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'brightness-110' : ''}`}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <NavLink to="/" isActive={activeLink === '/'}>
              Home
            </NavLink>
            
            <NavLink to="/make-money-online" isActive={activeLink === '/make-money-online'}>
              Make Money Online
            </NavLink>
            
            {userData?.isAccountVerified && (
              <NavLink to="/dashboard" isActive={activeLink === '/dashboard'}>
                Dashboard
              </NavLink>
            )}
            
            <NavLink to="/about" isActive={activeLink === '/about'}>
              About
            </NavLink>
            
            <NavLink to="/contact" isActive={activeLink === '/contact'}>
              Contact
            </NavLink>
            
            <NavLink to="/faqs" isActive={activeLink === '/faqs'}>
              FAQs
            </NavLink>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
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
                    <div className="w-9 h-9 flex justify-center items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                      {getInitial()}
                    </div>
                  </div>
                  <span className="text-white text-sm font-medium hidden xl:inline">{userData.name?.split(' ')[0] || 'User'}</span>
                  <FaChevronDown className={`text-white w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-slate-900 border border-slate-700 shadow-black/20 divide-y divide-slate-700 overflow-hidden z-10"
                    >
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{userData.name}</p>
                        <p className="text-xs text-gray-400 truncate mt-1">{userData.email}</p>
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
                      </div>
                      <div className="py-1">
                        <button 
                          onClick={navigateToSecurity}
                          className="group flex w-full items-center px-5 py-3 text-sm text-gray-200 hover:bg-blue-600/20 transition-colors duration-200 text-left"
                        >
                          <FaShieldAlt className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                          <span>Security Settings</span>
                        </button>
                      </div>
                      
                      {userData?.isAdmin && (
                        <div className="py-1 border-t border-slate-700">
                          <Link 
                            to="/admin/dashboard" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="group flex items-center px-5 py-3 text-sm text-gray-200 hover:bg-blue-600/20 transition-colors duration-200"
                          >
                            <FaUserShield className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                            <span>Admin Portal</span>
                          </Link>
                        </div>
                      )}
                      
                      {userData?.isAccountVerified && (
                        <div className="py-1 border-t border-slate-700">
                          <Link 
                            to="/dashboard" 
                            onClick={() => setIsDropdownOpen(false)}
                            className="group flex items-center px-5 py-3 text-sm text-gray-200 hover:bg-blue-600/20 transition-colors duration-200"
                          >
                            <FaChartLine className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                            <span>Dashboard</span>
                          </Link>
                        </div>
                      )}
                      
                      <div className="py-1 border-t border-slate-700">
                        <button 
                          onClick={handleLogout}
                          className="group flex w-full items-center px-5 py-3 text-sm text-red-300 hover:bg-red-500/10 transition-colors duration-200 text-left"
                        >
                          <FaSignOutAlt className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-300" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-white font-medium hover:text-blue-400 transition-colors duration-300 px-4 py-2"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 
                  rounded-lg shadow-md hover:shadow-blue-900/30 transition-all duration-300 font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center relative" ref={mobileMenuRef}>
            <button
              onClick={() => toggleMobileMenu()}
              className={`inline-flex items-center justify-center w-11 h-11 rounded-lg text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isMobileMenuOpen 
                  ? 'bg-slate-700 text-white shadow-lg' 
                  : 'bg-slate-800/80 hover:bg-slate-700 hover:text-white'
              }`}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-5 flex items-center justify-center">
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-1'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`} 
                />
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-1'
                  }`} 
                />
              </div>
            </button>
            {/* Mobile menu dropdown */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-72 lg:w-80 rounded-xl shadow-2xl border border-slate-600 bg-slate-900/95 backdrop-blur-md z-50 overflow-hidden max-h-[calc(100vh-8rem)]"
                  style={{ 
                    maxHeight: 'calc(100vh - 8rem)',
                    top: '100%',
                    right: '0'
                  }}
                >
                  <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                    <div className="px-4 pt-4 pb-4 space-y-1">
                      <Link 
                        to="/" 
                        onClick={() => toggleMobileMenu(false)}
                        className={`block px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 ${
                          activeLink === '/' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' : 'hover:bg-slate-800 hover:text-blue-300'
                        }`}
                      >
                        Home
                      </Link>
                      <Link 
                        to="/make-money-online" 
                        onClick={() => toggleMobileMenu(false)}
                        className={`block px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 ${
                          activeLink === '/make-money-online' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' : 'hover:bg-slate-800 hover:text-blue-300'
                        }`}
                      >
                        Make Money Online
                      </Link>
                      {userData?.isAccountVerified && (
                        <Link 
                          to="/dashboard" 
                          onClick={() => toggleMobileMenu(false)}
                          className={`block px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 ${
                            activeLink === '/dashboard' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' : 'hover:bg-slate-800 hover:text-blue-300'
                          }`}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link 
                        to="/about" 
                        onClick={() => toggleMobileMenu(false)}
                        className={`block px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 ${
                          activeLink === '/about' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' : 'hover:bg-slate-800 hover:text-blue-300'
                        }`}
                      >
                        About
                      </Link>
                      <Link 
                        to="/contact" 
                        onClick={() => toggleMobileMenu(false)}
                        className={`block px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 ${
                          activeLink === '/contact' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' : 'hover:bg-slate-800 hover:text-blue-300'
                        }`}
                      >
                        Contact
                      </Link>
                      <Link 
                        to="/faqs" 
                        onClick={() => toggleMobileMenu(false)}
                        className={`block px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 ${
                          activeLink === '/faqs' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' : 'hover:bg-slate-800 hover:text-blue-300'
                        }`}
                      >
                        FAQs
                      </Link>
                      
                      {/* User-specific menu items */}
                      {userData && (
                        <>
                          <div className="border-t border-slate-700 my-2"></div>
                          <Link 
                            to="/profile" 
                            onClick={() => toggleMobileMenu(false)}
                            className="block px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 hover:bg-slate-800 hover:text-blue-300"
                          >
                            Your Profile
                          </Link>
                          <button 
                            onClick={() => {
                              navigateToSecurity();
                              toggleMobileMenu(false);
                            }}
                            className="block w-full text-left px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 hover:bg-slate-800 hover:text-blue-300"
                          >
                            Security Settings
                          </button>
                          {userData?.isAdmin && (
                            <Link 
                              to="/admin/dashboard" 
                              onClick={() => toggleMobileMenu(false)}
                              className="block px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 hover:bg-slate-800 hover:text-blue-300"
                            >
                              Admin Portal
                            </Link>
                          )}
                          <div className="border-t border-slate-700 my-2"></div>
                          <button 
                            onClick={() => {
                              handleLogout();
                              toggleMobileMenu(false);
                            }}
                            className="block w-full text-left px-4 py-3 text-red-300 font-medium rounded-lg transition-colors duration-200 hover:bg-red-500/10 hover:text-red-200"
                          >
                            Logout
                          </button>
                        </>
                      )}
                      
                      {/* Auth buttons for non-logged in users */}
                      {!userData && (
                        <>
                          <div className="border-t border-slate-700 my-2"></div>
                          <Link 
                            to="/login" 
                            onClick={() => toggleMobileMenu(false)}
                            className="block px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 hover:bg-slate-800 hover:text-blue-300"
                          >
                            Login
                          </Link>
                          <Link 
                            to="/register" 
                            onClick={() => toggleMobileMenu(false)}
                            className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg transition-colors duration-200 hover:from-blue-700 hover:to-blue-800 text-center"
                          >
                            Register
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  )
}

// NavLink component for consistent styling
function NavLink({ to, children, isActive = false }) {
  return (
    <Link 
      to={to} 
      className={`relative px-4 py-2 text-white font-medium rounded-md transition-all duration-300 
        ${isActive 
          ? 'text-blue-400 bg-blue-500/10' 
          : 'hover:text-blue-400 hover:bg-blue-500/5'
        }`}
    >
      <span className="relative z-10">{children}</span>
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
      )}
    </Link>
  )
}

// Add prop validation
NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool
}

export default Navbar