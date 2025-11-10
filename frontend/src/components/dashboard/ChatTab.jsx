/**
 * Chat Tab - Real-time chat using WebSocket (Django Channels)
 * Supports public and private rooms
 */
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getRooms, getMessages } from "../../api/chat";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

const ChatTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState("lobby");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("global");
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const isInitialMountRef = useRef(true);

  const { data: rooms = [] } = useQuery({
    queryKey: ["chatRooms"],
    queryFn: () => getRooms(),
  });

  const createRoomMutation = useMutation({
    mutationFn: async (roomData) => {
      const response = await api.post("/chat/rooms/", roomData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      setShowCreateRoom(false);
      setNewRoomName("");
      setNewRoomType("global");
      setNewRoomPrivate(false);
    },
  });

  // Load initial messages
  const { data: initialMessages = [] } = useQuery({
    queryKey: ["chatMessages", selectedRoom],
    queryFn: () => getMessages(selectedRoom),
    enabled: !!selectedRoom,
  });

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Prevent page scroll when component mounts
  useEffect(() => {
    // Reset scroll position when chat tab is opened
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Initialize WebSocket connection (Django Channels)
  useEffect(() => {
    if (!user) return;

    // Close existing socket if any
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    let ws = null;

    // WebSocket URL - must connect directly to backend (not through Netlify proxy)
    // WebSockets don't work through HTTP proxies, so we need the actual backend URL
    let baseUrl;

    // Helper function to convert HTTP/HTTPS URL to WebSocket URL
    const convertToWebSocketUrl = (url) => {
      return url
        .replace("/api/", "")
        .replace("http://", "ws://")
        .replace("https://", "wss://")
        .replace(/\/$/, "");
    };

    // Check for explicit WebSocket URL in environment (highest priority)
    if (import.meta.env.VITE_WS_URL) {
      baseUrl = import.meta.env.VITE_WS_URL.replace(/\/$/, "");
    }
    // Check for API URL in environment (convert to WebSocket)
    else if (import.meta.env.VITE_API_URL) {
      baseUrl = convertToWebSocketUrl(import.meta.env.VITE_API_URL);
    }
    // Production fallback: Use Railway backend URL from netlify.toml
    else if (import.meta.env.PROD) {
      // Default Railway backend URL (update this if your Railway domain changes)
      const railwayUrl = "https://vinverse-backend.up.railway.app";
      baseUrl = convertToWebSocketUrl(railwayUrl);
      console.warn(
        "Using default Railway URL for WebSocket. Consider setting VITE_WS_URL or VITE_API_URL environment variable."
      );
    }
    // Development: Use local backend
    else {
      baseUrl = "ws://localhost:8000";
    }

    // Get JWT token for WebSocket authentication
    const token = localStorage.getItem("access_token");

    // WebSocket URL with JWT token as query parameter
    const wsPath = `/ws/chat/${selectedRoom}/`;
    const queryString = token ? `?token=${encodeURIComponent(token)}` : "";
    const wsUrl = `${baseUrl}${wsPath}${queryString}`;
    console.log(
      "Connecting to WebSocket:",
      wsUrl.replace(/token=[^&]+/, "token=***")
    ); // Log without exposing token
    ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to chat");
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        // Deduplicate messages by message_id or timestamp+content+user_id
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(
            (msg) =>
              (msg.message_id && msg.message_id === data.message_id) ||
              (msg.timestamp === data.timestamp &&
                msg.message === data.message &&
                msg.user_id === data.user_id)
          );
          if (exists) {
            console.log("Duplicate message detected, skipping:", data);
            return prev;
          }
          return [...prev, data];
        });

        // Track active user
        if (data.user_id && data.username) {
          setActiveUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(data.user_id, {
              id: data.user_id,
              username: data.username,
            });
            return newMap;
          });
        }
      } else if (data.type === "history") {
        setMessages(data.messages || []);
        // Extract active users from history
        const users = new Map();
        (data.messages || []).forEach((msg) => {
          if (msg.user_id && msg.username) {
            users.set(msg.user_id, { id: msg.user_id, username: msg.username });
          }
        });
        setActiveUsers(users);
      } else if (data.type === "user_joined") {
        // Track when a user joins
        if (data.user_id && data.username) {
          setActiveUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(data.user_id, {
              id: data.user_id,
              username: data.username,
            });
            return newMap;
          });
        }
      } else if (data.type === "user_left") {
        // Remove user when they leave
        if (data.user_id) {
          setActiveUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.user_id);
            return newMap;
          });
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log("Disconnected from chat", event.code, event.reason);
      setIsConnected(false);
      setSocket(null);
      socketRef.current = null;
    };

    return () => {
      // Close socket on cleanup
      if (socketRef.current) {
        if (
          socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING
        ) {
          socketRef.current.close();
        }
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [user, selectedRoom]);

  // Check if user is near bottom of scroll container
  const checkIfNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };

  // Scroll to bottom only if user is near bottom or it's a new message from current user
  useEffect(() => {
    // Skip auto-scroll on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      // Only scroll on initial load if there are messages
      if (messages.length > 0) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 100);
      }
      return;
    }

    // Only auto-scroll if user is near bottom or should auto-scroll
    if (shouldAutoScrollRef.current || checkIfNearBottom()) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages]);

  // Track scroll position to determine if we should auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      shouldAutoScrollRef.current = checkIfNearBottom();
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    const currentSocket = socketRef.current || socket;
    if (
      !message.trim() ||
      !currentSocket ||
      currentSocket.readyState !== WebSocket.OPEN
    )
      return;

    // Enable auto-scroll when user sends a message
    shouldAutoScrollRef.current = true;

    currentSocket.send(
      JSON.stringify({
        type: "chat_message",
        message: message.trim(),
      })
    );

    setMessage("");
  };

  const handleRoomChange = (roomName) => {
    setSelectedRoom(roomName);
    setMessages([]);
    setActiveUsers(new Map());
    shouldAutoScrollRef.current = true;
    isInitialMountRef.current = true;
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const roomData = {
      name: newRoomName.toLowerCase().replace(/\s+/g, "-"),
      display_name: newRoomName,
      room_type: newRoomType,
      is_private: newRoomPrivate,
      description: newRoomPrivate ? "Private room" : "",
    };

    createRoomMutation.mutate(roomData);
  };

  const publicRooms = rooms.filter((r) => !r.is_private);
  const privateRooms = rooms.filter((r) => r.is_private && r.is_member);

  // Convert Map to Array for rendering
  const activeUsersArray = Array.from(activeUsers.values());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-16rem)] sm:h-[calc(100vh-18rem)] lg:h-[700px] max-h-[700px] overflow-hidden">
      {/* Rooms Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass rounded-xl p-4 border border-neon-purple/30 flex flex-col h-full min-h-0"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Rooms</h3>
          <button
            onClick={() => setShowCreateRoom(!showCreateRoom)}
            className="px-2 py-1 text-sm bg-neon-purple/20 text-neon-purple rounded hover:bg-neon-purple/30"
          >
            +
          </button>
        </div>

        {/* Create Room Form */}
        {showCreateRoom && (
          <form
            onSubmit={handleCreateRoom}
            className="mb-4 p-3 bg-black/30 rounded-lg space-y-2"
          >
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name"
              className="w-full px-2 py-1 bg-black/50 border border-white/20 rounded text-white text-sm"
            />
            <select
              value={newRoomType}
              onChange={(e) => setNewRoomType(e.target.value)}
              className="w-full px-2 py-1 bg-black/50 border border-white/20 rounded text-white text-sm"
            >
              <option value="global">Global</option>
              <option value="game">Game Channel</option>
              <option value="private">Private</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={newRoomPrivate}
                onChange={(e) => setNewRoomPrivate(e.target.checked)}
                className="rounded"
              />
              Private Room
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-2 py-1 bg-neon-purple text-white rounded text-sm hover:bg-purple-600"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateRoom(false)}
                className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {/* Public Rooms */}
          {publicRooms.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2 uppercase">Public</p>
              {publicRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomChange(room.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                    selectedRoom === room.name
                      ? "bg-neon-purple text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  🌐 {room.display_name || room.name}
                </button>
              ))}
            </div>
          )}

          {/* Private Rooms */}
          {privateRooms.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase">Private</p>
              {privateRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomChange(room.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                    selectedRoom === room.name
                      ? "bg-neon-purple text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  🔒 {room.display_name || room.name}
                </button>
              ))}
            </div>
          )}

          {/* Default Lobby if no rooms */}
          {rooms.length === 0 && (
            <button
              onClick={() => handleRoomChange("lobby")}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                selectedRoom === "lobby"
                  ? "bg-neon-purple text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              🌐 Global Lobby
            </button>
          )}
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-3 glass rounded-xl p-4 border border-neon-purple/30 flex flex-col h-full min-h-0 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">
            {rooms.find((r) => r.name === selectedRoom)?.display_name ||
              "Global Lobby"}
          </h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-xs text-gray-400">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Messages - Fixed height with scroll */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto mb-4 space-y-2 custom-scrollbar min-h-0"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-center">
                {isConnected
                  ? "No messages yet. Start the conversation!"
                  : "Connecting..."}
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`p-3 rounded-lg ${
                  msg.user_id === user?.id
                    ? "bg-neon-purple/30 ml-auto max-w-[80%]"
                    : "bg-black/30 max-w-[80%]"
                }`}
              >
                <p className="text-xs text-gray-400 mb-1">{msg.username}</p>
                <p className="text-white">{msg.message || msg.content}</p>
                {msg.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-white"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-2 bg-neon-purple text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </motion.div>

      {/* Active Users Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex glass rounded-xl p-4 border border-neon-purple/30 flex-col h-full min-h-0"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Active Users</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {activeUsersArray.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No active users yet
            </p>
          ) : (
            activeUsersArray.map((activeUser) => (
              <div
                key={activeUser.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {activeUser.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {activeUser.username}
                  </p>
                  <p className="text-green-400 text-xs">Online</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400 text-center">
            {activeUsersArray.length} active
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatTab;
