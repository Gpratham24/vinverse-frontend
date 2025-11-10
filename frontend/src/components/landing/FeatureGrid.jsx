/**
 * Feature Grid - Separates "Live Now" from "Coming Soon" features.
 */
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const FeatureGrid = () => {
  // Live Now features (functional)
  const liveFeatures = [
    {
      title: 'Tournaments',
      description: 'Create, view, and manage esports tournaments',
      icon: '🏆',
      status: 'live',
      link: '/tournaments',
    },
    {
      title: 'GamerLink',
      description: 'Connect with players, follow, and build your network',
      icon: '🔗',
      status: 'live',
      link: '/feed',
    },
    {
      title: 'Team Finder',
      description: 'Find teammates and join competitive teams',
      icon: '👥',
      status: 'live',
      link: '/team-finder',
    },
    {
      title: 'Social Feed',
      description: 'Share posts, like, and comment with the community',
      icon: '📱',
      status: 'live',
      link: '/feed',
    },
    {
      title: 'AI Insights Dashboard',
      description: 'AI-powered match analysis, win predictions, and performance metrics',
      icon: '🧠',
      status: 'live',
      link: '/dashboard',
    },
    {
      title: 'Live Chat',
      description: 'Real-time communication with players via WebSocket',
      icon: '💬',
      status: 'live',
      link: '/dashboard',
    },
    {
      title: 'Smart Matchmaking',
      description: 'AI algorithm to find perfect teammates based on Elo, win rate, and synergy',
      icon: '🎯',
      status: 'live',
      link: '/dashboard',
    },
    {
      title: 'Leaderboards',
      description: 'Compete for top rankings with animated leaderboards and tiers',
      icon: '📊',
      status: 'live',
      link: '/dashboard',
    },
  ]

  // Coming Soon features
  const comingSoonFeatures = [
    {
      title: 'AI Player Advisor',
      description: 'Get personalized recommendations for best role and teammate matches',
      icon: '🤖',
      status: 'coming-soon',
    },
    {
      title: 'Rewards System',
      description: 'Earn badges, XP, and unlock exclusive rewards',
      icon: '🎁',
      status: 'coming-soon',
    },
    {
      title: 'Tournament Brackets',
      description: 'Visual tournament brackets with live match tracking',
      icon: '🏅',
      status: 'coming-soon',
    },
    {
      title: 'Replay Analysis',
      description: 'Upload and analyze game replays with AI insights',
      icon: '🎬',
      status: 'coming-soon',
    },
    {
      title: 'Team Management',
      description: 'Advanced team creation, roles, and strategy planning',
      icon: '⚔️',
      status: 'coming-soon',
    },
    {
      title: 'Streaming Integration',
      description: 'Connect your Twitch/YouTube streams to your profile',
      icon: '📺',
      status: 'coming-soon',
    },
    {
      title: 'Mobile App',
      description: 'Native iOS and Android apps for on-the-go gaming',
      icon: '📱',
      status: 'coming-soon',
    },
    {
      title: 'Pro Team Scouting',
      description: 'Get discovered by professional esports organizations',
      icon: '⭐',
      status: 'coming-soon',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="container mx-auto">
        {/* Live Now Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Live Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {liveFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass rounded-xl p-6 border border-green-500/30"
              >
                {feature.link ? (
                  <Link to={feature.link}>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                    <span className="inline-block mt-4 text-sm text-green-400">
                      ✓ Available Now
                    </span>
                  </Link>
                ) : (
                  <>
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                    <span className="inline-block mt-4 text-sm text-green-400">
                      ✓ Available Now
                    </span>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Coming Soon
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {comingSoonFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass rounded-xl p-6 border border-yellow-500/30 opacity-75"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
                <span className="inline-block mt-4 text-sm text-yellow-400">
                  ⏳ Coming Soon
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureGrid


