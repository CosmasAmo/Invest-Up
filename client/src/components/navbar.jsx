import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { Link } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaShieldAlt, FaUserShield, FaChartLine, FaWallet, FaExchangeAlt, FaChevronDown } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import axios from 'axios'

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
          <div className="hidden md:flex items-center space-x-2">
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
                        src={userData.profileImage.startsWith('http') 
                          ? userData.profileImage 
                          : `${axios.defaults.baseURL}${userData.profileImage}`}
                        alt="Profile" 
                        className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shadow-md"
                        onError={(e) => {
                          console.error('Profile image failed to load in navbar:', e);
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.style.display = 'none'; // Hide the broken image
                          // Replace with initials
                          e.target.parentNode.innerHTML = `
                            <div class="w-9 h-9 flex justify-center items-center
                              rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md">
                              ${getInitial()}
                            </div>
                          `;
                        }}
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
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center">
                          {userData.profileImage ? (
                            <img 
                              src={userData.profileImage.startsWith('http') 
                                ? userData.profileImage 
                                : `${axios.defaults.baseURL}${userData.profileImage}`}
                              alt="Profile" 
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                            />
                          ) : (
                            <div className="w-12 h-12 flex justify-center items-center
                              rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                              {getInitial()}
                            </div>
                          )}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-white">{userData.name}</p>
                            <p className="text-xs text-gray-400 truncate">{userData.email}</p>
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
                      
                      {userData?.isAdmin && (
                        <div className="py-1 border-t border-slate-700">
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
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-5">
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-2' : 'rotate-0'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`} 
                  style={{ top: '0.5rem' }}
                />
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-2' : 'rotate-0'
                  }`} 
                  style={{ top: '1rem' }}
                />
              </div>
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
                  className={`block px-4 py-2.5 text-white font-medium rounded-lg transition-colors duration-200 ${
                    activeLink === '/' ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-blue-600/20'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/make-money-online" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-white font-medium rounded-lg transition-colors duration-200 ${
                    activeLink === '/make-money-online' ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-blue-600/20'
                  }`}
                >
                  Make Money Online
                </Link>
                {userData?.isAccountVerified && (
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 text-white font-medium rounded-lg transition-colors duration-200 ${
                      activeLink === '/dashboard' ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-blue-600/20'
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
                <Link 
                  to="/about" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-white font-medium rounded-lg transition-colors duration-200 ${
                    activeLink === '/about' ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-blue-600/20'
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-white font-medium rounded-lg transition-colors duration-200 ${
                    activeLink === '/contact' ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-blue-600/20'
                  }`}
                >
                  Contact
                </Link>
                <Link 
                  to="/faqs" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-white font-medium rounded-lg transition-colors duration-200 ${
                    activeLink === '/faqs' ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-blue-600/20'
                  }`}
                >
                  FAQs
                </Link>
                
                {userData ? (
                  <>
                    <div className="pt-4 pb-2 border-t border-slate-700/50">
                      <div className="flex items-center px-4">
                        {userData.profileImage ? (
                          <img 
                            src={userData.profileImage.startsWith('http') 
                              ? userData.profileImage 
                              : `${axios.defaults.baseURL}${userData.profileImage}`}
                            alt="Profile" 
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = `
                                <div class="w-10 h-10 flex justify-center items-center
                                  rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                                  ${getInitial()}
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 flex justify-center items-center
                            rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                            {getInitial()}
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">{userData.name}</p>
                          <p className="text-xs text-gray-400 truncate">{userData.email}</p>
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
                      
                      {userData?.isAdmin && (
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
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center px-4 py-2.5 text-base font-medium text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200 w-full"
                      >
                        <FaSignOutAlt className="mr-3 h-5 w-5 text-red-400" />
                        Logout
                      </button>
                    </div>
                    </div>
                  </>
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