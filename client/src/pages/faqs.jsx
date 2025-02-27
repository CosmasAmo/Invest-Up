import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';

function FAQs() {
  const [openSection, setOpenSection] = useState(null);

  const faqSections = [
    {
      title: "Deposits & Account Management",
      questions: [
        {
          q: "How do I deposit funds into my account?",
          a: `To deposit funds, log in to your account, navigate to the "Deposit" section, insert the amount you intend to deposit and copy the USDT wallet address.
              Go to an exchanger like binance and Coinbase and send money to that address.
              Screenshot the transaction and send it for confirmation. 
              Once your deposit is confirmed, your staking will begin, and you'll start earning daily profits.`
        },
        {
          q: "How to send money from one account to another on binance?",
          a: `1. On your binance homepage, click assets.
              2. Click withdraw and select the withdraw method.
              3. Select withdraw crypto or fiat
              4. In the search bar, type USDT and click okay.
              5. Withdraw options will show up:
              
              Option 1: Send via Crypto Network
              • This prompts you to paste the wallet address you copied from the website.
              • Note; the network you choose should be similar to the wallet address you copied.
              
              Option 2: Send via Email/Phone/ID (0 fee)
              • Set the mode to Binance ID
              • Paste the Binance ID you copied from our website and paste it there.
              • Take a screenshot after the transaction and send them on the website for proof.`
        },
        {
          q: "How to deposit money into your binance account?",
          a: "Please visit: https://www.binance.com/en/square/post/11630134353593"
        },
        {
          q: "How to deposit money into your Coinbase account?",
          a: "Please visit: https://www.coinbase.com/wallet/learn-web3/how-to-fund-your-coinbase-wallet"
        },
        {
          q: "What is the minimum deposit required to start earning?",
          a: "The minimum deposit required to start earning is 3 dollars. This allows you to participate in our staking program and earn up to 5% daily profits on your stake by clicking the invest button."
        },
        {
          q: "How do I create an account?",
          a: 'To create an account, simply click on the "Sign Up" button, provide the required information, and verify your email address. Once your account is set up, you can deposit funds and start earning.'
        }
      ]
    },
    {
      title: "Security & Safety",
      questions: [
        {
          q: "Is my investment safe?",
          a: "We prioritize the security of your funds. Our platform uses advanced encryption and security protocols to protect your assets. However, as with any investment, there are risks involved, and we encourage you to only invest what you can afford to lose."
        },
        {
          q: "What happens if I forget my password or lose access to my account?",
          a: 'If you lose access to your account, you can use the "Forgot Password" feature to reset your password.'
        },
        {
          q: "Can I lose my staked funds?",
          a: "While we take measures to protect your funds, no investment is entirely risk-free. Always invest responsibly and only what you can afford to lose."
        }
      ]
    },
    {
      title: "Withdrawals & Fees",
      questions: [
        {
          q: "Are there any fees for deposits or withdrawals?",
          a: "Deposits are free of charge. However, a small network fee may apply for withdrawals to cover transaction costs on the blockchain."
        },
        {
          q: "How long does it take to process withdrawals?",
          a: "Withdrawals are typically processed within 0 – 4 hours. However, processing times may vary depending on network congestion."
        },
        {
          q: "Is there a minimum or maximum withdrawal amount?",
          a: "The minimum withdrawal amount is 3$, and the maximum withdrawal amount per transaction is 100,000$ daily. These limits are in place to ensure smooth operations and security."
        }
      ]
    },
    {
      title: "Earnings & Profits",
      questions: [
        {
          q: "How are the 5% daily profits calculated?",
          a: "The 5% daily profit is calculated based on the amount you have staked. For example, if you stake 100$, you will earn 5$ daily."
        },
        {
          q: "When will I start earning profits after depositing?",
          a: "Earnings begin as soon as your deposit is confirmed on the blockchain. Profits are credited to your account daily and can be withdrawn or reinvested."
        },
        {
          q: "Can I reinvest my earnings to compound my profits?",
          a: 'Yes, you can reinvest your earnings to compound your profits. Simply navigate to the "Reinvest" section in your account and follow the instructions.'
        },
        {
          q: "What happens if the market is volatile?",
          a: "While we aim to provide consistent returns, cryptocurrency markets are inherently volatile. We manage risks through advanced risk management techniques, but profits are guaranteed."
        }
      ]
    },
    {
      title: "General Information",
      questions: [
        {
          q: "Do you have a referral program?",
          a: 'Yes, we offer a referral program where you can earn 10$ for every 3 users you refer who makes a deposit. Check the "Referral" section in your account for more details.'
        },
        {
          q: "Is this platform available in my country?",
          a: "Our services are available in most countries, but some regions may have restrictions due to local regulations. Please check your local laws before signing up."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about our platform, investment process, and security measures.
          </p>
        </motion.div>

        {/* FAQ Sections */}
        {faqSections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center">
              <span className="text-blue-500 mr-4">
                {sectionIndex === 0 ? "💳" : 
                 sectionIndex === 1 ? "🔒" : 
                 sectionIndex === 2 ? "💰" :
                 sectionIndex === 3 ? "📈" : "ℹ️"}
              </span>
              {section.title}
            </h2>

            <div className="space-y-4">
              {section.questions.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (sectionIndex * 0.1) + (index * 0.1) }}
                >
                  <button
                    onClick={() => setOpenSection(
                      openSection === `${sectionIndex}-${index}` ? null : `${sectionIndex}-${index}`
                    )}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    <span className="text-white font-medium">{faq.q}</span>
                    <span className={`text-blue-500 transform transition-transform duration-200 ${
                      openSection === `${sectionIndex}-${index}` ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </span>
                  </button>
                  
                  {openSection === `${sectionIndex}-${index}` && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 py-4 text-gray-300 border-t border-slate-700 whitespace-pre-line"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-blue-100 mb-8">
              Our support team is here to help you 24/7
            </p>
            <Link to="/contact" 
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg 
                  font-semibold hover:bg-blue-50 transition-all">
                Contact Support
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default FAQs;
