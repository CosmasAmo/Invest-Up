import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import { fadeInUp } from '../utils/animations';
import { FaUsers, FaChartLine, FaHeadset } from 'react-icons/fa';

function About() {
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateStats(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { icon: <FaChartLine className="text-blue-400 text-4xl mb-2" />, value: "$500M+", label: "Trading Volume" },
    { icon: <FaUsers className="text-blue-400 text-4xl mb-2" />, value: "15K+", label: "Active Users" },
    { icon: <FaHeadset className="text-blue-400 text-4xl mb-2" />, value: "24/7", label: "Customer Support" }
  ];

  const timeline = [
    { year: 2016, title: "The Foundation of Success", description: "200 Bitcoins Purchased: In 2016, we took our first bold step by investing in 200 Bitcoins. This marked the beginning of our vision to create a platform that would revolutionize the trading industry." },
    { year: 2017, title: "Building the Future of Trading", description: "Investment Platform Launched: In 2017, we launched our investment platform, enabling traders and investors to join us in shaping the future of digital assets." },
    { year: 2018, title: "Expanding Horizons", description: "300 Bitcoins Raised: By 2018, our platform had gained significant traction, allowing us to raise an additional 300 Bitcoins. First Office in Dubai: We opened our first office in Dubai, a global hub for finance and innovation." },
    { year: 2022, title: "Going Global", description: "Grand Opening in Melbourne, Australia: In 2022, we celebrated a major milestone with the grand opening of our office in Melbourne, Australia." },
    { year: 2024, title: "A Global Powerhouse", description: "17+ Countries and Counting: Today, we are proud to operate in over 17 countries worldwide. 560+ Bitcoins Raised: With over 560 Bitcoins raised, our platform continues to thrive." }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* About Us Header */}
          <SectionHeader 
            title="About InvestUp Trading" 
            subtitle="We're on a mission to make cryptocurrency trading accessible, profitable, and secure for everyone."
          />
          
          {/* Mission & Vision */}
          <motion.div
            {...fadeInUp(0.2)}
            className="mb-20"
          >
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-8 md:p-12 backdrop-blur-sm border border-slate-700 shadow-xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="md:col-span-2">
                  <div className="flex flex-col space-y-12">
                    {/* Mission Section */}
                    <div className="relative">
                      <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                      <div className="pl-6">
                        <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500">Our Mission</h3>
                        <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                          At InvestUp Trading Company, our mission is to empower individuals to achieve financial growth by providing a secure, transparent, and innovative trading platform. We aim to simplify investing, offering users the opportunity to earn consistent daily profits while fostering financial literacy and confidence in the world of trading.
                        </p>
                      </div>
                    </div>
                    
                    {/* Vision Section */}
                    <div className="relative">
                      <div className="absolute -left-4 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                      <div className="pl-6">
                        <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-500">Our Vision</h3>
                        <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                          To become the most trusted and user-centric trading platform globally, revolutionizing the way people invest by delivering reliable, high-yield returns and cutting-edge tools that make wealth creation accessible to everyone.
                        </p>
                      </div>
                    </div>
                    
                    {/* Slogan Section */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative p-8 bg-slate-800/50 backdrop-blur-md rounded-xl border border-blue-500/30 shadow-lg overflow-hidden">
                        <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
                        <div className="absolute -left-12 -top-12 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
                        <p className="text-xl md:text-2xl font-semibold text-center text-white italic relative z-10">
                          &quot;Invest Smart, Earn Daily – Your Path to 5% Prosperity Starts Here!&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Stats Section */}
          <motion.div
            {...fadeInUp(0.3)}
            className="mb-20"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={animateStats ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700"
                  >
                    {stat.icon}
                    <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                    <p className="text-gray-300">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Timeline Section */}
          <motion.div
            {...fadeInUp(0.4)}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500">Our Journey: Empowering Traders Worldwide</h2>
            <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
              Join us as we take you through our remarkable journey of growth, innovation, and global expansion. From humble beginnings to becoming a global leader in the trading industry, we&apos;ve built a platform that empowers traders like you to thrive.
            </p>
            
            <div className="relative py-10">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
              <div className="md:hidden absolute left-6 top-0 h-full w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
              
              {/* Timeline events */}
              {timeline.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative mb-24 flex ${
                    index % 2 === 0 
                      ? 'md:flex-row-reverse' 
                      : 'md:flex-row'
                  }`}
                >
                  {/* Connector dots for desktop */}
                  <div className="hidden md:block absolute left-1/2 top-0 transform -translate-x-1/2 w-5 h-5 rounded-full bg-blue-300 z-10 mt-6"></div>
                  
                  {/* Year bubble for desktop */}
                  <div className="hidden md:flex absolute left-1/2 top-0 transform -translate-x-1/2 items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold z-20 shadow-xl border-2 border-slate-900 text-lg">
                    <div className="absolute w-full h-full rounded-full bg-blue-500 blur-md opacity-50"></div>
                    <span className="relative z-10">{event.year}</span>
                  </div>
                  
                  {/* Year bubble for mobile */}
                  <div className="md:hidden absolute left-6 top-0 transform -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold z-10 shadow-xl border-2 border-slate-900">
                    <div className="absolute w-full h-full rounded-full bg-blue-500 blur-md opacity-50"></div>
                    <span className="relative z-10">{event.year}</span>
                  </div>
                  
                  {/* Content for desktop */}
                  <div className="hidden md:block w-1/2 px-6">
                    <div className={`p-6 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/20 ${
                      index % 2 === 0 ? 'mr-12' : 'ml-12'
                    }`}>
                      <h3 className="text-xl font-bold text-blue-400 mb-2">{event.title}</h3>
                      <p className="text-gray-300">{event.description}</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:block w-1/2"></div>
                  
                  {/* Content for mobile */}
                  <div className="md:hidden ml-20 w-full">
                    <div className="p-6 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl hover:border-blue-500/50 transition-all duration-300">
                      <h3 className="text-xl font-bold text-blue-400 mb-2">{event.title}</h3>
                      <p className="text-gray-300">{event.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* End dot */}
              <div className="hidden md:block absolute left-1/2 bottom-0 transform -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 z-10">
                <div className="absolute w-full h-full rounded-full bg-blue-500 blur-md opacity-70"></div>
              </div>
              <div className="md:hidden absolute left-6 bottom-0 transform -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 z-10">
                <div className="absolute w-full h-full rounded-full bg-blue-500 blur-md opacity-70"></div>
              </div>
            </div>
          </motion.div>
          
          {/* Why Join Us Section */}
          <motion.div
            {...fadeInUp(0.5)}
            className="mb-20"
          >
            <div className="bg-slate-800/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm border border-slate-700">
              <h2 className="text-3xl font-bold mb-8 text-center">Why Join Us?</h2>
              <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
                Our journey is a testament to our vision, resilience, and commitment to empowering traders like you.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Proven Track Record", description: "From 200 Bitcoins in 2016 to 560+ Bitcoins today, our growth speaks for itself." },
                  { title: "Global Reach", description: "With a presence in 17+ countries, we bring world-class trading opportunities to your doorstep." },
                  { title: "Innovation at Heart", description: "We've consistently pushed boundaries to create a platform that's secure, user-friendly, and profitable." },
                  { title: "Community-Driven", description: "Your success is our success. Join a platform that values and supports its traders." }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    {...fadeInUp(0.2 + index * 0.1)}
                    className="p-6 bg-gradient-to-b from-slate-800 to-slate-800/50 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold text-blue-400 mb-3">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* CTA Section */}
          <motion.div
            {...fadeInUp(0.6)}
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
