/**
 * Profile Page - User profile view and edit.
 * Supports viewing own profile or other users' profiles by ID.
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  getUserProfile,
  getUserProfileById,
  updateUserProfile,
} from "../api/auth";
import { getUserConnections } from "../api/gamerlink";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import FollowButton from "../components/gamerlink/FollowButton";
import ConnectionsList from "../components/gamerlink/ConnectionsList";

const ProfilePage = () => {
  const { userId } = useParams(); // Get userId from URL params
  const { user: authUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    bio: "",
    rank: "",
    gamer_tag: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Determine if viewing own profile or another user's profile
  const isViewingOwnProfile = !userId || userId === authUser?.id?.toString();

  // Fetch user profile - either current user or by ID
  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => {
      if (isViewingOwnProfile) {
        return getUserProfile();
      } else {
        return getUserProfileById(userId);
      }
    },
    enabled: !!authUser || !!userId,
  });

  // Fetch connections (followers/following) for the profile being viewed
  const profileUserId = profile?.id || userId || authUser?.id;
  const {
    data: connections,
    refetch: refetchConnections,
    isLoading: connectionsLoading,
  } = useQuery({
    queryKey: ["userConnections", profileUserId],
    queryFn: () => getUserConnections(profileUserId),
    enabled: !!profileUserId && !!authUser, // Fetch when we have profileUserId and user is authenticated
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.email || "",
        bio: profile.bio || "",
        rank: profile.rank || "",
        gamer_tag: profile.gamer_tag || "",
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.refetchQueries({ queryKey: ["userProfile"] });
      // Update auth user in localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data }));
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      const errorMsg = err.response?.data;
      if (typeof errorMsg === "object") {
        setError(Object.values(errorMsg).flat().join(", ") || "Update failed.");
      } else {
        setError("Update failed. Please try again.");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-neon-purple text-xl">Loading profile...</div>
      </div>
    );
  }

  // Handle case when user profile is not found
  if (!isLoading && !profile && userId && !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Profile not found</div>
          <p className="text-white/60">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const displayUser = profile || authUser;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-20">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-6 sm:p-8 md:p-10 border border-neon-purple/30 shadow-2xl"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 md:mb-0 w-full md:w-auto">
              {/* Avatar Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-neon-purple via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-lg flex-shrink-0"
              >
                {displayUser?.username?.charAt(0).toUpperCase() || "U"}
                {/* Online Status Indicator */}
                {displayUser?.is_online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-black"></span>
                )}
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent break-words">
                    {displayUser?.username || "Profile"}
                  </h1>
                  {displayUser?.verified && (
                    <span className="text-blue-400 text-lg sm:text-xl flex-shrink-0">✓</span>
                  )}
                </div>
                <p className="text-white/60 text-xs sm:text-sm mt-1 break-all">
                  {displayUser?.vin_id || "VIN-0000000"}
                </p>
                <div className="flex items-center space-x-2 sm:space-x-4 mt-2 text-xs sm:text-sm flex-wrap">
                  {connectionsLoading ? (
                    <span className="text-white/40">Loading...</span>
                  ) : connections ? (
                    <>
                      <ConnectionsList
                        connections={connections}
                        type="followers"
                      />
                      <span className="text-white/40">•</span>
                      <ConnectionsList
                        connections={connections}
                        type="following"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-white/60">
                        0 <span className="text-white/40">Followers</span>
                      </span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/60">
                        0 <span className="text-white/40">Following</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full md:w-auto mt-4 md:mt-0">
              {!isEditing &&
                !isViewingOwnProfile &&
                profileUserId &&
                authUser && (
                  <FollowButton
                    userId={parseInt(profileUserId)}
                    isFollowing={connections?.is_following || false}
                    onFollowChange={async (isFollowing) => {
                      // Refetch connections when follow status changes to update counts
                      // Invalidate and refetch for both current user and target user
                      const currentUserId = authUser?.id;
                      setTimeout(async () => {
                        await refetchConnections();
                        queryClient.invalidateQueries({
                          queryKey: ["userConnections"],
                        });
                        queryClient.refetchQueries({
                          queryKey: ["userConnections", profileUserId],
                        });
                        // Also refetch current user's connections if viewing another user
                        if (currentUserId && currentUserId !== profileUserId) {
                          queryClient.refetchQueries({
                            queryKey: ["userConnections", currentUserId],
                          });
                        }
                      }, 300);
                    }}
                  />
                )}
              {!isEditing && isViewingOwnProfile && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex-1 md:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-neon-purple hover:bg-neon-purple-dark rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-neon-purple/50"
                  >
                    Edit Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="flex-1 md:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-xs sm:text-sm font-semibold transition-all"
                  >
                    Logout
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {success && (
            <div className="mb-4 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          {isEditing && isViewingOwnProfile ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Read-only Fields Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/20 rounded-lg border border-white/10">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80">
                    <span className="mr-2">👤</span>Username
                  </label>
                  <input
                    type="text"
                    value={displayUser?.username || ""}
                    disabled
                    className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-white/40 mt-1.5">
                    Username cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80">
                    <span className="mr-2">🆔</span>VIN ID
                  </label>
                  <input
                    type="text"
                    value={displayUser?.vin_id || ""}
                    disabled
                    className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-white/40 mt-1.5">
                    VIN ID is unique and cannot be changed
                  </p>
                </div>
              </div>

              {/* Editable Fields Section */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-white/90">
                    <span className="mr-2">📧</span>Email{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2.5 text-white/90">
                      <span className="mr-2">🎮</span>Game ID
                    </label>
                    <input
                      type="text"
                      value={formData.gamer_tag}
                      onChange={(e) =>
                        setFormData({ ...formData, gamer_tag: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 transition-all"
                      placeholder="Your in-game username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2.5 text-white/90">
                      <span className="mr-2">⭐</span>Rank
                    </label>
                    <input
                      type="text"
                      value={formData.rank}
                      onChange={(e) =>
                        setFormData({ ...formData, rank: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 transition-all"
                      placeholder="e.g., Diamond, Immortal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-white/90">
                    <span className="mr-2">📝</span>Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows="4"
                    className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                    // Reset form data
                    if (profile) {
                      setFormData({
                        email: profile.email || "",
                        bio: profile.bio || "",
                        rank: profile.rank || "",
                        gamer_tag: profile.gamer_tag || "",
                      });
                    }
                  }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-neon-purple to-pink-500 rounded-lg font-semibold glow-button disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Main Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-neon-purple/30 transition-colors"
                >
                  <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-medium">
                    Username
                  </p>
                  <p className="text-white font-bold text-lg">
                    {displayUser?.username || "N/A"}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-neon-purple/30 transition-colors"
                >
                  <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-medium">
                    VIN ID
                  </p>
                  <p className="text-neon-purple font-bold text-lg">
                    {displayUser?.vin_id || "N/A"}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-neon-purple/30 transition-colors"
                >
                  <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-medium">
                    Email
                  </p>
                  <p className="text-white font-medium break-all">
                    {displayUser?.email || "N/A"}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-neon-purple/30 transition-colors"
                >
                  <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-medium">
                    Verified Status
                  </p>
                  <div className="flex items-center space-x-2">
                    {displayUser?.verified ? (
                      <>
                        <span className="text-green-400 text-xl">✓</span>
                        <p className="text-green-400 font-semibold">Verified</p>
                      </>
                    ) : (
                      <>
                        <span className="text-white/40 text-xl">○</span>
                        <p className="text-white/40">Not Verified</p>
                      </>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-neon-purple/30 transition-colors"
                >
                  <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-medium">
                    Game ID
                  </p>
                  <p className="text-white font-medium">
                    {displayUser?.gamer_tag || (
                      <span className="text-white/40 italic">Not set</span>
                    )}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-neon-purple/30 transition-colors"
                >
                  <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-medium">
                    Rank
                  </p>
                  <p className="text-white font-medium">
                    {displayUser?.rank || (
                      <span className="text-white/40 italic">Not set</span>
                    )}
                  </p>
                </motion.div>
              </div>

              {/* Bio Section */}
              {displayUser?.bio && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-5 bg-black/20 rounded-lg border border-white/10"
                >
                  <p className="text-xs text-white/50 mb-3 uppercase tracking-wider font-medium">
                    Bio
                  </p>
                  <p className="text-white/90 leading-relaxed">
                    {displayUser.bio}
                  </p>
                </motion.div>
              )}

              {/* Member Since */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="pt-4 border-t border-white/10"
              >
                <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-medium">
                  Member Since
                </p>
                <p className="text-white/80 font-medium">
                  {displayUser?.date_joined
                    ? new Date(displayUser.date_joined).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </motion.div>

              {/* Gaming Badges Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-6 border-t border-white/10"
              >
                <h2 className="text-xl font-bold text-white mb-4 uppercase">
                  Gaming Badges
                </h2>
                {displayUser?.badges && displayUser.badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayUser.badges.map((userBadge, index) => (
                      <motion.div
                        key={userBadge.id || index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="glass rounded-xl p-4 border border-white/10 text-center"
                      >
                        <div className="text-4xl mb-2">{userBadge.badge?.icon || '🏆'}</div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          {userBadge.badge?.name || 'Badge'}
                        </h3>
                        <p className="text-xs text-white/60">
                          {userBadge.badge?.description || ''}
                        </p>
                        {userBadge.earned_at && (
                          <p className="text-xs text-white/40 mt-2">
                            {new Date(userBadge.earned_at).toLocaleDateString()}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-xl p-12 border border-white/10 text-center">
                    <div className="text-6xl mb-4 text-white/40">🏆</div>
                    <p className="text-white/80 text-lg mb-2 font-semibold">
                      No badges earned yet
                    </p>
                    <p className="text-white/60 text-sm">
                      Play tournaments and stay active to unlock achievements!
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
