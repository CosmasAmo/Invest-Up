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
      className={`${statusStyle.bg} border ${statusStyle.border} rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full ${statusStyle.icon} flex items-center justify-center mr-3`}>
            <FaWallet className={`h-5 w-5 ${statusStyle.text}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Withdrawal</h3>
            <p className="text-gray-400 text-sm">
              {withdrawal.transactionId || `ID: ${withdrawal.id.substring(0, 8)}...`}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
          </span>
          
          {/* Edit and Delete buttons for pending withdrawals */}
          {withdrawal.status === 'pending' && (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(withdrawal)}
                className="p-1.5 rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                title="Edit Withdrawal"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(withdrawal)}
                className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                title="Delete Withdrawal"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Amount</p>
          <p className="text-xl font-semibold text-white">${parseFloat(withdrawal.amount).toFixed(2)}</p>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Payment Method</p>
          <p className="text-white">{withdrawal.paymentMethod || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 p-3 rounded-lg mb-4">
        <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
        <p className="text-white break-all text-sm">{withdrawal.walletAddress}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
        <div className="flex items-center">
          <FaCalendarAlt className="mr-1 h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
        
        <div className="flex items-center">
          <FaExchangeAlt className="mr-1 h-3 w-3" />
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