/**
 * Matchmaking API functions.
 */
import api from './axios'

/**
 * Get smart matchmaking results
 */
export const getMatchmaking = async (game, region = '', teamSize = 5) => {
  const response = await api.post('/gamerlink/matchmaking/', {
    game,
    region,
    team_size: teamSize
  })
  return response.data
}

/**
 * Get leaderboard
 */
export const getLeaderboard = async (type = 'overall', game = null, limit = 100) => {
  const params = new URLSearchParams()
  params.append('type', type)
  if (game) params.append('game', game)
  params.append('limit', limit)
  
  const response = await api.get(`/gamerlink/leaderboard/?${params.toString()}`)
  return response.data
}

