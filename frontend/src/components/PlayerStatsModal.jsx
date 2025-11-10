/**
 * Player Stats Modal - Displays comprehensive player statistics
 */
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { getPlayerStats } from '../api/ai'

const PlayerStatsModal = ({ isOpen, onClose, userId, username, game = null }) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['playerStats', userId, game],
    queryFn: () => getPlayerStats(userId, game),
    enabled: isOpen && !!userId,
  })

  if (!isOpen) return null

  const statCards = [
    {
      label: 'Total XP',
      value: stats?.total_xp || 0,
      icon: '⭐',
      color: 'from-yellow-400 to-orange-500',
      format: (val) => val.toLocaleString(),
    },
    {
      label: 'Win Rate',
      value: stats?.win_rate || 0,
      icon: '🏆',
      color: 'from-green-400 to-emerald-500',
      format: (val) => `${(val * 100).toFixed(1)}%`,
    },
    {
      label: 'Skill Consistency',
      value: stats?.skill_consistency || 0,
      icon: '📈',
      color: 'from-blue-400 to-cyan-500',
      format: (val) => `${(val * 100).toFixed(1)}%`,
    },
    {
      label: 'Tournaments',
      value: stats?.total_tournaments || 0,
      icon: '🎮',
      color: 'from-purple-400 to-pink-500',
      format: (val) => val,
    },
    {
      label: 'Teams',
      value: stats?.teams_count || 0,
      icon: '👥',
      color: 'from-indigo-400 to-purple-500',
      format: (val) => val,
    },
    {
      label: 'Games Played',
      value: stats?.games_played || 0,
      icon: '🎯',
      color: 'from-red-400 to-pink-500',
      format: (val) => val,
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass rounded-2xl p-4 sm:p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neon-purple/50 shadow-2xl custom-scrollbar my-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
                    {username}'s Stats
                  </h2>
                  {stats?.rank && (
                    <p className="text-neon-purple text-sm mt-1">Rank: {stats.rank}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white text-2xl font-bold"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-neon-purple text-xl">Loading stats...</div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-red-400 text-xl">
                    Failed to load stats. Please try again.
                  </div>
                </div>
              )}

              {/* Stats Content */}
              {!isLoading && !error && stats && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {statCards.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`glass rounded-xl p-4 sm:p-6 border border-neon-purple/30 bg-gradient-to-br ${stat.color} bg-opacity-10 hover:bg-opacity-20 transition-all`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{stat.icon}</span>
                          <h3 className="text-white/70 text-sm font-medium">{stat.label}</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-white">
                          {stat.format(stat.value)}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="glass rounded-xl p-4 border border-neon-purple/30">
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span>📊</span> Performance Overview
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-white/70">
                          <span>Win Rate:</span>
                          <span className="text-neon-purple font-semibold">
                            {((stats.win_rate || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Skill Consistency:</span>
                          <span className="text-neon-purple font-semibold">
                            {((stats.skill_consistency || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Total Tournaments:</span>
                          <span className="text-neon-purple font-semibold">
                            {stats.total_tournaments || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-4 border border-neon-purple/30">
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <span>🎮</span> Activity
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-white/70">
                          <span>Games Played:</span>
                          <span className="text-neon-purple font-semibold">
                            {stats.games_played || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Teams Joined:</span>
                          <span className="text-neon-purple font-semibold">
                            {stats.teams_count || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-white/70">
                          <span>Total XP:</span>
                          <span className="text-neon-purple font-semibold">
                            {(stats.total_xp || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Win Rate Progress Bar */}
                  {stats.win_rate !== undefined && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm font-medium">Win Rate Progress</span>
                        <span className="text-neon-purple font-semibold">
                          {((stats.win_rate || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.win_rate || 0) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Skill Consistency Progress Bar */}
                  {stats.skill_consistency !== undefined && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm font-medium">Skill Consistency</span>
                        <span className="text-neon-purple font-semibold">
                          {((stats.skill_consistency || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.skill_consistency || 0) * 100}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PlayerStatsModal

