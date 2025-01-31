import {  useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore  from '../store/useStore';
import { Link } from 'react-router-dom'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import Logo from './Logo';

function Navbar() {
  const navigate = useNavigate();
  const { 
    userData,
    isScrolled,
    isMobileMenuOpen,
    setIsScrolled,
    toggleMobileMenu: setIsMobileMenuOpen,
    logout,
    messages,
    fetchUserMessages
  } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);

    // Fetch messages periodically
    const fetchMessages = async () => {
      await fetchUserMessages();
    };
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [setIsScrolled, fetchUserMessages]);

  // Get initial letter safely
  const getInitial = () => {
    if (userData && userData.name) {
      return userData.name[0].toUpperCase();
    }
    return '?';
  };

  const navItems = [
    {
      label: 'Messages',
      path: '/messages',
      icon: EnvelopeIcon,
      showBadge: messages?.some(m => m.status === 'replied' && !m.isRead),
      badgeCount: messages?.filter(m => m.status === 'replied' && !m.isRead).length || 0,
    }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
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
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.showBadge && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badgeCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {userData ? (
              <div className="relative group">
                <div className="w-10 h-10 flex justify-center items-center
                  rounded-full bg-blue-600 text-white cursor-pointer">
                  {getInitial()}
                </div>
                <div className="absolute opacity-0 invisible group-hover:opacity-100 
                  group-hover:visible right-0 mt-2 w-48 bg-white rounded-md 
                  shadow-lg py-1 z-50 transition-all duration-200">
                  <Link to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 
                    hover:bg-gray-100 w-full text-left">
                    Profile
                  </Link>
                  {userData.isAdmin && (
                    <Link to="/admin/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 
                      hover:bg-gray-100 w-full text-left">
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={logout}
                    className="block px-4 py-2 text-sm text-gray-700 
                    hover:bg-gray-100 w-full text-left">
                    Logout
                  </button>
                </div>
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
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link to="/" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Home</Link>
          {userData?.isAccountVerified && (
            <Link to="/dashboard" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Dashboard</Link>
          )}
          <Link to="/about" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">About</Link>
          <Link to="/contact" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Contact</Link>
          <Link to="/faqs" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">FAQs</Link>
          {userData ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.showBadge && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              ))}
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 text-white hover:bg-blue-600 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Login</Link>
              <Link to="/register" className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar