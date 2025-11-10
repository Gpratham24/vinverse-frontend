/**
 * Axios instance configured for VinVerse API.
 * Base URL is determined by environment:
 * - Production: VITE_API_URL or Railway URL
 * - Development: http://localhost:8000/api/
 * Handles JWT token authentication automatically.
 */
import axios from 'axios'

// Get API URL from environment variable or use defaults
const getApiUrl = () => {
  // Check for Vite environment variable (set in .env file)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Production: Use relative path to go through Netlify proxy
  // Netlify will proxy /api/* requests to Railway backend
  if (import.meta.env.PROD) {
    return '/api/'
  }
  
  // Development: Use local backend
  return 'http://localhost:8000/api/'
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

