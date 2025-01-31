import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { toast } from 'react-toastify'
import useStore from '../store/useStore'

function Contact() {
  const { submitMessage } = useStore()
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.subject || !formData.message) {
      toast.error('Please fill in all fields')
      return
    }
    
    const success = await submitMessage({
      subject: formData.subject,
      message: formData.message
    })
    
    if (success) {
      toast.success('Message sent successfully! We will contact you soon.')
      setFormData({ subject: '', message: '' })
    }
  }

  return (
    <section id="contact" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Have questions about our investment platform? We're here to help.
            Fill out the form below and we'll get back to you shortly.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
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
              ></textarea>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full
                  transition-all duration-300 transform hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  )
}

export default Contact 