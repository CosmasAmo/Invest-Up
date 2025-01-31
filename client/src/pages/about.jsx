import Navbar from '../components/navbar'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { UserGroupIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline'

function About() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const milestones = [
    { year: '2018', event: 'Company Founded' },
    { year: '2019', event: 'Launched Trading Platform' },
    { year: '2020', event: 'Reached 1000+ Users' },
    { year: '2021', event: 'Expanded Global Operations' },
    { year: '2022', event: 'Advanced AI Trading Integration' }
  ]

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      image: '/team1.jpg',
      bio: '15+ years in crypto trading and investment management'
    },
    {
      name: 'Lisa Chen',
      role: 'Chief Trading Officer',
      image: '/team2.jpg',
      bio: 'Former Wall Street trader with expertise in risk management'
    },
    {
      name: 'Mark Wilson',
      role: 'Head of Technology',
      image: '/team3.jpg',
      bio: 'Tech veteran specializing in blockchain and security'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <main ref={ref} className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            style={{ y }}
            className="text-center mb-24"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent 
              bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              Our Story
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-12"></div>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Founded in 2023, we set out to revolutionize cryptocurrency trading by making
              it accessible, secure, and profitable for everyone. Our team of experts combines
              decades of experience in finance, technology, and blockchain.
            </p>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-3 gap-12 mb-24"
          >
            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
              transition-all duration-300">
              <UserGroupIcon className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Community First</h3>
              <p className="text-gray-300">
                We believe in building a strong, supportive community of traders who help
                each other succeed.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
              transition-all duration-300">
              <GlobeAltIcon className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Global Access</h3>
              <p className="text-gray-300">
                Our platform is available worldwide, making cryptocurrency trading accessible
                to everyone, everywhere.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-blue-500/10 
              transition-all duration-300">
              <SparklesIcon className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Innovation</h3>
              <p className="text-gray-300">
                We continuously innovate and improve our platform to provide the best
                trading experience.
              </p>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-4 gap-8 mb-24 text-center"
          >
            <div className="bg-slate-800/50 p-8 rounded-xl">
              <h4 className="text-4xl font-bold text-blue-400 mb-2">100K+</h4>
              <p className="text-gray-300">Active Users</p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-xl">
              <h4 className="text-4xl font-bold text-blue-400 mb-2">$50M+</h4>
              <p className="text-gray-300">Trading Volume</p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-xl">
              <h4 className="text-4xl font-bold text-blue-400 mb-2">50+</h4>
              <p className="text-gray-300">Countries</p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-xl">
              <h4 className="text-4xl font-bold text-blue-400 mb-2">24/7</h4>
              <p className="text-gray-300">Support</p>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-24"
          >
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 
                bg-blue-600/20"></div>
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center mb-8 
                  ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="bg-slate-800 p-6 rounded-xl shadow-lg w-96 relative"
                  >
                    <div className="absolute top-1/2 transform -translate-y-1/2 
                      w-4 h-4 bg-blue-600 rounded-full
                      ${index % 2 === 0 ? '-right-8' : '-left-8'}"></div>
                    <h3 className="text-xl font-bold text-blue-400 mb-2">{milestone.year}</h3>
                    <p className="text-gray-300">{milestone.event}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">Our Leadership Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.05, delay: index * 0.2 }}
                  className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg 
                    hover:shadow-blue-500/10 transition-all duration-100"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-blue-400 mb-4">{member.role}</p>
                    <p className="text-gray-300">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default About 