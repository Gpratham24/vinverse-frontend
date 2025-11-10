/**
 * Tournament Form - Modal for creating/editing tournaments.
 */
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { createTournament, updateTournament } from '../../api/tournaments'

const TournamentForm = ({ tournament, onClose }) => {
  const isEditing = !!tournament
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    date: '',
    prize_pool: '',
  })
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  // Populate form if editing
  useEffect(() => {
    if (tournament) {
      // Format date for datetime-local input
      const dateStr = tournament.date
        ? new Date(tournament.date).toISOString().slice(0, 16)
        : ''
      
      setFormData({
        name: tournament.name || '',
        game: tournament.game || '',
        date: dateStr,
        prize_pool: tournament.prize_pool || '',
      })
    }
  }, [tournament])

  const mutation = useMutation({
    mutationFn: (data) => {
      // Convert date to ISO string and prize_pool to number
      const submitData = {
        ...data,
        date: new Date(data.date).toISOString(),
        prize_pool: parseFloat(data.prize_pool) || 0,
      }
      
      return isEditing
        ? updateTournament(tournament.id, submitData)
        : createTournament(submitData)
    },
    onSuccess: (data) => {
      // Invalidate and refetch tournaments list
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.refetchQueries({ queryKey: ['tournaments'] })
      onClose()
    },
    onError: (err) => {
      const errorMsg = err.response?.data
      if (typeof errorMsg === 'object') {
        setError(Object.values(errorMsg).flat().join(', ') || 'Operation failed.')
      } else {
        setError('Operation failed. Please try again.')
      }
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    mutation.mutate(formData)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass rounded-2xl p-8 w-full max-w-md border border-neon-purple/30 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
              {isEditing ? 'Edit Tournament' : 'Create Tournament'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tournament Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Game *</label>
              <input
                type="text"
                value={formData.game}
                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                required
                placeholder="e.g., Valorant, CS2, League of Legends"
                className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prize Pool ($) *</label>
              <input
                type="number"
                value={formData.prize_pool}
                onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex space-x-3 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={mutation.isPending}
                className="flex-1 py-3 bg-gradient-to-r from-neon-purple to-pink-500 rounded-lg font-semibold glow-button disabled:opacity-50"
              >
                {mutation.isPending
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update' : 'Create')}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TournamentForm

