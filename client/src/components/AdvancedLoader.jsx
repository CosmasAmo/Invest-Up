import React from 'react';
import { motion } from 'framer-motion';

const AdvancedLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear"
          }}
          className="absolute w-24 h-24 rounded-full border-t-2 border-r-2 border-blue-500 opacity-70"
        />
        
        {/* Inner pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          }}
          className="absolute w-16 h-16 rounded-full border-2 border-indigo-400 border-dashed"
        />

        {/* Center glow */}
        <motion.div 
          animate={{ scale: [0.8, 1, 0.8], opacity: [0.8, 1, 0.8] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
          className="w-8 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"
        />
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-blue-400 font-medium tracking-widest uppercase text-sm"
      >
        {message}
      </motion.p>
      
      {/* Loading dots */}
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
            className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

export default AdvancedLoader;
