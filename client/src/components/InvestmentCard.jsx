import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

function InvestmentCard({ investment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 p-6 rounded-lg shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          ${parseFloat(investment.amount).toFixed(2)}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            investment.status === 'pending'
              ? 'bg-yellow-500/20 text-yellow-500'
              : investment.status === 'approved'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'
          }`}
        >
          {investment.status}
        </span>
      </div>

      <div className="space-y-2 text-gray-400">
        <div className="flex justify-between">
          <span>Profit Rate:</span>
          <span className="text-green-400">5% / day</span>
        </div>
        <div className="flex justify-between">
          <span>Expected Return per day:</span>
          <span className="text-green-400">
            ${(parseFloat(investment.amount) * 0.05).toFixed(2)}
          </span>
        </div>
        {investment.status === 'approved' && (
          <div className="flex justify-between">
            <span>Total Profit Earned:</span>
            <span className="text-green-400">
              ${parseFloat(investment.totalProfit || 0).toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{new Date(investment.createdAt).toLocaleString()}</span>
        </div>
        {investment.lastProfitUpdate && (
          <div className="flex justify-between">
            <span>Last Profit Update:</span>
            <span>{new Date(investment.lastProfitUpdate).toLocaleString()}</span>
          </div>
        )}
      </div>
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