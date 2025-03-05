import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaMoneyBillWave, FaCalendarAlt, FaFileImage, FaExternalLinkAlt } from 'react-icons/fa';

function DepositCard({ deposit }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          icon: 'bg-green-900/50'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          icon: 'bg-yellow-900/50'
        };
      case 'rejected':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: 'bg-red-900/50'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          icon: 'bg-gray-900/50'
        };
    }
  };

  const statusStyle = getStatusColor(deposit.status);
  const formattedDate = new Date(deposit.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${statusStyle.bg} border ${statusStyle.border} rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full ${statusStyle.icon} flex items-center justify-center ${statusStyle.text} mr-3`}>
            <FaMoneyBillWave className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              ${parseFloat(deposit.amount).toFixed(2)}
            </h3>
            <div className="flex items-center text-slate-400 text-sm mt-1">
              <FaCalendarAlt className="h-3 w-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
          {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center text-slate-300">
          <span className="text-slate-400 mr-2">Method:</span>
          <span className="font-medium">{deposit.paymentMethod}</span>
        </div>
        
        {deposit.proofImage && (
          <a
            href={`http://localhost:5000/uploads/${deposit.proofImage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 mt-2"
          >
            <FaFileImage className="mr-2" />
            <span>View Proof</span>
            <FaExternalLinkAlt className="ml-1 h-3 w-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

// Add PropTypes validation
DepositCard.propTypes = {
  deposit: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    createdAt: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    proofImage: PropTypes.string
  }).isRequired
};

export default DepositCard;