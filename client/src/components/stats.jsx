import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'

function Stats() {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  const stats = [
    { number: 5000, label: 'Registered Clients', suffix: '+' },
    { number: 25, label: 'Expert Traders', suffix: '+' },
    { number: 98, label: 'Satisfaction Rate', suffix: '%' },
    { number: 10, label: 'Years Experience', suffix: '+' }
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {inView && (
                  <CountUp
                    end={stat.number}
                    duration={2.5}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <p className="text-blue-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats 