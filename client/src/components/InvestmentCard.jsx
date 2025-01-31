import { motion } from 'framer-motion';

function InvestmentCard({ investment }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center">
        <span className="text-xl text-white font-semibold">
          ${parseFloat(investment.amount).toFixed(2)}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(investment.status)}`}>
          {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 text-gray-400">
        <div className="flex justify-between">
          <span>Daily Profit Rate:</span>
          <span className="text-green-400">{investment.dailyProfitRate}%</span>
        </div>
        <div className="flex justify-between">
          <span>Daily Return:</span>
          <span className="text-green-400">
            ${investment.dailyReturn.toFixed(2)}
          </span>
        </div>
        {investment.status === 'approved' && (
          <div className="flex justify-between">
            <span>Total Profit Earned:</span>
            <span className="text-green-400">
              ${parseFloat(investment.totalProfit).toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{new Date(investment.createdAt).toLocaleDateString()}</span>
        </div>
        {investment.lastProfitUpdate && (
          <div className="flex justify-between">
            <span>Last Profit Update:</span>
            <span>{new Date(investment.lastProfitUpdate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default InvestmentCard; 