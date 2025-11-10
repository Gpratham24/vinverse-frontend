/**
 * Signup Page - Simplified user registration form with real-time username checking.
 * Fields: Username, Email, Password, Game ID (gamer_tag)
 */
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { registerUser, checkUsernameAvailability } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    gamer_tag: "",
  });
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null); // null, 'checking', 'available', 'taken'
  const navigate = useNavigate();
  const { login } = useAuth();

  // Debounce username checking
  useEffect(() => {
    const username = formData.username.trim();

    // Reset status if username is empty
    if (!username) {
      setUsernameStatus(null);
      return;
    }

    // Don't check if username is too short
    if (username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    // Set checking status
    setUsernameStatus("checking");

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(username);
        // Only update status if we got a valid response
        if (result && typeof result.available === "boolean") {
          setUsernameStatus(result.available ? "available" : "taken");
        }
      } catch (err) {
        // Handle different types of errors
        if (
          err.code === "ERR_NETWORK" ||
          err.message?.includes("Network Error") ||
          err.message?.includes("CONNECTION_REFUSED")
        ) {
          // Network/connection error - don't show red cross, just reset
          setUsernameStatus(null);
        } else if (err.response && err.response.data) {
          // API responded with error data
          const data = err.response.data;
          if (data.available === false) {
            setUsernameStatus("taken");
          } else {
            // Other API error - reset status
            setUsernameStatus(null);
          }
        } else {
          // Unknown error - reset status (don't show red cross)
          setUsernameStatus(null);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      login(data);
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.refetchQueries({ queryKey: ["userProfile"] });
      // Invalidate tournaments to refresh with user context
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      navigate("/tournaments");
    },
    onError: (err) => {
      const errorMsg = err.response?.data;
      if (typeof errorMsg === "object") {
        // Handle username uniqueness error
        if (errorMsg.username) {
          setError(`Username already exists: ${errorMsg.username[0]}`);
          setUsernameStatus("taken");
        } else if (errorMsg.email) {
          setError(`Email already registered: ${errorMsg.email[0]}`);
        } else {
          setError(
            Object.values(errorMsg).flat().join(", ") || "Registration failed."
          );
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (usernameStatus === "taken") {
      setError("Please choose a different username.");
      return;
    }

    if (usernameStatus === "checking") {
      setError("Please wait while we check username availability.");
      return;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    signupMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-6 sm:p-8 w-full max-w-md border border-neon-purple/30"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent">
          Join VinVerse
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username *</label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                minLength={3}
                className={`w-full px-4 py-2 pr-10 bg-black/50 border rounded-lg focus:outline-none transition-colors ${
                  usernameStatus === "available"
                    ? "border-green-500 focus:border-green-400"
                    : usernameStatus === "taken"
                    ? "border-red-500 focus:border-red-400"
                    : "border-white/20 focus:border-neon-purple"
                }`}
                placeholder="Choose a unique username"
              />
              {/* Username status indicator */}
              {formData.username.length >= 3 && usernameStatus && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {usernameStatus === "checking" && (
                    <div className="w-5 h-5 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {usernameStatus === "available" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500 text-xl"
                    >
                      ✓
                    </motion.div>
                  )}
                  {usernameStatus === "taken" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-red-500 text-xl"
                    >
                      ✕
                    </motion.div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-white/50 mt-1">
              {usernameStatus === "available" && (
                <span className="text-green-400">✓ Username is available!</span>
              )}
              {usernameStatus === "taken" && (
                <span className="text-red-400">✕ Username already taken</span>
              )}
              {usernameStatus === "checking" && (
                <span className="text-neon-purple">
                  Checking availability...
                </span>
              )}
              {!usernameStatus && formData.username.length < 3 && (
                <span>Must be unique and at least 3 characters</span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Game ID *</label>
            <input
              type="text"
              value={formData.gamer_tag}
              onChange={(e) =>
                setFormData({ ...formData, gamer_tag: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              placeholder="Your in-game username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={8}
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={formData.password2}
              onChange={(e) =>
                setFormData({ ...formData, password2: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple"
              placeholder="Re-enter your password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={
              signupMutation.isPending ||
              usernameStatus === "taken" ||
              usernameStatus === "checking"
            }
            className="w-full py-3 bg-gradient-to-r from-neon-purple to-pink-500 rounded-lg font-semibold glow-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signupMutation.isPending ? "Creating account..." : "Sign Up 🚀"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-white/60">
          Already have an account?{" "}
          <Link to="/login" className="text-neon-purple hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
