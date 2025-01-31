import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="relative"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-blue-600 
          rounded-lg transform rotate-45 flex items-center justify-center">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-900 rounded-lg transform -rotate-45 
            flex items-center justify-center">
            <span className="text-lg md:text-xl font-bold text-blue-500">IU</span>
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"></div>
      </motion.div>
      <div className="hidden sm:block">
        <h1 className="text-xl md:text-2xl font-bold text-white">Invest Up</h1>
        <p className="text-xs text-blue-400 -mt-1">Trading Company</p>
      </div>
    </Link>
  );
}

export default Logo; 