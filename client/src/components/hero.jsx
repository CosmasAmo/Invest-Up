import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { fadeInUp } from '../utils/animations'
import PropTypes from 'prop-types'
import { TypeAnimation } from 'react-type-animation'

function Hero({ 
	title = "Make Money Online with Smart Investments",
	subtitle = "Join thousands of users who earn daily profits through our secure investment platform. Start your journey to financial freedom today!",
	showButtons = true,
	backgroundClass = "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900",
	animateTitle = true
}) {
	return (
		<section className={`relative pt-32 pb-24 overflow-hidden ${backgroundClass}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					{...fadeInUp()}
					className="text-center"
				>
					<h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
						{animateTitle ? (
							<TypeAnimation
								sequence={[
									title,
									2000,
									"Earn Passive Income Daily",
									2000,
									"Achieve Financial Freedom",
									2000
								]}
								wrapper="span"
								speed={50}
								repeat={Infinity}
							/>
						) : title}
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
								className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-full
									transition-all duration-300 inline-block text-lg font-semibold shadow-lg hover:shadow-blue-600/20"
							>
								Start Earning Now
							</Link>
							<Link
								to="/about"
								className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500/10 px-8 py-3 rounded-full
									transition-all duration-300 inline-block text-lg font-semibold"
							>
								How It Works
							</Link>
						</motion.div>
					)}
				</motion.div>
				
				{/* SEO-friendly content section */}
				<motion.div
					{...fadeInUp(0.6)}
					className="mt-16 text-center max-w-4xl mx-auto"
				>
					<div className="grid md:grid-cols-3 gap-8 text-left">
						<div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
							<h3 className="text-xl font-bold text-blue-400 mb-3">Passive Income</h3>
							<p className="text-gray-300">Earn money online while you sleep. Our platform works 24/7 to generate profits for you.</p>
						</div>
						<div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
							<h3 className="text-xl font-bold text-blue-400 mb-3">Daily Profits</h3>
							<p className="text-gray-300">Watch your money grow daily with our transparent investment strategies and profit sharing.</p>
						</div>
						<div className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
							<h3 className="text-xl font-bold text-blue-400 mb-3">Financial Freedom</h3>
							<p className="text-gray-300">Join thousands who have achieved financial independence through our proven system.</p>
						</div>
					</div>
				</motion.div>
			</div>
			
			{/* Background elements */}
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
				<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
				<div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
			</div>
		</section>
	)
}

Hero.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	showButtons: PropTypes.bool,
	backgroundClass: PropTypes.string,
	animateTitle: PropTypes.bool
}

export default Hero 