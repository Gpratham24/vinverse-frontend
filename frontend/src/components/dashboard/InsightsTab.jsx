/**
 * AI Insights Tab - Shows performance breakdowns with charts
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getInsights, generateInsight, getPlayerStats } from '../../api/ai'
import { getTournaments } from '../../api/tournaments'
import { useAuth } from '../../hooks/useAuth'

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']

const InsightsTab = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedTournament, setSelectedTournament] = useState(null)

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['insights', user?.id],
    queryFn: () => getInsights(user?.id),
    enabled: !!user,
  })

  const { data: stats } = useQuery({
    queryKey: ['playerStats', user?.id],
    queryFn: () => getPlayerStats(user?.id),
    enabled: !!user,
  })

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: getTournaments,
  })

  const generateMutation = useMutation({
    mutationFn: generateInsight,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
    },
  })

  const handleGenerateInsight = (tournamentId) => {
    generateMutation.mutate(tournamentId)
    setSelectedTournament(tournamentId)
  }

  // Prepare chart data
  const performanceData = insights.map((insight) => ({
    name: insight.tournament?.name?.substring(0, 15) || 'Tournament',
    score: parseFloat(insight.score) || 0,
    date: new Date(insight.generated_at).toLocaleDateString(),
  }))

  const strengthsData = insights.flatMap((insight) =>
    (insight.strengths || []).map((strength) => ({ name: strength, value: 1 }))
  )

  const improvementsData = insights.flatMap((insight) =>
    (insight.improvements || []).map((improvement) => ({ name: improvement, value: 1 }))
  )

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 border border-neon-purple/30"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Total Insights</h3>
          <p className="text-3xl font-bold text-neon-purple">{insights.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 border border-neon-purple/30"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Avg Score</h3>
          <p className="text-3xl font-bold text-neon-purple">
            {insights.length > 0
              ? (
                  insights.reduce((sum, i) => sum + (parseFloat(i.score) || 0), 0) /
                  insights.length
                ).toFixed(1)
              : '0'}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 border border-neon-purple/30"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Win Rate</h3>
          <p className="text-3xl font-bold text-neon-purple">
            {stats ? `${(stats.win_rate * 100).toFixed(1)}%` : '0%'}
          </p>
        </motion.div>
      </div>

      {/* Performance Chart */}
      {performanceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6 border border-neon-purple/30"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #8b5cf6' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Performance Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Score Distribution */}
      {performanceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6 border border-neon-purple/30"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #8b5cf6' }}
              />
              <Bar dataKey="score" fill="#8b5cf6" name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Generate Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6 border border-neon-purple/30"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Generate New Insight</h3>
        <div className="space-y-3">
          {tournaments
            .filter((t) => t.is_joined || t.participants?.some((p) => p.user === user?.id))
            .slice(0, 5)
            .map((tournament) => (
              <div
                key={tournament.id}
                className="flex items-center justify-between p-3 bg-black/30 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{tournament.name}</p>
                  <p className="text-gray-400 text-sm">{tournament.game}</p>
                </div>
                <button
                  onClick={() => handleGenerateInsight(tournament.id)}
                  disabled={generateMutation.isPending}
                  className="px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {generateMutation.isPending && selectedTournament === tournament.id
                    ? 'Generating...'
                    : 'Generate'}
                </button>
              </div>
            ))}
        </div>
      </motion.div>

      {/* Recent Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-xl p-6 border border-neon-purple/30"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Recent Insights</h3>
        <div className="space-y-4">
          {insightsLoading ? (
            <p className="text-gray-400 text-center py-4">Loading insights...</p>
          ) : insights.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No insights yet. Generate one above!</p>
          ) : (
            insights.slice(0, 5).map((insight) => (
              <div
                key={insight.id}
                className="p-4 bg-black/30 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{insight.tournament?.name}</h4>
                  <span className="text-neon-purple font-bold">
                    Score: {parseFloat(insight.score || 0).toFixed(1)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">{insight.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {insight.strengths?.slice(0, 3).map((strength, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded"
                    >
                      + {strength}
                    </span>
                  ))}
                  {insight.improvements?.slice(0, 2).map((improvement, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded"
                    >
                      → {improvement}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default InsightsTab

