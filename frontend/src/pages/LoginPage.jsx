/**
 * Login Page - User authentication with email.
 * User enters registered email, navigates to dashboard on success.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { loginUser } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const queryClient = useQueryClient()
  
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data)
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      queryClient.refetchQueries({ queryKey: ['userProfile'] })
      // Invalidate tournaments to refresh with user context
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      navigate('/tournaments')
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.error
      if (errorMsg && errorMsg.includes('not exist') || errorMsg && errorMsg.includes('Invalid')) {
        setError('Account does not exist. Please sign up first.')
      } else {
        setError(errorMsg || 'Login failed. Please try again.')
      }
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    loginMutation.mutate(formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-6 sm:p-8 w-full max-w-md border border-neon-purple/30"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
          Login to VinVerse
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              placeholder="Enter your registered email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
              {error.includes('not exist') && (
                <div className="mt-2">
                  <Link to="/signup" className="text-neon-purple hover:underline text-sm">
                    → Go to Signup
                  </Link>
                </div>
              )}
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loginMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-neon-purple to-pink-500 rounded-lg font-semibold glow-button disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-white/60">
          Don't have an account?{' '}
          <Link to="/signup" className="text-neon-purple hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage
