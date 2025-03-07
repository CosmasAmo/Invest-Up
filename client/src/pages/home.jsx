import Navbar from '../components/navbar'
import { motion } from 'framer-motion'
import { ChartBarIcon, ShieldCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import Footer from '../components/footer'
import { useInView } from 'react-intersection-observer'
import Hero from '../components/hero'
import SectionHeader from '../components/SectionHeader'
import { fadeInUp } from '../utils/animations'
import { TypeAnimation } from 'react-type-animation'
import { useState, useEffect } from 'react'

function Home() {
  const [tradingVolume, setTradingVolume] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    if (statsInView) {
      // Animate trading volume from 0 to 500
      const tradingVolumeInterval = setInterval(() => {
        setTradingVolume(prev => {
          if (prev < 500) {
            return prev + 5;
          }
          clearInterval(tradingVolumeInterval);
          return 500;
        });
      }, 10);

      // Animate active users from 0 to 15
      const activeUsersInterval = setInterval(() => {
        setActiveUsers(prev => {
          if (prev < 15) {
            return prev + 0.15;
          }
          clearInterval(activeUsersInterval);
          return 15;
        });
      }, 10);

      return () => {
        clearInterval(tradingVolumeInterval);
        clearInterval(activeUsersInterval);
      };
    }
  }, [statsInView]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <section className="py-24 bg-slate-800/50 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-24 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <SectionHeader 
              title="Our Features" 
              subtitle={
                <TypeAnimation
                  sequence={[
                    'Discover the tools that make our platform stand out',
                    2000,
                    'Advanced features designed for maximum returns',
                    2000,
                    'Secure, transparent, and profitable investment options',
                    2000,
                    'Discover the tools that make our platform stand out',
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={0}
                />
              }
            />
            <motion.div
              {...fadeInUp(0.2)}
              className="grid md:grid-cols-3 gap-12"
            >
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                transition-all duration-300 border border-slate-700/50 backdrop-blur-sm">
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <ChartBarIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Advanced Analytics</h3>
                <p className="text-gray-300">
                  Real-time market analysis and AI-powered trading signals to help you make
                  informed decisions.
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                transition-all duration-300 border border-slate-700/50 backdrop-blur-sm">
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Bank-Grade Security</h3>
                <p className="text-gray-300">
                  Your assets are protected with military-grade encryption and multi-layer
                  security protocols.
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                transition-all duration-300 border border-slate-700/50 backdrop-blur-sm">
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
                </div>
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
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              {...fadeInUp(0.4)}
              className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-center shadow-xl border border-blue-500/20"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                <TypeAnimation
                  sequence={[
                    'Ready to Start Trading?',
                    2000,
                    'Want to Grow Your Wealth?',
                    2000,
                    'Looking for Financial Freedom?',
                    2000,
                    'Ready to Start Trading?',
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={0}
                />
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of traders who have already discovered the power of our
                platform. Get started today with a free account.
              </p>
              <Link to="/register" 
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg 
                  font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-white/20">
                Create Free Account
              </Link>
            </motion.div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section ref={statsRef} className="py-16 bg-slate-800/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp(0.2)}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg border border-slate-700/50 backdrop-blur-sm text-center">
                <h3 className="text-5xl font-bold text-white mb-2">${Math.floor(tradingVolume)}M+</h3>
                <p className="text-blue-400 font-medium">Trading Volume</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg border border-slate-700/50 backdrop-blur-sm text-center">
                <h3 className="text-5xl font-bold text-white mb-2">{Math.floor(activeUsers)}K+</h3>
                <p className="text-blue-400 font-medium">Active Users</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg border border-slate-700/50 backdrop-blur-sm text-center">
                <h3 className="text-5xl font-bold text-white mb-2">24/7</h3>
                <p className="text-blue-400 font-medium">Customer Support</p>
              </div>
            </motion.div>
          </div>
        </section>
        
        <ContactSection />
        
      </main>

      <Footer />  
    </div>
  )
}

function ContactSection() {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  return (
    <section id="contact" className="py-20 bg-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-64 h-64 bg-blue-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get in Touch
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mb-8"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            <TypeAnimation
              sequence={[
                "Have questions about our investment platform? We're here to help.",
                2000,
                "Our support team is available 24/7 to assist you with any inquiries.",
                2000,
                "Reach out to us and start your journey to financial freedom today.",
                2000,
                "Have questions about our investment platform? We're here to help.",
              ]}
              wrapper="span"
              speed={50}
              repeat={0}
            />
          </p>
          
          <div className="mt-10">
            <Link
              to="/contact"
              className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Contact Our Team
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-xl backdrop-blur-sm border border-slate-700/50 shadow-lg">
              <div className="text-blue-400 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Email Us</h3>
              <p className="text-gray-300">support@yourplatform.com</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-xl backdrop-blur-sm border border-slate-700/50 shadow-lg">
              <div className="text-blue-400 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Support Hours</h3>
              <p className="text-gray-300">24/7 Customer Support</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-xl backdrop-blur-sm border border-slate-700/50 shadow-lg">
              <div className="text-blue-400 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Location</h3>
              <p className="text-gray-300">Melbourne, Australia</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Home