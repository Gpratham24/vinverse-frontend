/**
 * Navigation bar component.
 * Shows logo, navigation links, and auth buttons.
 */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BiSearch, BiFire } from "bootstrap-icons/react";
import { useAuth } from "../hooks/useAuth";
import NotificationsBell from "./NotificationsBell";
import SearchModal from "./SearchModal";

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

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
        <div className="hidden md:flex items-center space-x-3">
          {/* Search Icon Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 hover:text-neon-purple hover:bg-white/5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-neon-purple/50"
            aria-label="Search players"
          >
            <BiSearch className="w-5 h-5" />
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications Bell - Separate */}
              <div className="flex items-center">
                <NotificationsBell />
              </div>

              {/* Profile Link - Separate */}
              <Link
                to="/profile"
                className="px-3 py-2 text-sm text-white/80 hover:text-neon-purple hover:bg-white/5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-neon-purple/50"
              >
                <span className="font-medium hidden lg:inline">
                  {user?.username || "User"}
                </span>
                <span className="font-medium lg:hidden">
                  {user?.username?.substring(0, 8) || "User"}
                </span>
              </Link>

              {/* Streak Badge - Separate */}
              {user?.streak_days > 0 && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full text-xs font-bold text-white flex items-center gap-1.5 min-h-[36px] shadow-lg border border-orange-400/30">
                  <BiFire className="text-sm" />
                  <span>{user.streak_days}</span>
                </div>
              )}
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

        {/* Mobile Navbar Actions - Visible on mobile */}
        <div className="md:hidden flex items-center gap-2">
          {/* Search Icon - Mobile */}
          {isAuthenticated && (
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 hover:text-neon-purple hover:bg-white/5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-neon-purple/50"
              aria-label="Search players"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* Notifications Bell - Mobile Navbar */}
          {isAuthenticated && (
            <div className="flex items-center">
              <NotificationsBell />
            </div>
          )}

          {/* Streak Badge - Mobile Navbar (if exists) */}
          {isAuthenticated && user?.streak_days > 0 && (
            <div className="px-2 py-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full text-xs font-bold text-white flex items-center gap-1 min-h-[36px] shadow-lg">
              <HiFire className="text-sm" />
              <span>{user.streak_days}</span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center p-2.5 min-w-[44px] min-h-[44px] text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple/30 transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple/50 z-50"
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
                  {/* User Profile Section - Mobile Menu */}
                  <div className="pt-4 border-t border-white/10">
                    {/* Profile Link - Separate and Prominent */}
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 mb-3 text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base truncate">
                          {user?.username || "User"}
                        </div>
                        <div className="text-xs text-white/60 truncate">
                          {user?.email || ""}
                        </div>
                      </div>
                    </Link>

                    {/* Search Button in Mobile Menu */}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSearchModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 mb-3 text-white/80 hover:text-neon-purple hover:bg-white/5 rounded-lg transition-all text-left"
                    >
                      <HiSearch className="w-5 h-5 flex-shrink-0" />
                      <span>Search Players</span>
                    </button>
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

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </motion.nav>
  );
};

export default Navbar;
