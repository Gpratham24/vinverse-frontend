/**
 * Matchmaking Tab - Smart team matching
 */
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getMatchmaking } from '../../api/matchmaking'

const MatchmakingTab = () => {
  const [game, setGame] = useState('Valorant')
  const [region, setRegion] = useState('')
  const [teamSize, setTeamSize] = useState(5)

  const matchmakingMutation = useMutation({
    mutationFn: () => getMatchmaking(game, region, teamSize),
  })

  const handleFindMatches = () => {
    matchmakingMutation.mutate()
  }

  return (
    <div className="space-y-6">
      {/* Matchmaking Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 border border-neon-purple/30"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">Find Your Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">Game</label>
            <input
              type="text"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              placeholder="Valorant"
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-white"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Region</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="NA, EU, etc."
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-white"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Team Size</label>
            <input
              type="number"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value) || 5)}
              min="2"
              max="10"
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-white"
            />
          </div>
        </div>
        <button
          onClick={handleFindMatches}
          disabled={matchmakingMutation.isPending}
          className="w-full md:w-auto px-6 py-3 bg-neon-purple text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-semibold"
        >
          {matchmakingMutation.isPending ? 'Finding Matches...' : 'Find Matches'}
        </button>
      </motion.div>

      {/* User Stats */}
      {matchmakingMutation.data?.user_stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 border border-neon-purple/30"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Your Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Elo Rating</p>
              <p className="text-2xl font-bold text-neon-purple">
                {matchmakingMutation.data.user_stats.elo}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {matchmakingMutation.data.user_stats.win_rate}%
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Consistency</p>
              <p className="text-2xl font-bold text-blue-400">
                {matchmakingMutation.data.user_stats.consistency}%
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Matches */}
      {matchmakingMutation.data?.matches && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 border border-neon-purple/30"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Matched Players ({matchmakingMutation.data.matches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchmakingMutation.data.matches.map((match, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-black/30 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold">{match.user.username}</p>
                    <p className="text-gray-400 text-sm">@{match.user.gamer_tag}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neon-purple font-bold">{match.match_score}%</p>
                    <p className="text-gray-400 text-xs">Match</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank:</span>
                    <span className="text-white">{match.user.rank || 'Unranked'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-green-400">{match.win_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Consistency:</span>
                    <span className="text-blue-400">{match.consistency}%</span>
                  </div>
                  {match.synergy > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Synergy:</span>
                      <span className="text-yellow-400">{match.synergy} tournaments</span>
                    </div>
                  )}
                  {match.region_match && (
                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      Same Region
                    </span>
                  )}
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-all">
                  Invite to Team
                </button>
              </motion.div>
            ))}
          </div>
          {matchmakingMutation.data.matches.length === 0 && (
            <p className="text-gray-400 text-center py-4">No matches found. Try different filters.</p>
          )}
        </motion.div>
      )}

      {matchmakingMutation.isError && (
        <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-500/10">
          <p className="text-red-400">Error finding matches. Please try again.</p>
        </div>
      )}
    </div>
  )
}

export default MatchmakingTab

