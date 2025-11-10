/**
 * Authentication API functions.
 * Handles user registration, login, and profile management.
 */
import api from './axios'

/**
 * Register a new user
 * @param {Object} userData - { username, email, password, password2, bio?, rank?, gamer_tag? }
 * @returns {Promise} API response with user and tokens
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register/', userData)
  return response.data
}

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise} API response with user and tokens
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login/', credentials)
  return response.data
}

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getUserProfile = async () => {
  const response = await api.get('/auth/profile/')
  return response.data
}

/**
 * Get user profile by ID
 * @param {number|string} userId - User ID
 * @returns {Promise} User profile data
 */
export const getUserProfileById = async (userId) => {
  const response = await api.get(`/auth/profile/${userId}/`)
  return response.data
}

/**
 * Update user profile
 * @param {Object} profileData - { email?, bio?, rank?, gamer_tag? }
 * @returns {Promise} Updated user profile
 */
export const updateUserProfile = async (profileData) => {
  const response = await api.put('/auth/profile/', profileData)
  return response.data
}

/**
 * Check if username is available
 * @param {string} username - Username to check
 * @returns {Promise} { available: boolean, username: string, message: string }
 */
export const checkUsernameAvailability = async (username) => {
  try {
    const response = await api.get('/auth/check-username/', {
      params: { username }
    })
    return response.data
  } catch (error) {
    // Re-throw to let component handle it
    throw error
  }
}

/**
 * Search for players
 * @param {string} query - Search query (username, gamer_tag, or vin_id)
 * @returns {Promise} Search results with players array
 */
export const searchPlayers = async (query) => {
  const response = await api.get(`/auth/search-players/?q=${encodeURIComponent(query)}`)
  return response.data
}

