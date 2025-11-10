/**
 * Overview Tab - Shows summary stats and quick actions
 */
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getPlayerStats } from '../../api/ai'
import { useAuth } from '../../hooks/useAuth'
import { getTournaments } from '../../api/tournaments'

const OverviewTab = () => {
  const { user } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['playerStats', user?.id],
    queryFn: () => getPlayerStats(user?.id),
    enabled: !!user,
  })

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments'],
    queryFn: getTournaments,
  })

  const userTournaments = tournaments.filter(t => 
    t.participants?.some(p => p.user === user?.id) || t.is_joined
  )

  const statCards = [
    {
      label: 'Total Tournaments',
      value: stats?.total_tournaments || 0,
      icon: '🎮',
      color: 'purple',
    },
    {
      label: 'Win Rate',
      value: `${(stats?.win_rate * 100 || 0).toFixed(1)}%`,
      icon: '🏆',
      color: 'green',
    },
    {
      label: 'Skill Consistency',
      value: `${(stats?.skill_consistency * 100 || 0).toFixed(1)}%`,
      icon: '📈',
      color: 'blue',
    },
    {
      label: 'XP Points',
      value: stats?.total_xp || 0,
      icon: '⭐',
      color: 'yellow',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass rounded-xl p-6 border border-${stat.color}-500/30`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-2xl font-bold text-${stat.color}-400`}>
                {statsLoading ? '...' : stat.value}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6 border border-neon-purple/30"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {userTournaments.slice(0, 5).map((tournament) => (
            <div
              key={tournament.id}
              className="flex items-center justify-between p-3 bg-black/30 rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{tournament.name}</p>
                <p className="text-gray-400 text-sm">{tournament.game}</p>
              </div>
              <span className="text-neon-purple text-sm">
                {new Date(tournament.date).toLocaleDateString()}
              </span>
            </div>
          ))}
          {userTournaments.length === 0 && (
            <p className="text-gray-400 text-center py-4">No recent tournaments</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default OverviewTab

