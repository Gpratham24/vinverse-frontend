/**
 * Feed Page - Social feed showing posts from followed users.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserFeed,
  createPost,
  togglePostLike,
  getPostComments,
  createPostComment,
} from "../api/gamerlink";
import { useAuth } from "../hooks/useAuth";
import PostComments from "../components/posts/PostComments";

const FeedPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPostForm, setShowPostForm] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'following', 'my'
  const [expandedComments, setExpandedComments] = useState({}); // { postId: true/false }
  const [commentInputs, setCommentInputs] = useState({}); // { postId: '' }

  // Fetch feed with filter
  const { data: feedData, isLoading } = useQuery({
    queryKey: ["userFeed", filter],
    queryFn: () => getUserFeed(filter),
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });

  const posts = feedData?.posts || [];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
      queryClient.refetchQueries({ queryKey: ["userFeed"] });
      setPostContent("");
      setShowPostForm(false);
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: ({ postId, isLiked }) => togglePostLike(postId, isLiked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: ({ postId, content }) => createPostComment(postId, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
      setCommentInputs({ ...commentInputs, [variables.postId]: "" });
    },
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (postContent.trim()) {
      createPostMutation.mutate({ content: postContent });
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
              Feed
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPostForm(!showPostForm)}
              className="w-full sm:w-auto px-6 py-2.5 bg-neon-purple hover:bg-neon-purple-dark rounded-lg text-sm font-semibold transition-all shadow-lg"
            >
              {showPostForm ? "Cancel" : "+ New Post"}
            </motion.button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 sm:space-x-4 border-b border-white/10 overflow-x-auto">
            {[
              { id: "all", label: "All Posts" },
              { id: "following", label: "Following" },
              { id: "my", label: "My Posts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  filter === tab.id
                    ? "border-neon-purple text-neon-purple"
                    : "border-transparent text-white/60 hover:text-white/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Create Post Form */}
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 sm:p-6 mb-6 border border-neon-purple/30"
          >
            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows="4"
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 transition-all resize-none"
              />
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={createPostMutation.isPending || !postContent.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-neon-purple to-pink-500 rounded-lg font-semibold glow-button disabled:opacity-50"
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="text-neon-purple text-xl">Loading feed...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass rounded-xl p-8 border border-neon-purple/30"
          >
            <p className="text-white/60 text-xl mb-4">
              {filter === "my"
                ? "You haven't posted anything yet"
                : filter === "following"
                ? "Your feed is empty. Follow other gamers to see their posts here!"
                : "No posts yet. Be the first to post!"}
            </p>
            {filter !== "my" && (
              <p className="text-white/40">Create a post to get started!</p>
            )}
          </motion.div>
        )}

        {/* Posts */}
        {!isLoading && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 border border-neon-purple/30"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center text-white font-bold">
                    {post.author?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {post.author?.username}
                    </p>
                    <p className="text-white/50 text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-white/90 mb-4">{post.content}</p>

                {/* Like and Comment Actions */}
                <div className="flex items-center space-x-6 mb-4 pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      likePostMutation.mutate({
                        postId: post.id,
                        isLiked: post.is_liked,
                      })
                    }
                    className={`flex items-center space-x-2 transition-colors ${
                      post.is_liked
                        ? "text-red-500"
                        : "text-white/60 hover:text-red-400"
                    }`}
                  >
                    <span className="text-xl">
                      {post.is_liked ? "❤️" : "🤍"}
                    </span>
                    <span className="text-sm font-medium">
                      {post.likes_count || 0}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setExpandedComments({
                        ...expandedComments,
                        [post.id]: !expandedComments[post.id],
                      })
                    }
                    className="flex items-center space-x-2 text-white/60 hover:text-neon-purple transition-colors"
                  >
                    <span className="text-xl">💬</span>
                    <span className="text-sm font-medium">
                      {post.comments_count || 0}
                    </span>
                  </motion.button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {expandedComments[post.id] && (
                    <PostComments
                      postId={post.id}
                      createCommentMutation={createCommentMutation}
                      commentInputs={commentInputs}
                      setCommentInputs={setCommentInputs}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
