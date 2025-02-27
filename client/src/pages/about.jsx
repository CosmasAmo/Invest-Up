import { motion } from 'framer-motion';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';

function About() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <motion.div 
        className="relative h-[40vh] bg-gradient-to-r from-blue-600/20 to-blue-900/20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center">
          <div>
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              About InvestUp Trading
            </motion.h1>
            <motion.div 
              className="w-24 h-1 bg-blue-600 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            ></motion.div>
          </div>
        </div>
      </motion.div>

      <main className="relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mission & Vision Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Mission Card */}
            <motion.div
              {...fadeIn}
              className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-xl hover:shadow-blue-500/10 transition-shadow duration-500"
            >
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">🎯</span>
                <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                At InvestUp Trading Company, our mission is to empower individuals to achieve financial growth by providing a secure, transparent, and innovative trading platform. We aim to simplify investing, offering users the opportunity to earn consistent daily profits while fostering financial literacy and confidence in the world of trading.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-xl hover:shadow-blue-500/10 transition-shadow duration-500"
            >
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">👁️</span>
                <h2 className="text-3xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">
                To become the most trusted and user-centric trading platform globally, revolutionizing the way people invest by delivering reliable, high-yield returns and cutting-edge tools that make wealth creation accessible to everyone.
              </p>
            </motion.div>
          </div>

          {/* Statistics Section */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { number: "10K", label: "Active Users" },
                { number: "$600M+", label: "Trading Volume" },
                { number: "17+", label: "Countries" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-slate-900 rounded-2xl p-8 text-center border border-slate-800">
                    <h3 className="text-4xl font-bold text-white mb-2">{stat.number}</h3>
                    <p className="text-blue-300">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Slogan Section */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-center transform hover:scale-[1.02] transition-transform duration-300">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Our Slogan
              </h2>
              <p className="text-2xl md:text-3xl text-white font-semibold italic">
                &quot;Invest Smart, Earn Daily. Your Path to 5% Prosperity Starts Here!&quot;
              </p>
            </div>
          </motion.div>

          {/* Timeline Section */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.8 }}
            className="mb-20"
          >
            <div className="bg-slate-800/50 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-slate-700">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                Our Journey Through Time
              </h2>
              
              <div className="relative">
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-600 to-blue-800"></div>
                
                {[
                  {
                    year: "2016",
                    title: "The Foundation of Success",
                    content: "200 Bitcoins Purchased: In 2016, we took our first bold step by investing in 200 Bitcoins. This marked the beginning of our vision to create a platform that would revolutionize the trading industry."
                  },
                  {
                    year: "2017",
                    title: "Building the Future of Trading",
                    content: "Investment Platform Launched: In 2017, we launched our investment platform, enabling traders and investors to join us in shaping the future of digital assets."
                  },
                  {
                    year: "2018",
                    title: "Expanding Horizons",
                    content: "300 Bitcoins Raised and First Office in Dubai: Our platform gained significant traction, raising 300 Bitcoins and establishing our presence in the Middle East."
                  },
                  {
                    year: "2022",
                    title: "Going Global",
                    content: "Grand Opening in Melbourne, Australia: We celebrated a major milestone with our expansion into the Asia-Pacific region."
                  },
                  {
                    year: "2024",
                    title: "A Global Powerhouse",
                    content: "17+ Countries and 560+ Bitcoins: Today, we operate globally with a diverse community of traders and continued growth."
                  }
                ].map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    className={`relative flex ${
                      index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                    } items-start mb-16 ${
                      index % 2 === 0 ? 'md:ml-auto md:pl-16' : 'md:w-1/2 md:pr-16'
                    }`}
                  >
                    <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-800"></div>
                    <div className="bg-slate-700/50 rounded-xl p-6 backdrop-blur-sm border border-slate-600 hover:border-blue-500 transition-colors duration-300">
                      <div className="text-blue-400 font-bold mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                      <p className="text-gray-300">{milestone.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Why Join Us Section */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 1 }}
            className="mb-20"
          >
            <div className="bg-slate-800/50 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-slate-700">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                Why Choose InvestUp Trading?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: "📈",
                    title: "Proven Track Record",
                    description: "From 200 Bitcoins in 2016 to 560+ Bitcoins today, our growth speaks for itself."
                  },
                  {
                    icon: "🌍",
                    title: "Global Reach",
                    description: "With a presence in 17+ countries, we bring world-class trading opportunities to your doorstep."
                  },
                  {
                    icon: "💡",
                    title: "Innovation at Heart",
                    description: "We've consistently pushed boundaries to create a platform that's secure, user-friendly, and profitable."
                  },
                  {
                    icon: "🤝",
                    title: "Community-Driven",
                    description: "Your success is our success. Join a platform that values and supports its traders."
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-700/30 rounded-xl p-8 backdrop-blur-sm border border-slate-600 hover:border-blue-500 transition-all duration-300"
                  >
                    <span className="text-4xl mb-4 block">{feature.icon}</span>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            {...fadeIn}
            transition={{ delay: 1.2 }}
            className="mb-20"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-700">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Be Part of Our Next Chapter
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  The future of trading is here, and we want you to be part of it. Whether you&apos;re a seasoned trader or just starting out, our platform offers the tools, resources, and community you need to succeed.
                </p>
                <Link to="/register" 
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg 
                  font-semibold hover:bg-blue-50 transition-all">
                Create Free Account
              </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default About;
