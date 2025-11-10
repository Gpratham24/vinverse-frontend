/**
 * Connections List Component - Shows followers or following list.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const ConnectionsList = ({ connections, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const list = type === "followers" ? connections?.followers || [] : connections?.following || [];
  const count = type === "followers" ? connections?.followers_count || 0 : connections?.following_count || 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-neon-purple transition-colors cursor-pointer"
      >
        <span className="font-semibold">{count}</span>{" "}
        <span className="text-white/60">{type === "followers" ? "Followers" : "Following"}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-neon-purple/30">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
                    {type === "followers" ? "Followers" : "Following"}
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/60 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 space-y-3">
                  {list.length === 0 ? (
                    <div className="text-center py-10 text-white/60">
                      No {type === "followers" ? "followers" : "following"} yet
                    </div>
                  ) : (
                    list.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-4 p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-colors"
                      >
                        <Link
                          to={`/profile/${user.id}`}
                          className="flex items-center space-x-4 flex-1"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center text-white font-bold">
                              {user.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            {user.is_online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-white font-semibold">{user.username}</p>
                              {user.verified && (
                                <span className="text-blue-400 text-sm">✓</span>
                              )}
                            </div>
                            <p className="text-white/60 text-sm">{user.gamer_tag || user.vin_id}</p>
                            {user.rank && (
                              <p className="text-neon-purple text-xs mt-1">{user.rank}</p>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConnectionsList;

