import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { fadeInUp } from '../utils/animations';

function SectionHeader({ title, subtitle, centered = true }) {
  return (
    <motion.div
      {...fadeInUp()}
      className={`mb-12 lg:mb-16 ${centered ? 'text-center' : ''}`}
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
        {title}
      </h2>
      <div className={`w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 ${centered ? 'mx-auto' : ''} mb-6 lg:mb-8`}></div>
      {subtitle && <p className="text-gray-300 max-w-2xl lg:max-w-3xl mx-auto text-sm lg:text-base">{subtitle}</p>}
    </motion.div>
  );
}

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  centered: PropTypes.bool
};

export default SectionHeader; 