import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaChartLine, FaHistory, FaEdit, FaTrash, FaDollarSign, FaClock, FaStop, FaHandPaper } from 'react-icons/fa';

function InvestmentCard({ investment, onEdit, onDelete, onStopInvestment }) {
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
      case 'stopped':
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

  // Ensure status is never undefined for display purposes
  const safeStatus = investment.status || 'unknown';
  const statusStyle = getStatusColor(safeStatus);
  const formattedDate = new Date(investment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Calculate daily profit
  const dailyProfit = (parseFloat(investment.amount) * (parseFloat(investment.dailyProfitRate || 5) / 100)).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg overflow-hidden border 
        border-indigo-900/50 hover:border-indigo-800 transition-all duration-300`}
    >
      {/* Stop badge - show if investment status is stopped */}
      {safeStatus === 'stopped' && (
        <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 font-bold text-sm rounded-bl-lg z-10 flex items-center">
          <FaHandPaper className="mr-1 h-3 w-3" />
          STOPPED
        </div>
      )}
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2.5 rounded-lg mr-3 ${statusStyle.icon}`}>
              <FaChartLine className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Investment</h3>
              <p className="text-sm text-slate-400">{formattedDate}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
              {safeStatus 
                ? safeStatus === 'approved' 
                  ? 'Active' 
                  : safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1) 
                : 'Unknown'}
            </span>
            
            {/* Action buttons */}
            <div className="flex space-x-2">
              {safeStatus === 'pending' && (
                <>
                  <button
                    onClick={() => onEdit(investment)}
                    className="p-1.5 rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                    title="Edit Investment"
                  >
                    <FaEdit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(investment)}
                    className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                    title="Delete Investment"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              
              {safeStatus === 'approved' && (
                <button
                  onClick={() => onStopInvestment(investment)}
                  className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors flex items-center"
                  title="Stop Investment"
                >
                  <FaStop className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">Stop Investment</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Investment Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <FaDollarSign className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <p className="text-xs text-slate-400">Amount</p>
            </div>
            <p className="text-xl font-semibold text-white">${parseFloat(investment.amount).toFixed(2)}</p>
          </div>
          
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="flex items-center mb-1">
              <FaChartLine className="w-3.5 h-3.5 text-green-400 mr-1.5" />
              <p className="text-xs text-slate-400">Daily Profit</p>
            </div>
            <p className="text-xl font-semibold text-green-400">+${dailyProfit}</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4">
          {investment.totalProfit ? (
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <FaChartLine className="w-3.5 h-3.5 text-green-400 mr-1.5" />
                <p className="text-xs text-slate-400">Total Profit</p>
              </div>
              <p className="text-xl font-semibold text-green-400">+${parseFloat(investment.totalProfit).toFixed(2)}</p>
            </div>
          ) : null}
          
          {investment.duration ? (
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <FaClock className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                <p className="text-xs text-slate-400">Duration</p>
              </div>
              <p className="text-xl font-semibold text-white">{investment.duration} Days</p>
            </div>
          ) : null}
        </div>

        {/* Package Info */}
        {investment.package && (
          <div className="mt-4 flex items-center text-sm text-slate-400">
            <FaHistory className="mr-1.5 h-3.5 w-3.5" />
            <span>{investment.package}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

InvestmentCard.propTypes = {
  investment: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onStopInvestment: PropTypes.func
};

export default InvestmentCard; 