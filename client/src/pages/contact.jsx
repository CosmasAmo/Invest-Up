import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'react-toastify'
import Navbar from '../components/navbar'
import useStore from '../store/useStore'

function Contact() {
  const { submitMessage } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const success = await submitMessage(formData)
      if (success) {
        toast.success('Message sent successfully! We will contact you via email.')
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              Get in Touch
            </h1>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about our platform? Our team is here to help you 24/7.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-slate-800/50 p-8 rounded-2xl backdrop-blur-sm"
            >
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-blue-400 mb-2">Email</h3>
                  <p className="text-gray-300">support@yourplatform.com</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-400 mb-2">Office Hours</h3>
                  <p className="text-gray-300">24/7 Customer Support</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-400 mb-2">Location</h3>
                  <p className="text-gray-300">Your Company Address</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-slate-800/50 p-8 rounded-2xl backdrop-blur-sm"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1 block w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="mt-1 block w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Message'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact 