// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fadeInUp } from '../utils/animations'
import { Helmet } from 'react-helmet'

import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'


function MakeMoneyOnline() {
  const [minDeposit, setMinDeposit] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch minimum deposit amount from settings
    const fetchMinDeposit = async () => {
      try {
        setIsLoading(true);
        // Try to get the settings, but don't require authentication
        const response = await axios.get('/api/settings/public', { withCredentials: true });
        if (response.data.success) {
          setMinDeposit(response.data.settings.minDeposit);
        }
      } catch (error) {
        console.error('Error fetching minimum deposit:', error);
        // Keep using the default value (3) if there's an error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinDeposit();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Helmet>
        <title>Make Money Online | InvestUp - Your Path to Financial Freedom</title>
        <meta name="description" content="Discover how to make money online with InvestUp. Our platform offers secure investment opportunities with daily profits and minimal effort." />
        <meta name="keywords" content="make money online, passive income, online earnings, investment platform, daily profits, financial freedom, earn money from home" />
        <link rel="canonical" href="https://investuptrading.com/make-money-online" />
      </Helmet>
      
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp()}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                  Make Money Online
                </span> With Minimal Effort
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                Join thousands of users who are already generating passive income through our secure investment platform. Start your journey to financial freedom today!
              </p>
              
              <motion.div
                {...fadeInUp(0.4)}
                className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
              >
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-full
                    transition-all duration-300 inline-block text-lg font-semibold shadow-lg hover:shadow-blue-600/20"
                >
                  Start Earning Now
                </Link>
                <Link
                  to="/about"
                  className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500/10 px-8 py-3 rounded-full
                    transition-all duration-300 inline-block text-lg font-semibold"
                >
                  How It Works
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp()}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                How to <span className="text-blue-500">Make Money Online</span> with InvestUp
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our platform makes it easy to generate passive income with just a few simple steps
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <motion.div
                {...fadeInUp(0.2)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                  transition-all duration-300 border border-slate-700/50 backdrop-blur-sm"
              >
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">1. Create an Account</h3>
                <p className="text-gray-300">
                  Sign up for free in less than 2 minutes. All you need is an email address to get started on your journey to make money online.
                </p>
              </motion.div>
              
              <motion.div
                {...fadeInUp(0.4)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                  transition-all duration-300 border border-slate-700/50 backdrop-blur-sm"
              >
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <ChartBarIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">2. Make a Deposit</h3>
                <p className="text-gray-300">
                  Fund your account with as little as ${isLoading ? '...' : minDeposit}. We accept multiple cryptocurrency payment methods including USDT, BTC, and ETH.
                </p>
              </motion.div>
              
              <motion.div
                {...fadeInUp(0.6)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                  transition-all duration-300 border border-slate-700/50 backdrop-blur-sm"
              >
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">3. Create an Investment</h3>
                <p className="text-gray-300">
                  Choose how much to invest from your deposited funds. Our platform automatically allocates your investment to generate maximum returns.
                </p>
              </motion.div>
              
              <motion.div
                {...fadeInUp(0.8)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                  transition-all duration-300 border border-slate-700/50 backdrop-blur-sm"
              >
                <div className="bg-blue-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <ClockIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">4. Watch Your Money Grow</h3>
                <p className="text-gray-300">
                  Sit back and relax as our expert system generates daily profits for you. Monitor your earnings in real-time on your dashboard.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 z-0"></div>
          <div className="absolute inset-0 opacity-10 bg-grid-pattern z-0"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              {...fadeInUp()}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Why Choose InvestUp to <span className="text-blue-500">Make Money Online</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our platform offers unique advantages that make earning passive income easier than ever
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                {...fadeInUp(0.2)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                  transition-all duration-300 border border-slate-700/50 backdrop-blur-sm"
              >
                <ShieldCheckIcon className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Secure & Transparent</h3>
                <p className="text-gray-300">
                  Your investments are protected with bank-grade security. We provide full transparency on all transactions and earnings.
                </p>
              </motion.div>
              
              <motion.div
                {...fadeInUp(0.4)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                  transition-all duration-300 border border-slate-700/50 backdrop-blur-sm"
              >
                <UserGroupIcon className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Community Support</h3>
                <p className="text-gray-300">
                  Join thousands of users who are already making money online with our platform. Share strategies and success stories.
                </p>
              </motion.div>
              
              <motion.div
                {...fadeInUp(0.6)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
                  transition-all duration-300 border border-slate-700/50 backdrop-blur-sm"
              >
                <GlobeAltIcon className="w-12 h-12 text-blue-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Available Worldwide</h3>
                <p className="text-gray-300">
                  Make money online from anywhere in the world. Our platform is accessible globally with 24/7 customer support.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp()}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Success Stories from People <span className="text-blue-500">Making Money Online</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Hear from our users who have achieved financial freedom through our platform
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                {...fadeInUp(0.2)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg border border-slate-700/50 backdrop-blur-sm"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    JD
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-bold">Melokuhle Joshua</h4>
                    <p className="text-gray-400">Investor since 2022</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  &quot;I&apos;ve been looking for ways to make money online for years. InvestUp is the first platform that actually delivered on its promises. I&apos;m now earning $500 weekly in passive income.&quot;
                </p>
              </motion.div>
              
              <motion.div
                {...fadeInUp(0.4)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg border border-slate-700/50 backdrop-blur-sm"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    MS
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-bold">Noah Williams</h4>
                    <p className="text-gray-400">Investor since 2021</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  &quot;As a busy mom, I needed a way to make money online without spending hours on the computer. InvestUp has been perfect - I deposit funds and watch them grow daily.&quot;
                </p>
              </motion.div>
              
              <motion.div
                {...fadeInUp(0.6)}
                className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg border border-slate-700/50 backdrop-blur-sm"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    RJ
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-bold">Charlotte Spencer</h4>
                    <p className="text-gray-400">Investor since 2023</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  &quot;I was skeptical at first, but after seeing my first month&apos;s returns, I was convinced. The platform is easy to use and the customer support is excellent. Highly recommended!&quot;
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-700/80 z-0"></div>
          <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              {...fadeInUp()}
              className="text-center bg-gradient-to-r from-blue-600 to-blue-800 p-12 rounded-3xl shadow-xl"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Start Making Money Online?
              </h2>
              <p className="text-xl text-gray-100 max-w-3xl mx-auto mb-8">
                Join thousands of satisfied users who are earning passive income every day. 
                It only takes 2 minutes to get started with just ${minDeposit}.
              </p>
              <Link
                to="/register"
                className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 rounded-full
                  transition-all duration-300 inline-block text-lg font-semibold shadow-lg hover:shadow-white/20"
              >
                Create Your Free Account
              </Link>
            </motion.div>
          </div>
        </section>
        
        {/* FAQ Summary Section */}
        <section className="py-20 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp()}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Have Questions About <span className="text-blue-500">Making Money Online</span>?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We&apos;ve compiled a comprehensive FAQ section to answer all your questions about our platform
              </p>
            </motion.div>
            
            <motion.div
              {...fadeInUp(0.3)}
              className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800 to-slate-800/80 p-8 rounded-2xl shadow-lg border border-slate-700/50 backdrop-blur-sm"
            >
              <div className="flex items-start">
                <QuestionMarkCircleIcon className="w-12 h-12 text-blue-500 mr-6 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                  <p className="text-gray-300 mb-6">
                    Our FAQ section covers everything from how to get started, cryptocurrency deposit methods, withdrawal processes, 
                    security measures, and more. Find answers to common questions like:
                  </p>
                  <ul className="text-gray-300 space-y-2 mb-8">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      How much money can I make online with InvestUp?
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      What&apos;s the minimum amount to start making money online?
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Which cryptocurrencies can I use to make deposits?
                    </li>
                  </ul>
                  <Link
                    to="/faqs"
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg
                      transition-all duration-300 font-medium shadow-md hover:shadow-blue-600/20"
                  >
                    View Complete FAQs
                    <svg className="ml-2 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default MakeMoneyOnline 