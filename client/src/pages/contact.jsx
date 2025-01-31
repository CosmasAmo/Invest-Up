import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'react-toastify';
import Navbar from '../components/navbar'
import useStore from '../store/useStore'

function Contact() {
  const { submitMessage, isLoading } = useStore()
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    const success = await submitMessage(formData)
    if (success) {
      toast.success('Message sent successfully')
      setFormData({
        subject: '',
        message: ''
      })
    }
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
              bg-gradient-to-r from-blue-400 to-blue-600">Get in Touch</h1>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Have questions about our platform? We&apos;re here to help 24/7. Reach out to us
              through any of our channels below.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-slate-800 p-8 rounded-2xl shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg
                      text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Message subject"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg
                      text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Your message"
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full
                      transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </motion.form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-slate-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Global Offices</h2>
                <div className="space-y-6">
                  {/* Add office information here */}
                </div>
              </div>

              <div className="bg-slate-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
                <div className="space-y-2 text-gray-300">
                  <p>Monday - Friday: 24/7</p>
                  <p>Saturday: 9:00 AM - 5:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map or Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-slate-800 p-8 rounded-2xl shadow-lg"
          >
            
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact 