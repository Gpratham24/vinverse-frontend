/**
 * Tournament Card - Displays tournament information with action buttons.
 * Shows Join/View buttons based on user role (creator vs participant).
 */
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

const TournamentCard = ({ tournament, onEdit, onDelete, onJoin, onLeave, onViewParticipants, onViewDetails }) => {
  const { user } = useAuth()
  const isCreator = tournament.is_creator || (tournament.created_by?.id === user?.id)
  const isJoined = tournament.is_joined
  
  // Format date for display
  const formattedDate = tournament.date
    ? new Date(tournament.date).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'TBD'

  // Format prize pool
  const formattedPrize = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(tournament.prize_pool || 0)

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="glass rounded-xl p-4 sm:p-6 border border-neon-purple/30 h-full flex flex-col"
    >
      {/* Tournament Header */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white break-words">{tournament.name}</h3>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <span className="px-2 sm:px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-xs sm:text-sm font-semibold">
            {tournament.game}
          </span>
          {tournament.participant_count > 0 && (
            <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm">
              {tournament.participant_count} joined
            </span>
          )}
        </div>
      </div>

      {/* Tournament Details */}
      <div className="flex-1 space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        <div className="flex items-center text-white/70 text-sm sm:text-base">
          <span className="mr-2">📅</span>
          <span className="break-words">{formattedDate}</span>
        </div>
        <div className="flex items-center text-white/70 text-sm sm:text-base">
          <span className="mr-2">💰</span>
          <span className="font-semibold text-green-400">{formattedPrize}</span>
        </div>
        {tournament.created_by && (
          <div className="flex items-center text-white/60 text-xs sm:text-sm">
            <span className="mr-2">👤</span>
            <span className="break-words">Created by {tournament.created_by.username}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2 pt-3 sm:pt-4 border-t border-white/10">
        {isCreator ? (
          // Creator actions: View Participants, Edit, Delete
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewParticipants(tournament)}
              className="w-full px-3 sm:px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-xs sm:text-sm transition-colors"
            >
              View Participants ({tournament.participant_count || 0})
            </motion.button>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(tournament)}
                className="flex-1 px-3 sm:px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-lg text-xs sm:text-sm transition-colors"
              >
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(tournament.id)}
                className="flex-1 px-3 sm:px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-xs sm:text-sm transition-colors"
              >
                Delete
              </motion.button>
            </div>
          </>
        ) : (
          // Participant actions: Join or Leave
          <>
            {isJoined ? (
              <>
                {onViewDetails && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewDetails(tournament)}
                    className="w-full px-3 sm:px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-xs sm:text-sm transition-colors mb-2"
                  >
                    View Details
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLeave(tournament.id)}
                  className="w-full px-3 sm:px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-xs sm:text-sm transition-colors"
                >
                  Leave Tournament
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onJoin(tournament.id)}
                className="w-full px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
              >
                Join Tournament
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default TournamentCard
