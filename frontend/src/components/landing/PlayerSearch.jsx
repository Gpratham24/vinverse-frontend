/**
 * Player Search Component - Search for players on landing page.
 * Discord-style user cards with animated backgrounds.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { searchPlayers } from "../../api/auth";
import { Link } from "react-router-dom";

const PlayerSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search query with debounced value
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ["playerSearch", debouncedQuery],
    queryFn: () => searchPlayers(debouncedQuery),
    enabled: isSearching && debouncedQuery.trim().length >= 2,
    staleTime: 5000,
    retry: 1,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setDebouncedQuery(searchQuery);
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const players = searchResults?.players || [];
  const hasResults = players.length > 0;
  const showNoResults = isSearching && debouncedQuery.length >= 2 && !isLoading && !hasResults && !error;

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-black/40 pointer-events-none" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 md:p-10 border border-neon-purple/30 shadow-2xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-purple via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Search Players
            </h2>
            <p className="text-white/70 text-lg">
              Find players by username, gamer tag, or VIN ID
            </p>
          </motion.div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                className="flex-1 relative"
                whileFocus={{ scale: 1.02 }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Enter username, gamer tag, or VIN ID..."
                  className="w-full px-6 py-4 bg-black/50 border-2 border-white/20 rounded-xl focus:outline-none focus:border-neon-purple focus:ring-4 focus:ring-neon-purple/20 text-white placeholder-white/50 transition-all shadow-lg"
                />
                {searchQuery && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearching(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                  >
                    ×
                  </motion.button>
                )}
              </motion.div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                disabled={searchQuery.trim().length < 2}
                className="px-8 py-4 bg-gradient-to-r from-neon-purple to-pink-500 rounded-xl font-semibold glow-button disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Search
              </motion.button>
            </div>
          </form>

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-12"
              >
                <div className="text-red-400 text-xl font-semibold mb-2">
                  Search Error
                </div>
                <p className="text-white/50 text-sm">
                  {error.response?.data?.error || error.message || "Failed to search players. Please try again."}
                </p>
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full mx-auto mb-4"
                />
                <div className="text-neon-purple text-lg font-semibold">Searching...</div>
              </motion.div>
            )}

            {showNoResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-white/80 text-xl font-semibold mb-2">
                  No players found
                </div>
                <p className="text-white/50 text-sm">
                  No players match "{debouncedQuery}". Try a different search term.
                </p>
              </motion.div>
            )}

            {hasResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/70 text-sm font-semibold mb-4 px-2"
                >
                  Found {searchResults?.count || 0} player{searchResults?.count !== 1 ? 's' : ''}
                </motion.div>
                <div className="grid gap-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group relative"
                    >
                      <Link
                        to={`/profile/${player.id}`}
                        className="block"
                      >
                        {/* Discord-style User Card */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-black/60 via-purple-900/20 to-black/60 border-2 border-white/10 group-hover:border-neon-purple/50 transition-all duration-300 shadow-xl">
                          {/* Animated background gradient */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            animate={{
                              backgroundPosition: ["0% 0%", "100% 100%"],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                            style={{
                              backgroundSize: "200% 200%",
                            }}
                          />
                          
                          {/* Content */}
                          <div className="relative p-5 flex items-center space-x-4">
                            {/* Avatar with animated border */}
                            <div className="relative flex-shrink-0">
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                animate={{
                                  boxShadow: [
                                    "0 0 0 0 rgba(147, 51, 234, 0.7)",
                                    "0 0 0 8px rgba(147, 51, 234, 0)",
                                  ],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeOut",
                                }}
                              />
                              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-neon-purple via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg border-4 border-black/50 group-hover:border-neon-purple/50 transition-all">
                                {player.username?.charAt(0).toUpperCase() || "U"}
                                {/* Online status indicator */}
                                {player.is_online && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-black shadow-lg"
                                  >
                                    <motion.span
                                      className="absolute inset-0 bg-green-500 rounded-full"
                                      animate={{
                                        scale: [1, 1.5],
                                        opacity: [0.8, 0],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeOut",
                                      }}
                                    />
                                  </motion.span>
                                )}
                              </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-white font-bold text-lg md:text-xl truncate group-hover:text-neon-purple transition-colors">
                                  {player.username}
                                </h3>
                                {player.verified && (
                                  <motion.span
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                    className="text-blue-400 text-lg flex-shrink-0"
                                    title="Verified Player"
                                  >
                                    ✓
                                  </motion.span>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                                {player.gamer_tag && (
                                  <span className="px-2 py-1 bg-white/10 rounded-md border border-white/20">
                                    🎮 {player.gamer_tag}
                                  </span>
                                )}
                                {player.vin_id && (
                                  <span className="px-2 py-1 bg-neon-purple/20 text-neon-purple rounded-md border border-neon-purple/30 font-mono text-xs">
                                    {player.vin_id}
                                  </span>
                                )}
                                {player.rank && (
                                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-md border border-yellow-500/30 font-semibold">
                                    {player.rank}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Arrow indicator */}
                            <motion.div
                              className="text-neon-purple text-2xl flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              animate={{
                                x: [0, 5, 0],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            >
                              →
                            </motion.div>
                          </div>

                          {/* Hover glow effect */}
                          <motion.div
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none"
                            style={{
                              background: "radial-gradient(circle at center, rgba(147, 51, 234, 0.2), transparent 70%)",
                            }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default PlayerSearch;

