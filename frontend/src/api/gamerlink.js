/**
 * GamerLink API functions for social networking features.
 */
import api from './axios'

/**
 * Follow a user
 * @param {number} userId - User ID to follow
 * @returns {Promise} Follow confirmation
 */
export const followUser = async (userId) => {
  const response = await api.post(`/gamerlink/follow/${userId}/`)
  return response.data
}

/**
 * Unfollow a user
 * @param {number} userId - User ID to unfollow
 * @returns {Promise} Unfollow confirmation
 */
export const unfollowUser = async (userId) => {
  const response = await api.delete(`/gamerlink/follow/${userId}/`)
  return response.data
}

/**
 * Get user feed (posts from followed users or all posts)
 * @param {string} filter - 'all', 'following', or 'my'
 * @returns {Promise} Feed posts
 */
export const getUserFeed = async (filter = 'all') => {
  const response = await api.get(`/gamerlink/feed/?filter=${filter}`)
  return response.data
}

/**
 * Get user connections (followers and following)
 * @param {number} userId - User ID
 * @returns {Promise} Connections data
 */
export const getUserConnections = async (userId) => {
  const response = await api.get(`/gamerlink/connections/${userId}/`)
  return response.data
}

/**
 * Create a new post
 * @param {Object} postData - { content, image? }
 * @returns {Promise} Created post
 */
export const createPost = async (postData) => {
  const response = await api.post('/gamerlink/posts/', postData)
  return response.data
}

/**
 * Like or unlike a post
 * @param {number} postId - Post ID
 * @param {boolean} isLiked - Whether to like (true) or unlike (false)
 * @returns {Promise} Response
 */
export const togglePostLike = async (postId, isLiked) => {
  if (isLiked) {
    const response = await api.delete(`/gamerlink/posts/${postId}/like/`)
    return response.data
  } else {
    const response = await api.post(`/gamerlink/posts/${postId}/like/`)
    return response.data
  }
}

/**
 * Get comments for a post
 * @param {number} postId - Post ID
 * @returns {Promise} Comments array
 */
export const getPostComments = async (postId) => {
  const response = await api.get(`/gamerlink/posts/${postId}/comments/`)
  return response.data
}

/**
 * Create a comment on a post
 * @param {number} postId - Post ID
 * @param {string} content - Comment content
 * @returns {Promise} Created comment
 */
export const createPostComment = async (postId, content) => {
  const response = await api.post(`/gamerlink/posts/${postId}/comments/`, { content })
  return response.data
}

/**
 * Get all posts
 * @returns {Promise} List of posts
 */
export const getPosts = async () => {
  const response = await api.get('/gamerlink/posts/')
  return response.data
}

/**
 * Get LFT (Looking For Team) posts
 * @param {Object} filters - { game?, game_id?, rank?, region?, play_style? }
 * @returns {Promise} Filtered LFT posts array
 */
export const getLFTPosts = async (filters = {}) => {
  const params = new URLSearchParams()
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key])
  })
  const response = await api.get(`/gamerlink/lft/?${params.toString()}`)
  // Handle both array response and paginated response
  if (Array.isArray(response.data)) {
    return response.data
  }
  return response.data.results || response.data || []
}

/**
 * Create LFT post
 * @param {Object} lftData - { game, rank?, region?, play_style, message }
 * @returns {Promise} Created LFT post
 */
export const createLFTPost = async (lftData) => {
  const response = await api.post('/gamerlink/lft/', lftData)
  return response.data
}

/**
 * Get match insights for current user
 * @returns {Promise} List of insights
 */
export const getMatchInsights = async () => {
  const response = await api.get('/gamerlink/insights/')
  return response.data
}
