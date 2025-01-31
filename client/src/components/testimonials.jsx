import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

function Testimonials() {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Long-term Investor",
      image: "/testimonial1.jpg",
      quote: "The returns I've received through this platform have exceeded my expectations. The team's expertise in crypto is evident."
    },
    {
      name: "Michael Chen",
      role: "Business Owner",
      image: "/testimonial2.jpg",
      quote: "Transparent, professional, and reliable. I've been investing here for over a year and couldn't be happier with the results."
    },
    {
      name: "Emma Davis",
      role: "Financial Analyst",
      image: "/testimonial3.jpg",
      quote: "As someone from the financial sector, I appreciate their risk management approach and consistent returns."
    }
  ]

  return (
    <section id="testimonials" className="py-20 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Clients Say
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </motion.div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          className="pb-12"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-slate-700 p-6 rounded-lg h-full"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-white font-semibold">{testimonial.name}</h3>
                    <p className="text-blue-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300">"{testimonial.quote}"</p>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default Testimonials 