import { useEffect } from 'react';
import Navbar from '../components/navbar'
import InvestmentCard from '../components/InvestmentCard';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';

function Investments() {
  const { investments, fetchInvestments, isLoading } = useStore();

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Investments History</h1>
          <div className="space-x-4">
            <Link 
              to="/invest"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              New Investment
            </Link>
            
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : investments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            No investments found. Start investing now!
          </div>
        )}
      </div>
    </div>
  );
}

export default Investments; 