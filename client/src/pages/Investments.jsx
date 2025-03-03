import { useEffect } from 'react';
import Navbar from '../components/navbar'
import InvestmentCard from '../components/InvestmentCard';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';

function Investments() {
  const { investments, fetchInvestments, isLoading } = useStore();

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      <Navbar />
      
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Investments History</h1>
          <Link 
            to="/invest"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base w-full sm:w-auto text-center"
          >
            New Investment
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : investments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {investments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No investments found. Start investing now!
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Investments; 