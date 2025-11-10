/**
 * Team Finder Page - Browse and search for teams/LFT posts.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getLFTPosts, createLFTPost } from '../api/gamerlink'
import { useAuth } from '../hooks/useAuth'
import PlayerStatsModal from '../components/PlayerStatsModal'

const TeamFinderPage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showLFTForm, setShowLFTForm] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [filters, setFilters] = useState({
    game: '',
    game_id: '',
    rank: '',
    region: '',
    play_style: '',
  })
  const [lftFormData, setLftFormData] = useState({
    game: '',
    game_id: '',
    rank: '',
    region: '',
    play_style: 'casual',
    message: '',
  })

  // Fetch LFT posts with filters
  const { data: lftPosts = [], isLoading } = useQuery({
    queryKey: ['lftPosts', filters],
    queryFn: () => getLFTPosts(filters),
  })

  // Create LFT post mutation
  const createLFTMutation = useMutation({
    mutationFn: createLFTPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lftPosts'] })
      setLftFormData({
        game: '',
        game_id: '',
        rank: '',
        region: '',
        play_style: 'casual',
        message: '',
      })
      setShowLFTForm(false)
    },
  })

  const handleSubmitLFT = (e) => {
    e.preventDefault()
    if (lftFormData.game && lftFormData.message) {
      createLFTMutation.mutate(lftFormData)
    }
  }

  const handleViewStats = (post) => {
    if (post.author?.id) {
      setSelectedPlayer({
        id: post.author.id,
        username: post.author.username,
        game: post.game,
      })
      setShowStatsModal(true)
    }
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
            Team Finder
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLFTForm(!showLFTForm)}
            className="w-full sm:w-auto px-6 py-2.5 bg-neon-purple hover:bg-neon-purple-dark rounded-lg text-sm font-semibold transition-all shadow-lg"
          >
            {showLFTForm ? 'Cancel' : '+ Post LFT'}
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 sm:p-6 mb-6 border border-neon-purple/30"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Game (e.g., Valorant)"
              value={filters.game}
              onChange={(e) => setFilters({ ...filters, game: e.target.value })}
              className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
            />
            <input
              type="text"
              placeholder="Game ID/Username"
              value={filters.game_id}
              onChange={(e) => setFilters({ ...filters, game_id: e.target.value })}
              className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
            />
            <input
              type="text"
              placeholder="Rank"
              value={filters.rank}
              onChange={(e) => setFilters({ ...filters, rank: e.target.value })}
              className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
            />
            <input
              type="text"
              placeholder="Region"
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
            />
            <select
              value={filters.play_style}
              onChange={(e) => setFilters({ ...filters, play_style: e.target.value })}
              className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
            >
              <option value="">All Play Styles</option>
              <option value="casual">Casual</option>
              <option value="competitive">Competitive</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </motion.div>

        {/* LFT Form */}
        {showLFTForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 sm:p-6 mb-6 border border-neon-purple/30"
          >
            <h2 className="text-xl font-semibold mb-4 text-white">Looking For Team</h2>
            <form onSubmit={handleSubmitLFT} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Game *"
                  value={lftFormData.game}
                  onChange={(e) => setLftFormData({ ...lftFormData, game: e.target.value })}
                  required
                  className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
                />
                <input
                  type="text"
                  placeholder="Game ID/Username"
                  value={lftFormData.game_id}
                  onChange={(e) => setLftFormData({ ...lftFormData, game_id: e.target.value })}
                  className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
                />
                <input
                  type="text"
                  placeholder="Rank"
                  value={lftFormData.rank}
                  onChange={(e) => setLftFormData({ ...lftFormData, rank: e.target.value })}
                  className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
                />
                <input
                  type="text"
                  placeholder="Region"
                  value={lftFormData.region}
                  onChange={(e) => setLftFormData({ ...lftFormData, region: e.target.value })}
                  className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
                />
              </div>
              <select
                value={lftFormData.play_style}
                onChange={(e) => setLftFormData({ ...lftFormData, play_style: e.target.value })}
                className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              >
                <option value="casual">Casual</option>
                <option value="competitive">Competitive</option>
                <option value="professional">Professional</option>
              </select>
              <textarea
                placeholder="Tell teams about yourself..."
                value={lftFormData.message}
                onChange={(e) => setLftFormData({ ...lftFormData, message: e.target.value })}
                required
                rows="4"
                className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple resize-none"
              />
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={createLFTMutation.isPending}
                  className="px-6 py-2 bg-gradient-to-r from-neon-purple to-pink-500 rounded-lg font-semibold glow-button disabled:opacity-50"
                >
                  {createLFTMutation.isPending ? 'Posting...' : 'Post LFT'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* LFT Posts Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-neon-purple text-xl">Loading...</div>
          </div>
        ) : !lftPosts || lftPosts.length === 0 ? (
          <div className="text-center py-20 glass rounded-xl p-8 border border-neon-purple/30">
            <p className="text-white/60 text-xl">
              {Object.values(filters).some(f => f) 
                ? "No LFT posts found matching your filters" 
                : "No LFT posts found. Be the first to post!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {lftPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass rounded-xl p-6 border ${
                  post.author?.verified 
                    ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-neon-purple/10' 
                    : 'border-neon-purple/30'
                } hover:border-neon-purple/50 transition-all`}
              >
                {/* Discord-style User Card for Verified Players */}
                {post.author?.verified ? (
                  <div className="mb-4 p-4 bg-black/30 rounded-lg border border-blue-500/30">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-neon-purple to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-blue-400">
                          {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-bold text-lg">{post.author?.username}</p>
                          <span className="text-blue-400 text-lg">✓</span>
                        </div>
                        <p className="text-white/60 text-sm">{post.author?.gamer_tag || post.author?.vin_id}</p>
                        {post.author?.rank && (
                          <p className="text-neon-purple text-xs font-semibold mt-1">{post.author.rank}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center text-white font-bold">
                      {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{post.author?.username}</p>
                      <p className="text-white/50 text-xs">{post.author?.rank || 'No rank'}</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-sm font-semibold">
                    {post.game}
                  </span>
                  <span className="ml-2 px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                    {post.play_style}
                  </span>
                </div>
                {post.rank && (
                  <p className="text-white/70 text-sm mb-2">Rank: {post.rank}</p>
                )}
                {post.game_id && (
                  <p className="text-white/70 text-sm mb-2">
                    <span className="text-neon-purple">Game ID:</span> {post.game_id}
                  </p>
                )}
                <p className="text-white/90 mb-4">{post.message}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-white/40 text-xs">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  {post.author?.id && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewStats(post)}
                      className="px-4 py-2 bg-gradient-to-r from-neon-purple to-pink-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      View Stats
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Player Stats Modal */}
      <PlayerStatsModal
        isOpen={showStatsModal}
        onClose={() => {
          setShowStatsModal(false)
          setSelectedPlayer(null)
        }}
        userId={selectedPlayer?.id}
        username={selectedPlayer?.username}
        game={selectedPlayer?.game}
      />
    </div>
  )
}

export default TeamFinderPage

