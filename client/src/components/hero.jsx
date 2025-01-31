import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import { assets } from '../assets/assets'

const slides = [
	{ image: assets.graphs, alt: 'Crypto Trading' },
	{ image: assets.bitcoin, alt: 'Bitcoin Investment' },
	{ image: assets.graph2, alt: 'Crypto Growth' },
	{ image: assets.coins, alt: 'Crypto Growth' }
]

function Hero() {
	return (
		<div className="relative ">
			<Swiper
				modules={[Autoplay, EffectFade]}
				effect="fade"
				autoplay={{ delay: 3000 }}
				loop={true}
				className="absolute inset-0"
				
			>
				{slides.map((slide, index) => (
					<SwiperSlide key={index}>
						<div className="relative h-[calc(100vh-10rem)] mt-16 py-20">
							<img
								src={slide.image}
								alt={slide.alt}
								className="absolute inset-0 w-full h-full object-cover"
							/>
							<div className="absolute inset-0 bg-black/0" />
						</div>
					</SwiperSlide>
				))}
			</Swiper>

			<div className="relative z-10 h-full flex items-center justify-center px-4 py-6">
				<div className="text-center">
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-4xl md:text-6xl font-bold text-white mb-6"
					>
						Invest in Your Future with Crypto
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
					>
						Join our platform to earn competitive returns through expert crypto trading strategies
					</motion.p>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						<a
							href="#contact"
							className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full
								transition-all duration-300 inline-block text-lg font-semibold"
						>
							Start Investing Now
						</a>
					</motion.div>
				</div>
			</div>
		</div>
	)
}

export default Hero 