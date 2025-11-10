/**
 * Participants Modal - Shows tournament participants with search functionality.
 * Only visible to tournament creator.
 */
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { getTournamentParticipants } from '../../api/tournaments'

const ParticipantsModal = ({ tournament, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch participants
  const { data, isLoading } = useQuery({
    queryKey: ['tournamentParticipants', tournament.id, debouncedSearch],
    queryFn: () => getTournamentParticipants(tournament.id, debouncedSearch),
    enabled: !!tournament,
  })

  const participants = data?.participants || []
  const count = data?.count || 0

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass rounded-2xl p-8 w-full max-w-2xl border border-neon-purple/30 max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
                Participants
              </h2>
              <p className="text-sm text-white/60 mt-1">{tournament.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Search Box */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, email, or game ID..."
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
            />
          </div>

          {/* Participants Count */}
          <div className="mb-4 text-sm text-white/60">
            {count} participant{count !== 1 ? 's' : ''} found
          </div>

          {/* Participants List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-neon-purple">Loading participants...</div>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60">
                  {searchQuery ? 'No participants found matching your search.' : 'No participants yet.'}
                </p>
              </div>
            ) : (
              participants.map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-lg p-4 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-purple to-pink-500 flex items-center justify-center text-white font-bold">
                      {participant.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-semibold">
                          {participant.user?.username || 'Unknown'}
                        </p>
                        {participant.user?.verified && (
                          <span className="text-blue-400 text-sm">✓</span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm">
                        {participant.user?.gamer_tag && `Game ID: ${participant.user.gamer_tag}`}
                        {participant.user?.vin_id && ` • ${participant.user.vin_id}`}
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        Joined {new Date(participant.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ParticipantsModal

