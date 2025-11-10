/**
 * CTA Section - "Get Early Access" button linking to Signup.
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const CTASection = () => {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto text-center"
      >
        <div className="glass rounded-2xl p-6 sm:p-8 md:p-12 max-w-3xl mx-auto border border-neon-purple/50">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
            Ready to Compete?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 mb-6 sm:mb-8">
            Join VinVerse today and be part of the future of esports gaming.
          </p>
          <p className="text-base sm:text-lg text-white/60 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Create tournaments, build your team, connect with players, get AI-powered insights, and dominate the arena.
          </p>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-neon-purple to-pink-500 rounded-lg text-base sm:text-lg font-semibold glow-button"
            >
              Get Early Access 🚀
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default CTASection

