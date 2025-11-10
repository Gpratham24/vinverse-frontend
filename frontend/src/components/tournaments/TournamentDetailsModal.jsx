/**
 * Tournament Details Modal - Shows comprehensive tournament information.
 * Available to all users (creators and participants).
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

const TournamentDetailsModal = ({ tournament, onClose }) => {
  const { user } = useAuth()
  const isCreator = tournament.is_creator || (tournament.created_by?.id === user?.id)
  const isJoined = tournament.is_joined

  // Format date for display
  const formattedDate = tournament.date
    ? new Date(tournament.date).toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass rounded-2xl p-8 w-full max-w-2xl border border-neon-purple/30 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
                {tournament.name}
              </h2>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-sm font-semibold">
                  {tournament.game}
                </span>
                {tournament.participant_count > 0 && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {tournament.participant_count} participant{tournament.participant_count !== 1 ? 's' : ''}
                  </span>
                )}
                {isJoined && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    ✓ Joined
                  </span>
                )}
                {isCreator && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    Creator
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-3xl ml-4"
            >
              ×
            </button>
          </div>

          {/* Tournament Details */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="glass rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-white/60 text-sm mb-1">Tournament Date & Time</p>
                  <p className="text-white font-semibold text-lg">{formattedDate}</p>
                </div>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="glass rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-white/60 text-sm mb-1">Prize Pool</p>
                  <p className="text-green-400 font-bold text-2xl">{formattedPrize}</p>
                </div>
              </div>
            </div>

            {/* Creator */}
            {tournament.created_by && (
              <div className="glass rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center text-white font-bold">
                    {tournament.created_by.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Tournament Creator</p>
                    <p className="text-white font-semibold">{tournament.created_by.username}</p>
                    {tournament.created_by.verified && (
                      <span className="text-blue-400 text-xs ml-2">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tournament ID */}
            <div className="glass rounded-lg p-4 border border-white/10">
              <div>
                <p className="text-white/60 text-sm mb-1">Tournament ID</p>
                <p className="text-white/80 font-mono text-sm">#{tournament.id}</p>
              </div>
            </div>

            {/* Status Info */}
            <div className="glass rounded-lg p-4 border border-white/10">
              <div>
                <p className="text-white/60 text-sm mb-2">Status</p>
                <div className="flex items-center space-x-4">
                  {isJoined ? (
                    <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold">
                      ✓ You are participating
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-white/10 text-white/60 rounded-lg text-sm">
                      Not joined yet
                    </span>
                  )}
                  {isCreator && (
                    <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-semibold">
                      You created this tournament
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/40 text-xs text-center">
              Tournament created on {tournament.created_at ? new Date(tournament.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TournamentDetailsModal

