/**
 * Notifications API functions.
 */
import api from './axios'

/**
 * Get user notifications
 * @returns {Promise} Notifications list
 */
export const getNotifications = async () => {
    const response = await api.get('/notifications/')
    return response.data
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise} Confirmation
 */
export const markNotificationRead = async (notificationId) => {
    const response = await api.post(`/notifications/${notificationId}/read/`)
    return response.data
}

/**
 * Mark all notifications as read
 * @returns {Promise} Confirmation
 */
export const markAllNotificationsRead = async () => {
    const response = await api.post('/notifications/mark-all-read/')
    return response.data
}

