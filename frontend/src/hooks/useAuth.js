/**
 * Custom hook for authentication state management.
 * Uses React Query for user profile management.
 */
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserProfile } from '../api/auth'

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [localUser, setLocalUser] = useState(null)
    const queryClient = useQueryClient()

    // Sync user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                setLocalUser(JSON.parse(storedUser))
            } catch (e) {
                setLocalUser(null)
            }
        }
    }, [])

    // Check for token on mount and listen for storage changes
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('access_token')
            const nowAuthenticated = !!token
            
            setIsAuthenticated(prev => {
                // Only update if state actually changed
                if (prev !== nowAuthenticated) {
                    // If becoming authenticated, update local user immediately
                    if (nowAuthenticated) {
                        const storedUser = localStorage.getItem('user')
                        if (storedUser) {
                            try {
                                setLocalUser(JSON.parse(storedUser))
                            } catch (e) {
                                setLocalUser(null)
                            }
                        }
                    }
                    return nowAuthenticated
                }
                return prev
            })
            setLoading(false)
        }
        
        // Check immediately
        checkAuth()
        
        // Listen for storage changes (for multi-tab support)
        const handleStorageChange = (e) => {
            if (e.key === 'access_token' || e.key === 'user') {
                checkAuth()
            }
        }
        
        window.addEventListener('storage', handleStorageChange)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    // Fetch user profile using React Query if authenticated
    const token = localStorage.getItem('access_token')
    const { data: user, isLoading: profileLoading, refetch: refetchUser } = useQuery({
        queryKey: ['userProfile'],
        queryFn: getUserProfile,
        enabled: !!token && isAuthenticated,
        retry: false,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    })

    // Use React Query user if available, otherwise fallback to localStorage user
    const displayUser = user || localUser

    /**
     * Login user and store tokens
     * @param {Object} authData - { user, tokens }
     */
    const login = (authData) => {
        // Store tokens and user data
        localStorage.setItem('access_token', authData.tokens.access)
        localStorage.setItem('refresh_token', authData.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(authData.user))
        
        // Update state immediately and synchronously
        setIsAuthenticated(true)
        setLocalUser(authData.user)
        setLoading(false)
        
        // Invalidate and refetch user profile
        queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        queryClient.refetchQueries({ queryKey: ['userProfile'] })
        
        // Trigger storage event for same-tab and cross-tab updates
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'access_token',
            newValue: authData.tokens.access
        }))
    }

    /**
     * Logout user and clear storage
     */
    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
        setLocalUser(null)
        // Clear all queries
        queryClient.clear()
    }

    return {
        isAuthenticated,
        user: displayUser,
        loading: loading || profileLoading,
        login,
        logout,
        refetchUser,
    }
}

