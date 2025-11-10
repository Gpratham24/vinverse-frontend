/**
 * Follow Button - Follow/Unfollow user button.
 */
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { followUser, unfollowUser } from "../../api/gamerlink";

const FollowButton = ({
  userId,
  isFollowing: initialIsFollowing,
  onFollowChange,
}) => {
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing || false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setIsFollowing(initialIsFollowing || false);
  }, [initialIsFollowing]);

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: (data) => {
      setIsFollowing(true);
      // Invalidate all related queries to refresh counts
      queryClient.invalidateQueries({ queryKey: ["userConnections"] });
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      // Refetch all connection queries to update counts
      queryClient.refetchQueries({ queryKey: ["userConnections"] });
      // Call callback after state update
      setTimeout(() => {
        if (onFollowChange) onFollowChange(true);
      }, 200);
    },
    onError: (error) => {
      console.error("Follow error:", error);
      // Revert state on error
      setIsFollowing(false);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId),
    onSuccess: (data) => {
      setIsFollowing(false);
      // Invalidate all related queries to refresh counts
      queryClient.invalidateQueries({ queryKey: ["userConnections"] });
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      // Refetch all connection queries to update counts
      queryClient.refetchQueries({ queryKey: ["userConnections"] });
      // Call callback after state update
      setTimeout(() => {
        if (onFollowChange) onFollowChange(false);
      }, 200);
    },
    onError: (error) => {
      console.error("Unfollow error:", error);
      // Revert state on error
      setIsFollowing(true);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent double clicks and concurrent requests
    if (
      isProcessing ||
      followMutation.isPending ||
      unfollowMutation.isPending
    ) {
      return;
    }

    setIsProcessing(true);

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync();
      } else {
        await followMutation.mutateAsync();
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
      // Error is already logged in mutation onError
    } finally {
      // Reset processing flag after a delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={
        isProcessing || followMutation.isPending || unfollowMutation.isPending
      }
      className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
        isFollowing
          ? "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          : "bg-gradient-to-r from-neon-purple to-pink-500 hover:from-neon-purple-dark hover:to-pink-600 glow-button text-white"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {followMutation.isPending || unfollowMutation.isPending
        ? "..."
        : isFollowing
        ? "Following"
        : "Follow"}
    </motion.button>
  );
};

export default FollowButton;
