/**
 * Create Tournament Button - Opens tournament form modal.
 */
import { motion } from 'framer-motion'

const CreateTournamentButton = ({ onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-6 py-3 bg-gradient-to-r from-neon-purple to-pink-500 rounded-lg font-semibold glow-button flex items-center space-x-2"
    >
      <span>+</span>
      <span>Create Tournament</span>
    </motion.button>
  )
}

export default CreateTournamentButton

