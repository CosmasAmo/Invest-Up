import Navbar from '../components/navbar'
import { motion } from 'framer-motion'
import { ArrowRightIcon, ChartBarIcon, ShieldCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import Footer from '../components/footer'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent 
                bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                Welcome to<br />Invest Up Trading
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Start earning 5% profits on your stake by signing up on our platform today.
              Experience the future of cryptocurrency investment with our AI-driven solutions that put you at the forefront of market opportunities.

              </p>
              <div className="flex justify-center gap-6">
                <Link to="/register" 
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white 
                    font-semibold transition-all flex items-center gap-2">
                  Get Started <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link to="/about" 
                  className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white 
                    font-semibold transition-all">
                  Learn More
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-12"
            >
              <div className="bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                transition-all duration-300">
                <ChartBarIcon className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Advanced Analytics</h3>
                <p className="text-gray-300">
                  Real-time market analysis and AI-powered trading signals to help you make
                  informed decisions.
                </p>
              </div>
              <div className="bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                transition-all duration-300">
                <ShieldCheckIcon className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Bank-Grade Security</h3>
                <p className="text-gray-300">
                  Your assets are protected with military-grade encryption and multi-layer
                  security protocols.
                </p>
              </div>
              <div className="bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                transition-all duration-300">
                <CurrencyDollarIcon className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Smart Trading</h3>
                <p className="text-gray-300">
                  Automated trading strategies and portfolio management to maximize your
                  returns.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of traders who have already discovered the power of our
                platform. Get started today with a free account.
              </p>
              <Link to="/register" 
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg 
                  font-semibold hover:bg-blue-50 transition-all">
                Create Free Account
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />  
    </div>
  )
}

export default Home