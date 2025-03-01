import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import axios from 'axios';

const Faqs = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [settings, setSettings] = useState({
    minWithdrawal: 3,
    minDeposit: 3,
    profitPercentage: 5
  });
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    // Fetch settings from the server
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings', { withCredentials: true });
        if (response.data.success) {
          setSettings({
            minWithdrawal: response.data.settings.minWithdrawal,
            minDeposit: response.data.settings.minDeposit,
            profitPercentage: response.data.settings.profitPercentage
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // If there's an error, we'll use the default values
      }
    };

    fetchSettings();
  }, []);

  // Set up FAQs after settings are loaded
  useEffect(() => {
    setFaqs([
      {
        question: "How do I deposit funds into my account?",
        answer: "To deposit funds, log in to your account, navigate to the 'Deposit' section, insert the amount you intend to deposit and copy the USDT wallet address. Go to an exchanger like Binance and Coinbase and send money to that address. Screenshot the transaction and send it for confirmation. Once your deposit is confirmed, your staking will begin, and you'll start earning daily profits."
      },
      {
        question: "How to send money from one account to another on Binance?",
        answer: "1. On your Binance homepage, click assets. 2. Click withdraw and select the withdraw method. 3. Select withdraw crypto or fiat. 4. In the search bar, type USDT and click okay. 5. Withdraw options will show up: a) Option 1: Send via Crypto Network - This prompts you to paste the wallet address you copied from the website. Note: the network you choose should be similar to the wallet address you copied. b) Send via Email/Phone/ID (0 fee) - Set the mode to Binance ID, paste the Binance ID you copied from our website. Take a screenshot after the transaction and send them on the website for proof."
      },
      {
        question: "How to deposit money into your Binance account?",
        answer: "Please refer to the official Binance guide: https://www.binance.com/en/square/post/11630134353593"
      },
      {
        question: "How to deposit money into your Coinbase account?",
        answer: "Please refer to the official Coinbase guide: https://www.coinbase.com/wallet/learn-web3/how-to-fund-your-coinbase-wallet"
      },
      {
        question: "What is the minimum deposit required to start earning?",
        answer: `The minimum deposit required to start earning is $${settings.minDeposit}. This ensures that your investment can generate meaningful returns.`
      },
      {
        question: "Are there any fees for deposits?",
        answer: "Deposits are free of charge. However, a small network fee may apply for withdrawals to cover transaction costs on the blockchain."
      },
      {
        question: "How long does it take to process withdrawals?",
        answer: "Withdrawals are typically processed within 0 – 4 hours. However, processing times may vary depending on network congestion."
      },
      {
        question: "Is there a minimum or maximum withdrawal amount?",
        answer: `The minimum withdrawal amount is $${settings.minWithdrawal}, and the maximum withdrawal amount per transaction is $100,000 daily. These limits are in place to ensure smooth operations and security.`
      },
      {
        question: "How are the 5% daily profits calculated?",
        answer: `The ${settings.profitPercentage}% daily profit is calculated based on the amount you have staked. For example, if you stake $100, you will earn $${(100 * settings.profitPercentage / 100).toFixed(2)} daily.`
      },
      {
        question: "How do I create an account?",
        answer: "To create an account, simply click on the \"Sign Up\" button, provide the required information, and verify your email address. Once your account is set up, you can deposit funds and start earning."
      },
      {
        question: "Is my investment safe?",
        answer: "We prioritize the security of your funds. Our platform uses advanced encryption and security protocols to protect your assets. However, as with any investment, there are risks involved, and we encourage you to only invest what you can afford to lose."
      },
      {
        question: "When will I start earning profits after depositing?",
        answer: "Earnings begin as soon as your deposit is confirmed on the blockchain. Profits are credited to your account daily and can be withdrawn or reinvested."
      },
      {
        question: "Can I reinvest my earnings to compound my profits?",
        answer: "Yes, you can reinvest your earnings to compound your profits. Simply navigate to the \"Reinvest\" section in your account and follow the instructions."
      },
      {
        question: "What happens if the market is volatile?",
        answer: "While we aim to provide consistent returns, cryptocurrency markets are inherently volatile. We manage risks through advanced risk management techniques, but profits are guaranteed."
      },
      {
        question: "Do you have a referral program?",
        answer: "Yes, we offer a referral program where you can earn 10$ for every 3 users you refer who makes a deposit. Check the \"Referral\" section in your account for more details."
      },
      {
        question: "Is this platform available in my country?",
        answer: "Our services are available in most countries, but some regions may have restrictions due to local regulations. Please check your local laws before signing up."
      },
      {
        question: "What happens if I forget my password or lose access to my account?",
        answer: "If you lose access to your account, you can use the \"Forgot Password\" feature to reset your password."
      },
      {
        question: "Can I lose my staked funds?",
        answer: "While we take measures to protect your funds, no investment is entirely risk-free. Always invest responsibly and only what you can afford to lose."
      }
    ]);
  }, [settings]);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div 
            className="text-center mb-16"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Frequently Asked Questions
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-600 mx-auto rounded-full"></div>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about our platform, deposits, withdrawals, and earnings.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
            variants={staggerContainer}
          >
            <motion.div 
              className="col-span-1 md:col-span-2 mb-8"
              variants={fadeIn}
            >
              <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-blue-400">Getting Started</h2>
                <div className="space-y-4">
                  {faqs.slice(0, 6).map((faq, index) => (
                    <motion.div 
                      key={index}
                      className="border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-blue-500"
                      variants={fadeIn}
                    >
                      <button
                        className="flex justify-between items-center w-full p-4 text-left focus:outline-none"
                        onClick={() => toggleAccordion(index)}
                      >
                        <span className="font-medium text-lg">{faq.question}</span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 ${activeIndex === index ? 'transform rotate-180 text-blue-400' : 'text-gray-400'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="p-4 pt-0 border-t border-gray-700 text-gray-300">
                          {faq.answer}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="col-span-1"
              variants={fadeIn}
            >
              <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl h-full">
                <h2 className="text-2xl font-bold mb-6 text-blue-400">Deposits & Withdrawals</h2>
                <div className="space-y-4">
                  {faqs.slice(6, 10).map((faq, index) => (
                    <motion.div 
                      key={index + 6}
                      className="border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-blue-500"
                      variants={fadeIn}
                    >
                      <button
                        className="flex justify-between items-center w-full p-4 text-left focus:outline-none"
                        onClick={() => toggleAccordion(index + 6)}
                      >
                        <span className="font-medium text-lg">{faq.question}</span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 ${activeIndex === index + 6 ? 'transform rotate-180 text-blue-400' : 'text-gray-400'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          activeIndex === index + 6 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="p-4 pt-0 border-t border-gray-700 text-gray-300">
                          {faq.answer}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="col-span-1"
              variants={fadeIn}
            >
              <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl h-full">
                <h2 className="text-2xl font-bold mb-6 text-blue-400">Earnings & Platform</h2>
                <div className="space-y-4">
                  {faqs.slice(10).map((faq, index) => (
                    <motion.div 
                      key={index + 10}
                      className="border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:border-blue-500"
                      variants={fadeIn}
                    >
                      <button
                        className="flex justify-between items-center w-full p-4 text-left focus:outline-none"
                        onClick={() => toggleAccordion(index + 10)}
                      >
                        <span className="font-medium text-lg">{faq.question}</span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 ${activeIndex === index + 10 ? 'transform rotate-180 text-blue-400' : 'text-gray-400'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          activeIndex === index + 10 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="p-4 pt-0 border-t border-gray-700 text-gray-300">
                          {faq.answer}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-16 text-center"
            variants={fadeIn}
          >
            <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
            <p className="text-gray-300 mb-6">Our support team is here to help you with any other questions you might have.</p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition-all duration-300"
            >
              Contact Support
              <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default Faqs;
