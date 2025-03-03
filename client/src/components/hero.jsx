import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fadeInUp } from '../utils/animations'
import PropTypes from 'prop-types'

function Hero({ 
	title = "Invest in Your Future with Crypto",
	subtitle = "Join our platform to earn competitive returns through expert crypto trading strategies",
	showButtons = true,
	backgroundClass = "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
}) {
	return (
		<section className={`relative pt-32 pb-24 overflow-hidden ${backgroundClass}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					{...fadeInUp()}
					className="text-center"
				>
					<h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
						{title}
					</h1>
					<p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
						{subtitle}
					</p>
					
					{showButtons && (
						<motion.div
							{...fadeInUp(0.4)}
							className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
						>
							<Link
								to="/register"
								className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full
									transition-all duration-300 inline-block text-lg font-semibold"
							>
								Start Investing Now
							</Link>
							<Link
								to="/about"
								className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500/10 px-8 py-3 rounded-full
									transition-all duration-300 inline-block text-lg font-semibold"
							>
								Learn More
							</Link>
						</motion.div>
					)}
				</motion.div>
			</div>
		</section>
	)
}

Hero.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	showButtons: PropTypes.bool,
	backgroundClass: PropTypes.string
}

export default Hero 