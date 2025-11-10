/**
 * Post Comments Component - Shows comments for a post.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

const PostComments = ({ postId, getCommentsQuery, createCommentMutation, commentInputs, setCommentInputs }) => {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = getCommentsQuery(postId);
  const [commentContent, setCommentContent] = useState(commentInputs[postId] || "");

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (commentContent.trim()) {
      createCommentMutation.mutate({ postId, content: commentContent });
      setCommentContent("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 pt-4 border-t border-white/10"
    >
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={commentContent}
            onChange={(e) => {
              setCommentContent(e.target.value);
              setCommentInputs({ ...commentInputs, [postId]: e.target.value });
            }}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-sm"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!commentContent.trim() || createCommentMutation.isPending}
            className="px-4 py-2 bg-neon-purple hover:bg-neon-purple-dark rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {createCommentMutation.isPending ? "..." : "Post"}
          </motion.button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-white/60 text-sm">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-white/40 text-sm">No comments yet. Be the first!</div>
        ) : (
          comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start space-x-3 p-3 bg-black/30 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {comment.author?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-white font-semibold text-sm">{comment.author?.username}</span>
                  {comment.author?.verified && (
                    <span className="text-blue-400 text-xs">✓</span>
                  )}
                  <span className="text-white/40 text-xs">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white/80 text-sm">{comment.content}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default PostComments;

