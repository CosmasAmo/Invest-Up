import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import PropTypes from 'prop-types';

// Simplified features list for the left panel
const features = [
  {
    title: "Secure Investments",
    description: "Your funds are protected with bank-level security."
  },
  {
    title: "Passive Income",
    description: "Earn daily returns on your investments."
  }
];

const AuthLayout = ({ children, title, subtitle, isRegister = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Link 
        to="/"
        className="absolute left-5 top-3 flex items-center text-white hover:text-blue-300 transition-colors z-10"
      >
        <FaArrowLeft className="mr-2" />
        <span>Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl mt-10 sm:mt-0"
      >
        {/* Left Panel - Simplified Features - Hidden on mobile */}
        <motion.div 
          className="bg-gradient-to-br from-blue-800 to-indigo-900 p-6 lg:p-8 lg:w-4/12 flex-col justify-between hidden md:flex"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div>
            <motion.h2 
              className="text-2xl font-bold text-white mb-4"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Welcome
            </motion.h2>
            
            <div className="space-y-4">
              <AnimatePresence>
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-3 border border-blue-700/50"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + (index * 0.1), duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-blue-200 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          <motion.div 
            className="mt-6 text-center"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <p className="text-blue-200 text-sm">
              {isRegister ? "Already have an account?" : "Don't have an account?"}
            </p>
            <Link 
              to={isRegister ? "/login" : "/register"} 
              className="inline-block mt-2 text-white font-medium border border-blue-500 rounded-lg px-4 py-1.5 hover:bg-blue-800 transition-colors text-sm"
            >
              {isRegister ? "Sign In" : "Create Account"}
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Right Panel - Auth Form */}
        <motion.div 
          className="bg-slate-800 p-6 lg:p-8 md:w-full lg:w-8/12"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Mobile-only navigation between login/register */}
          <div className="md:hidden flex justify-center mb-4">
            <Link 
              to={isRegister ? "/login" : "/register"} 
              className="text-white font-medium border border-blue-500 rounded-lg px-4 py-1.5 hover:bg-blue-800 transition-colors text-sm"
            >
              {isRegister ? "Sign In Instead" : "Create Account Instead"}
            </Link>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <motion.h2 
                className="text-2xl font-bold text-white"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {title}
              </motion.h2>
              <motion.p 
                className="mt-1 text-sm text-blue-200"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {subtitle}
              </motion.p>
            </div>
            
            {children}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  isRegister: PropTypes.bool
};

export default AuthLayout; 