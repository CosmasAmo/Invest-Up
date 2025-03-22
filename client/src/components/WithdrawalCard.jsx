import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaWallet, FaCalendarAlt, FaEdit, FaTrash, FaExchangeAlt } from 'react-icons/fa';

function WithdrawalCard({ withdrawal, onEdit, onDelete }) {
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

  const statusStyle = getStatusColor(withdrawal.status);
  const formattedDate = new Date(withdrawal.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${statusStyle.bg} border ${statusStyle.border} rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
        <div className="flex items-center">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${statusStyle.icon} flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0`}>
            <FaWallet className={`h-4 w-4 sm:h-5 sm:w-5 ${statusStyle.text}`} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white">Withdrawal</h3>
            <p className="text-gray-400 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-full">
              {withdrawal.transactionId || `ID: ${withdrawal.id.substring(0, 8)}...`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} whitespace-nowrap`}>
            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
          </span>
          
          {/* Action buttons */}
          {withdrawal.status === 'pending' && (
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => onEdit(withdrawal)}
                className="p-1.5 rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                title="Edit Withdrawal"
                aria-label="Edit Withdrawal"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(withdrawal)}
                className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                title="Delete Withdrawal"
                aria-label="Delete Withdrawal"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {/* Delete button for approved withdrawals */}
          {withdrawal.status === 'approved' && (
            <button
              onClick={() => onDelete(withdrawal)}
              className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
              title="Delete Withdrawal"
              aria-label="Delete Withdrawal"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-800/50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-0.5 sm:mb-1">Amount</p>
          <p className="text-base sm:text-xl font-semibold text-white">${parseFloat(withdrawal.amount).toFixed(2)}</p>
        </div>
        <div className="bg-slate-800/50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-0.5 sm:mb-1">Payment Method</p>
          <p className="text-sm sm:text-base text-white truncate">{withdrawal.paymentMethod || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 p-2 sm:p-3 rounded-lg mb-3">
        <p className="text-xs text-gray-400 mb-0.5 sm:mb-1">Wallet Address</p>
        <p className="text-xs sm:text-sm text-white break-all">{withdrawal.walletAddress}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-400 mt-3 gap-2">
        <div className="flex items-center">
          <FaCalendarAlt className="mr-1 h-3 w-3 flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
        
        <div className="flex items-center">
          <FaExchangeAlt className="mr-1 h-3 w-3 flex-shrink-0" />
          <span>Fee: ${withdrawal.fee || '2.00'}</span>
        </div>
      </div>
    </motion.div>
  );
}

WithdrawalCard.propTypes = {
  withdrawal: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default WithdrawalCard; 