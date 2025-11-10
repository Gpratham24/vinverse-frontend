/**
 * Tournament API functions.
 * Handles CRUD operations for tournaments.
 */
import api from './axios'

/**
 * Get all tournaments
 * @returns {Promise} List of tournaments (handles paginated or direct array response)
 */
export const getTournaments = async () => {
  const response = await api.get('/tournaments/')
  const data = response.data
  // Handle paginated response (DRF returns { results: [...] }) or direct array
  return Array.isArray(data) ? data : (data.results || [])
}

/**
 * Get single tournament by ID
 * @param {number} id - Tournament ID
 * @returns {Promise} Tournament data
 */
export const getTournament = async (id) => {
  const response = await api.get(`/tournaments/${id}/`)
  return response.data
}

/**
 * Create new tournament
 * @param {Object} tournamentData - { name, game, date, prize_pool }
 * @returns {Promise} Created tournament
 */
export const createTournament = async (tournamentData) => {
  const response = await api.post('/tournaments/', tournamentData)
  return response.data
}

/**
 * Update tournament
 * @param {number} id - Tournament ID
 * @param {Object} tournamentData - Tournament fields to update
 * @returns {Promise} Updated tournament
 */
export const updateTournament = async (id, tournamentData) => {
  const response = await api.put(`/tournaments/${id}/`, tournamentData)
  return response.data
}

/**
 * Delete tournament
 * @param {number} id - Tournament ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteTournament = async (id) => {
  const response = await api.delete(`/tournaments/${id}/`)
  return response.data
}

/**
 * Join a tournament
 * @param {number} id - Tournament ID
 * @returns {Promise} Join confirmation
 */
export const joinTournament = async (id) => {
  const response = await api.post(`/tournaments/${id}/join/`)
  return response.data
}

/**
 * Leave a tournament
 * @param {number} id - Tournament ID
 * @returns {Promise} Leave confirmation
 */
export const leaveTournament = async (id) => {
  const response = await api.delete(`/tournaments/${id}/leave/`)
  return response.data
}

/**
 * Get tournament participants
 * @param {number} id - Tournament ID
 * @param {string} search - Optional search query
 * @returns {Promise} Participants list
 */
export const getTournamentParticipants = async (id, search = '') => {
  const params = search ? { search } : {}
  const response = await api.get(`/tournaments/${id}/participants/`, { params })
  return response.data
}

