/**
 * AI Insights API functions.
 */
import api from './axios'

/**
 * Get AI insights for a user
 */
export const getInsights = async (userId = null) => {
  const url = userId ? `/ai/insights/?user_id=${userId}` : '/ai/insights/'
  const response = await api.get(url)
  return Array.isArray(response.data) ? response.data : (response.data.results || [])
}

/**
 * Generate AI insight for a tournament
 */
export const generateInsight = async (tournamentId) => {
  const response = await api.post('/ai/insights/generate/', { tournament_id: tournamentId })
  return response.data
}

/**
 * Get player statistics
 */
export const getPlayerStats = async (userId = null, game = null) => {
  const params = new URLSearchParams()
  if (userId) params.append('user_id', userId)
  if (game) params.append('game', game)
  
  const url = `/ai/insights/stats/?${params.toString()}`
  const response = await api.get(url)
  return response.data
}

