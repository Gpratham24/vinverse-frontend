/**
 * Chat API functions.
 */
import api from './axios'

/**
 * Get chat rooms
 */
export const getRooms = async (type = null, game = null) => {
  const params = new URLSearchParams()
  if (type) params.append('type', type)
  if (game) params.append('game', game)
  
  const url = params.toString() ? `/chat/rooms/?${params.toString()}` : '/chat/rooms/'
  const response = await api.get(url)
  return Array.isArray(response.data) ? response.data : (response.data.results || [])
}

/**
 * Get default rooms
 */
export const getDefaultRooms = async () => {
  const response = await api.get('/chat/rooms/default_rooms/')
  return Array.isArray(response.data) ? response.data : (response.data.results || [])
}

/**
 * Get messages for a room
 */
export const getMessages = async (roomName) => {
  const response = await api.get(`/chat/messages/?room=${roomName}`)
  return Array.isArray(response.data) ? response.data : (response.data.results || [])
}

/**
 * Invite a user to a private room
 */
export const inviteUserToRoom = async (roomId, username, message = '') => {
  const response = await api.post(`/chat/rooms/${roomId}/invite_user/`, {
    username,
    message
  })
  return response.data
}

/**
 * Request to join a private room
 */
export const requestJoinRoom = async (roomId, message = '') => {
  const response = await api.post(`/chat/rooms/${roomId}/request_join/`, {
    message
  })
  return response.data
}

/**
 * Search for private rooms
 */
export const searchPrivateRooms = async (query) => {
  const response = await api.get(`/chat/rooms/search_private/?q=${encodeURIComponent(query)}`)
  return Array.isArray(response.data) ? response.data : (response.data.results || [])
}

/**
 * Get pending join requests
 */
export const getPendingRequests = async () => {
  const response = await api.get('/chat/join-requests/pending/')
  return Array.isArray(response.data) ? response.data : (response.data.results || [])
}

/**
 * Accept a join request
 */
export const acceptJoinRequest = async (requestId) => {
  const response = await api.post(`/chat/join-requests/${requestId}/accept/`)
  return response.data
}

/**
 * Reject a join request
 */
export const rejectJoinRequest = async (requestId) => {
  const response = await api.post(`/chat/join-requests/${requestId}/reject/`)
  return response.data
}

