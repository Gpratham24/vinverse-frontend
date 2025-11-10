/**
 * Leaderboard Tab - Animated rankings with tiers
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getLeaderboard } from '../../api/matchmaking'
import { useAuth } from '../../hooks/useAuth'

const tierColors = {
  Challenger: 'from-purple-600 to-pink-600',
  Grandmaster: 'from-red-600 to-orange-600',
  Master: 'from-blue-600 to-cyan-600',
  Diamond: 'from-cyan-600 to-blue-600',
  Platinum: 'from-teal-600 to-green-600',
  Gold: 'from-yellow-600 to-orange-600',
  Silver: 'from-gray-400 to-gray-600',
  Bronze: 'from-orange-800 to-red-800',
}

const LeaderboardTab = () => {
  const { user } = useAuth()
  const [type, setType] = useState('overall')
  const [game, setGame] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', type, game],
    queryFn: () => getLeaderboard(type, game || null),
  })

  const leaderboard = data?.leaderboard || []

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 border border-neon-purple/30"
      >
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-300 mb-2">Leaderboard Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-white"
            >
              <option value="overall">Overall</option>
              <option value="xp">XP Points</option>
              <option value="tournaments">Tournaments</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-300 mb-2">Game (Optional)</label>
            <input
              type="text"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              placeholder="Valorant, CS2, etc."
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-white"
            />
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-6 border border-neon-purple/30"
      >
        <h2 className="text-2xl font-semibold text-white mb-6">Leaderboard</h2>
        {isLoading ? (
          <p className="text-gray-400 text-center py-8">Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No data available</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => {
              const isCurrentUser = entry.user.id === user?.id
              return (
                <motion.div
                  key={entry.user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    isCurrentUser
                      ? 'bg-neon-purple/20 border-neon-purple'
                      : 'bg-black/30 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      {entry.rank <= 3 ? (
                        <span className="text-3xl">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="text-xl font-bold text-gray-400">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Tier Badge */}
                    <div
                      className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${tierColors[entry.tier] || tierColors.Bronze} flex items-center justify-center text-white font-bold text-xs text-center`}
                    >
                      {entry.tier.substring(0, 3)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {entry.user.username}
                        {isCurrentUser && (
                          <span className="ml-2 text-neon-purple text-sm">(You)</span>
                        )}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        @{entry.user.gamer_tag || entry.user.username}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400">XP</p>
                        <p className="text-white font-semibold">{entry.user.xp_points}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Win Rate</p>
                        <p className="text-green-400 font-semibold">{entry.win_rate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Tournaments</p>
                        <p className="text-white font-semibold">{entry.tournaments}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Score</p>
                        <p className="text-neon-purple font-semibold">{entry.score}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default LeaderboardTab

