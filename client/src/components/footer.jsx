import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTwitter,
  FaLinkedinIn,
  FaTelegram,
  FaDiscord,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';

function Footer() {
  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Investments', path: '/investments' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQs', path: '/faqs' }
  ];

  const socialLinks = [
    { icon: <FaTwitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <FaLinkedinIn size={20} />, href: '#', label: 'LinkedIn' },
    { icon: <FaTelegram size={20} />, href: '#', label: 'Telegram' },
    { icon: <FaDiscord size={20} />, href: '#', label: 'Discord' }
  ];

  const contactInfo = [
    { icon: <FaPhoneAlt />, text: '+1 (555) 123-4567' },
    { icon: <FaEnvelope />, text: 'support@investup.com' },
    { icon: <FaMapMarkerAlt />, text: 'New York, NY 10001, USA' }
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 
                  rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">IU</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Invest Up</h3>
                  <p className="text-sm text-blue-400">Trading Company</p>
                </div>
              </motion.div>
            </Link>
            <p className="text-gray-400 mb-6">
              Your trusted partner in cryptocurrency trading. We provide professional 
              investment services with transparent operations and competitive returns.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center
                    text-gray-400 hover:text-blue-400 hover:bg-slate-700 transition-all"
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-400">
                  <span className="w-5 h-5 text-blue-400">{info.icon}</span>
                  {info.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Invest Up Trading Company. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-400">
              <Link to="/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 