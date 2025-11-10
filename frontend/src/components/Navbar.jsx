/**
 * Navigation bar component.
 * Shows logo, navigation links, and auth buttons.
 */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import NotificationsBell from "./NotificationsBell";

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if a route is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 glass border-b border-neon-purple/30"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-neon-purple to-purple-400 bg-clip-text text-transparent"
          >
            VinVerse
          </motion.div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`transition-colors ${
              isActive("/")
                ? "text-neon-purple font-semibold"
                : "text-white/80 hover:text-neon-purple"
            }`}
          >
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/tournaments"
                className={`transition-colors ${
                  isActive("/tournaments")
                    ? "text-neon-purple font-semibold"
                    : "text-white/80 hover:text-neon-purple"
                }`}
              >
                Tournaments
              </Link>
              <Link
                to="/feed"
                className={`transition-colors ${
                  isActive("/feed")
                    ? "text-neon-purple font-semibold"
                    : "text-white/80 hover:text-neon-purple"
                }`}
              >
                Feed
              </Link>
              <Link
                to="/team-finder"
                className={`transition-colors ${
                  isActive("/team-finder")
                    ? "text-neon-purple font-semibold"
                    : "text-white/80 hover:text-neon-purple"
                }`}
              >
                Team Finder
              </Link>
              <Link
                to="/leaderboard"
                className={`transition-colors ${
                  isActive("/leaderboard")
                    ? "text-neon-purple font-semibold"
                    : "text-white/80 hover:text-neon-purple"
                }`}
              >
                Leaderboard
              </Link>
              <Link
                to="/chat"
                className={`transition-colors ${
                  isActive("/chat")
                    ? "text-neon-purple font-semibold"
                    : "text-white/80 hover:text-neon-purple"
                }`}
              >
                Chat
              </Link>
              <Link
                to="/dashboard"
                className={`transition-colors ${
                  isActive("/dashboard")
                    ? "text-neon-purple font-semibold"
                    : "text-white/80 hover:text-neon-purple"
                }`}
              >
                Dashboard
              </Link>
            </>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NotificationsBell />
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-neon-purple transition-colors group"
              >
                <span className="font-medium hidden lg:inline">
                  {user?.username || "User"}
                </span>
                <span className="font-medium lg:hidden">
                  {user?.username?.substring(0, 8) || "User"}
                </span>
                {user?.streak_days > 0 && (
                  <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    🔥 {user.streak_days}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm bg-neon-purple hover:bg-neon-purple-dark rounded-lg glow-button transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Always visible on mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2.5 min-w-[44px] min-h-[44px] text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple/30 transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 z-50"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className="w-7 h-7 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-neon-purple/30 bg-black/80 backdrop-blur-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 transition-colors ${
                  isActive("/")
                    ? "text-neon-purple font-semibold"
                    : "text-white/80 hover:text-neon-purple"
                }`}
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/tournaments"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 transition-colors ${
                      isActive("/tournaments")
                        ? "text-neon-purple font-semibold"
                        : "text-white/80 hover:text-neon-purple"
                    }`}
                  >
                    Tournaments
                  </Link>
                  <Link
                    to="/feed"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 transition-colors ${
                      isActive("/feed")
                        ? "text-neon-purple font-semibold"
                        : "text-white/80 hover:text-neon-purple"
                    }`}
                  >
                    Feed
                  </Link>
                  <Link
                    to="/team-finder"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 transition-colors ${
                      isActive("/team-finder")
                        ? "text-neon-purple font-semibold"
                        : "text-white/80 hover:text-neon-purple"
                    }`}
                  >
                    Team Finder
                  </Link>
                  <Link
                    to="/leaderboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 transition-colors ${
                      isActive("/leaderboard")
                        ? "text-neon-purple font-semibold"
                        : "text-white/80 hover:text-neon-purple"
                    }`}
                  >
                    Leaderboard
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 transition-colors ${
                      isActive("/chat")
                        ? "text-neon-purple font-semibold"
                        : "text-white/80 hover:text-neon-purple"
                    }`}
                  >
                    Chat
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 transition-colors ${
                      isActive("/dashboard")
                        ? "text-neon-purple font-semibold"
                        : "text-white/80 hover:text-neon-purple"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
                    <NotificationsBell />
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-white/80 hover:text-neon-purple transition-colors"
                    >
                      <span className="font-medium">
                        {user?.username || "User"}
                      </span>
                      {user?.streak_days > 0 && (
                        <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                          🔥 {user.streak_days}
                        </span>
                      )}
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm text-center text-white/80 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm text-center bg-neon-purple hover:bg-neon-purple-dark rounded-lg glow-button transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
