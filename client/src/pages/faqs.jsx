import { motion } from 'framer-motion'
import { useState } from 'react'
import Navbar from '../components/navbar'

function FAQs() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "What is cryptocurrency trading?",
          answer: "Cryptocurrency trading involves buying and selling digital currencies on various exchanges to make a profit. It's similar to trading stocks, but with digital assets that operate on blockchain technology."
        },
        {
          question: "How do I create an account?",
          answer: "Creating an account is simple. Click the 'Sign Up' button, provide your name, email, and create a secure password. You'll receive a verification code to your email to complete the registration process."
        },
        {
          question: "How does the email verification process work?",
          answer: "After registering, we'll send a verification code to your email address. Enter this code on our platform to verify your account. This helps ensure the security of your account and confirms your email address."
        },
        {
          question: "What if I don't receive the verification email?",
          answer: "If you haven't received the verification email, first check your spam folder. You can request a new verification code from the verification page or contact our support team for assistance."
        }
      ]
    },
    {
      category: "Deposits & Profits",
      questions: [
        {
          question: "How do I make a deposit?",
          answer: "1) Log into your dashboard and click the 'Deposit' button, 2) Choose your preferred cryptocurrency (BTC, USDT, or ETH), 3) Copy the provided deposit address, 4) Go to your preferred platform (e.g., Binance) and send the funds to this address, 5) Take a screenshot of the transaction as proof, 6) Upload the screenshot through our platform for verification by admin."
        },
        {
          question: "What cryptocurrencies do you accept for deposits?",
          answer: "We currently accept Bitcoin (BTC), Tether (USDT), and Ethereum (ETH) for deposits. Make sure to use the correct address for each cryptocurrency to avoid loss of funds."
        },
        {
          question: "How does the profit system work?",
          answer: "Once you've made a deposit and your investment is confirmed, you'll earn a 6% daily profit. This profit will automatically accumulate and be visible on your dashboard."
        },
        {
          question: "When do profits start accumulating?",
          answer: "Your 6% daily profits start accumulating immediately after your deposit is confirmed by our admin. You can track your earnings in real-time through your dashboard."
        },
        {
          question: "Why do I need to provide proof of payment?",
          answer: "Proof of payment (screenshot) helps us verify your deposit and ensures proper crediting to your account. This security measure protects both you and our platform from unauthorized transactions."
        }
      ]
    },
    {
      category: "Account Security & Password",
      questions: [
        {
          question: "I forgot my password. How do I reset it?",
          answer: "To reset your password: 1) Click 'Forgot Password' on the login page, 2) Enter your registered email address, 3) Check your email for an OTP (One-Time Password) code, 4) Enter the OTP code on the reset page, 5) Create and confirm your new password."
        },
        {
          question: "What if I don't receive the password reset OTP?",
          answer: "First, check your spam folder. If you still don't see it, you can click 'Resend OTP' on the reset password page. The new code will invalidate any previous codes sent. If issues persist, contact our support team."
        },
        {
          question: "How long is the password reset OTP valid?",
          answer: "The password reset OTP is valid for 10 minutes. If you don't complete the reset process within this time, you'll need to request a new OTP code."
        },
        {
          question: "What are the requirements for a new password?",
          answer: "Your password must be at least 8 characters long and include: 1) At least one uppercase letter, 2) At least one lowercase letter, 3) At least one number, 4) At least one special character (!@#$%^&*)"
        }
      ]
    },
    {
      category: "Security & Support",
      questions: [
        {
          question: "How secure is your platform?",
          answer: "We implement bank-grade security measures including 2FA, cold storage for assets, regular security audits, and encryption. Our platform is protected against DDoS attacks and has never been compromised."
        },
        {
          question: "What should I do if someone else tries to reset my password?",
          answer: "If you receive a password reset OTP that you didn't request, your account may be targeted. Don't share the code with anyone, change your password immediately, and contact our support team to report the incident."
        },
        {
          question: "How can I contact customer support?",
          answer: "Our support team is available 24/7 through multiple channels: live chat, email, phone, and ticket system. We're here to help with any questions about deposits, profits, or account issues."
        }
      ]
    }
  ]

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
      text-white">
      <Navbar />
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent 
              bg-gradient-to-r from-blue-400 to-blue-600">
              Frequently Asked Questions
            </h1>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our platform, trading processes, 
              and security measures.
            </p>
          </motion.div>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {faqs.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                className="bg-slate-800 rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-2xl font-bold mb-6 text-blue-400">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, index) => {
                    const globalIndex = categoryIndex * 10 + index
                    return (
                      <div
                        key={index}
                        className="border-b border-slate-700 last:border-0 pb-4 last:pb-0"
                      >
                        <button
                          onClick={() => handleToggle(globalIndex)}
                          className="w-full text-left py-4 flex justify-between items-center 
                            hover:text-blue-400 transition-colors"
                        >
                          <span className="text-lg font-medium pr-8">{faq.question}</span>
                          <svg
                            className={`w-6 h-6 transform transition-transform 
                              ${openIndex === globalIndex ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 
                            ${openIndex === globalIndex ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <p className="text-gray-300 pb-4 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 text-center bg-slate-800 rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-300 mb-6">
              Our support team is here to help you 24/7
            </p>
            <a
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 
                rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default FAQs 