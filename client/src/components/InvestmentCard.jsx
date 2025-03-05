import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaChartLine, FaCalendarAlt, FaMoneyBillWave, FaHistory } from 'react-icons/fa';

function InvestmentCard({ investment }) {
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

  const statusStyle = getStatusColor(investment.status);
  const formattedDate = new Date(investment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Calculate daily profit
  const dailyProfit = (parseFloat(investment.amount) * 0.05).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${statusStyle.bg} border ${statusStyle.border} rounded-xl p-6 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full ${statusStyle.icon} flex items-center justify-center ${statusStyle.text} mr-3`}>
            <FaChartLine className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              ${parseFloat(investment.amount).toFixed(2)}
            </h3>
            <div className="flex items-center text-slate-400 text-sm mt-1">
              <FaCalendarAlt className="h-3 w-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
          {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-3 pt-3 border-t border-slate-700/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <FaMoneyBillWave className="h-4 w-4 mr-2 text-green-400" />
            <span>Profit Rate:</span>
          </div>
          <span className="text-green-400 font-medium">5% / day</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <FaChartLine className="h-4 w-4 mr-2 text-blue-400" />
            <span>Daily Return:</span>
          </div>
          <span className="text-green-400 font-medium">${dailyProfit}</span>
        </div>
        
        {investment.status === 'approved' && (
          <div className="flex justify-between items-center">
            <div className="flex items-center text-slate-300">
              <FaMoneyBillWave className="h-4 w-4 mr-2 text-purple-400" />
              <span>Total Profit:</span>
            </div>
            <span className="text-green-400 font-medium">${parseFloat(investment.totalProfit || 0).toFixed(2)}</span>
          </div>
        )}
        
        {investment.lastProfitUpdate && (
          <div className="flex justify-between items-center">
            <div className="flex items-center text-slate-300">
              <FaHistory className="h-4 w-4 mr-2 text-slate-400" />
              <span>Last Update:</span>
            </div>
            <span className="text-slate-300 text-sm">
              {new Date(investment.lastProfitUpdate).toLocaleDateString()}
              <span className="text-slate-500 ml-1 text-xs">
                {new Date(investment.lastProfitUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </span>
          </div>
        )}
      </div>
      
      {investment.status === 'approved' && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-900/30 rounded-lg">
          <p className="text-sm text-green-300 flex items-start">
            <FaChartLine className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              This investment is generating ${dailyProfit} in profit every day.
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

InvestmentCard.propTypes = {
  investment: PropTypes.shape({
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    status: PropTypes.string.isRequired,
    totalProfit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    createdAt: PropTypes.string.isRequired,
    lastProfitUpdate: PropTypes.string
  }).isRequired
};

export default InvestmentCard; 