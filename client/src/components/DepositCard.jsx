import { motion } from 'framer-motion';

function DepositCard({ deposit }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-500 bg-green-500/20';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'rejected':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">
            ${parseFloat(deposit.amount).toFixed(2)}
          </h3>
          <p className="text-gray-400 text-sm">
            {new Date(deposit.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(deposit.status)}`}>
          {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-gray-400 text-sm">
          Method: {deposit.paymentMethod}
        </p>
        {deposit.proofImage && (
          <a
            href={`http://localhost:5000/uploads/${deposit.proofImage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View Proof
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default DepositCard;