/**
 * Footer - Gaming-themed footer with links, social media, and credits.
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tournaments', path: '/tournaments' },
    { name: 'Feed', path: '/feed' },
    { name: 'Team Finder', path: '/team-finder' },
  ]

  const games = [
    { name: 'BGMI', path: '#' },
    { name: 'Free Fire', path: '#' },
    { name: 'Valorant', path: '#' },
    { name: 'CS:GO', path: '#' },
  ]

  const support = [
    { name: 'Help Center', path: '#' },
    { name: 'Contact Us', path: '#' },
    { name: 'Privacy Policy', path: '#' },
    { name: 'Terms of Service', path: '#' },
  ]

  const socialLinks = [
    { name: 'Discord', icon: '💬', url: '#', color: 'hover:text-indigo-400' },
    { name: 'Twitter', icon: '𝕏', url: '#', color: 'hover:text-blue-400' },
    { name: 'Twitch', icon: '📺', url: '#', color: 'hover:text-purple-400' },
    { name: 'YouTube', icon: '▶️', url: '#', color: 'hover:text-red-400' },
    { name: 'Instagram', icon: '📷', url: '#', color: 'hover:text-pink-400' },
  ]

  return (
    <footer className="relative py-8 sm:py-12 px-4 sm:px-6 border-t border-white/10 bg-gradient-to-b from-black/50 to-black mt-auto">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent mb-4">
              VinVerse
            </h3>
            <p className="text-white/60 text-sm mb-4">
              India's Premier eSports Platform. Compete, Connect, Conquer.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -3 }}
                  className={`text-2xl text-white/60 ${social.color} transition-colors`}
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-white/60 hover:text-neon-purple transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Games */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h4 className="text-white font-semibold mb-4 text-lg">Games</h4>
            <ul className="space-y-2">
              {games.map((game, index) => (
                <li key={index}>
                  <Link
                    to={game.path}
                    className="text-white/60 hover:text-neon-purple transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    {game.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h4 className="text-white font-semibold mb-4 text-lg">Support</h4>
            <ul className="space-y-2">
              {support.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-white/60 hover:text-neon-purple transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4"
        >
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} VinVerse. All rights reserved.
            </p>
          </div>

          {/* Developer Credit */}
          <div className="text-center md:text-right">
            <p className="text-white/50 text-sm">
              Developed by <span className="text-neon-purple font-semibold">Blacky</span>
            </p>
          </div>
        </motion.div>

        {/* Gaming Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-white/40 text-xs">
            Made with <span className="text-red-400">❤️</span> for all gamers <span className="text-yellow-400">🎮</span>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer


