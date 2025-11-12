/**
 * Search Modal - Popup for searching players
 * Opens when user clicks search icon in navbar
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BiX,
  BiSearch,
  BiCheck,
  BiArrowRight,
  BiJoystick,
} from "bootstrap-icons/react";
import { searchPlayers } from "../api/auth";
import { Link } from "react-router-dom";

const SearchModal = ({ isOpen, onClose }) => {
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
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search query with debounced value
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["playerSearch", debouncedQuery],
    queryFn: () => searchPlayers(debouncedQuery),
    enabled: isSearching && debouncedQuery.trim().length >= 2,
    staleTime: 5000,
    retry: 1,
  });

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

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

  const handleClose = () => {
    setSearchQuery("");
    setIsSearching(false);
    onClose();
  };

  const players = searchResults?.players || [];
  const hasResults = players.length > 0;
  const showNoResults =
    isSearching &&
    debouncedQuery.length >= 2 &&
    !isLoading &&
    !hasResults &&
    !error;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full z-[101] max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass rounded-2xl border border-neon-purple/30 shadow-2xl flex flex-col max-h-full overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-purple via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Search Players
                  </h2>
                  <p className="text-white/60 text-sm mt-1">
                    Find players by username, gamer tag, or VIN ID
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close search modal"
                >
                  <BiX className="w-6 h-6" />
                </button>
              </div>

              {/* Search Form */}
              <div className="p-6 border-b border-white/10">
                <form onSubmit={handleSearch}>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        placeholder="Enter username, gamer tag, or VIN ID..."
                        className="w-full px-4 py-3 min-h-[48px] bg-black/50 border-2 border-white/20 rounded-xl focus:outline-none focus:border-neon-purple focus:ring-4 focus:ring-neon-purple/20 text-white placeholder-white/50 transition-all"
                        aria-label="Search for players by username, gamer tag, or VIN ID"
                        autoFocus
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all min-w-[32px] min-h-[32px]"
                          aria-label="Clear search"
                        >
                          <BiX className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={searchQuery.trim().length < 2}
                      className="px-6 py-3 min-h-[48px] min-w-[100px] bg-gradient-to-r from-neon-purple to-pink-500 rounded-xl font-semibold glow-button disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-neon-purple/50 transition-all"
                      aria-label="Search for players"
                    >
                      Search
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* Search Results - Scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
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
                        {error.response?.data?.error ||
                          error.message ||
                          "Failed to search players. Please try again."}
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
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full mx-auto mb-4"
                      />
                      <div className="text-neon-purple text-lg font-semibold">
                        Searching...
                      </div>
                    </motion.div>
                  )}

                  {!isSearching && searchQuery.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <BiSearch className="w-16 h-16 mx-auto mb-4 text-white/40" />
                      <div className="text-white/60 text-lg">
                        Start typing to search for players
                      </div>
                    </motion.div>
                  )}

                  {showNoResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center py-12"
                    >
                      <BiSearch className="w-16 h-16 mx-auto mb-4 text-white/40" />
                      <div className="text-white/80 text-xl font-semibold mb-2">
                        No players found
                      </div>
                      <p className="text-white/50 text-sm">
                        No players match "{debouncedQuery}". Try a different
                        search term.
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
                      <div className="text-white/70 text-sm font-semibold mb-4">
                        Found {searchResults?.count || 0} player
                        {searchResults?.count !== 1 ? "s" : ""}
                      </div>
                      <div className="space-y-3">
                        {players.map((player, index) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                              delay: index * 0.05,
                              type: "spring",
                              stiffness: 100,
                            }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="group relative"
                          >
                            <Link
                              to={`/profile/${player.id}`}
                              onClick={handleClose}
                              className="block"
                            >
                              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-black/60 via-purple-900/20 to-black/60 border-2 border-white/10 group-hover:border-neon-purple/50 transition-all duration-300 shadow-xl">
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

                                <div className="relative p-4 flex items-center space-x-4">
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
                                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-neon-purple via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg border-4 border-black/50 group-hover:border-neon-purple/50 transition-all">
                                      {player.username
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                      {player.is_online && (
                                        <motion.span
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black shadow-lg"
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

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className="text-white font-bold text-lg truncate group-hover:text-neon-purple transition-colors">
                                        {player.username}
                                      </h3>
                                      {player.verified && (
                                        <BiCheck
                                          className="text-blue-400 text-lg flex-shrink-0"
                                          title="Verified Player"
                                        />
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                                      {player.gamer_tag && (
                                        <span className="px-2 py-1 bg-white/10 rounded-md border border-white/20 flex items-center gap-1">
                                          <BiJoystick className="text-xs" />
                                          {player.gamer_tag}
                                        </span>
                                      )}
                                      {player.vin_id && (
                                        <span className="px-2 py-1 bg-neon-purple/20 text-neon-purple rounded-md border border-neon-purple/30 font-mono">
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

                                  <motion.div
                                    className="text-neon-purple text-xl flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    animate={{
                                      x: [0, 5, 0],
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                  >
                                    <BiArrowRight />
                                  </motion.div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
