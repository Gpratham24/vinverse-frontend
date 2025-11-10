/**
 * Chat Page - Standalone chat page with enhanced interactivity
 */
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  getRooms,
  getMessages,
  inviteUserToRoom,
  requestJoinRoom,
  searchPrivateRooms,
  getPendingRequests,
  acceptJoinRequest,
  rejectJoinRequest,
} from "../api/chat";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

const ChatPage = () => {
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
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const isInitialMountRef = useRef(true);
  const typingTimeoutRef = useRef(null);

  const { data: rooms = [] } = useQuery({
    queryKey: ["chatRooms"],
    queryFn: () => getRooms(),
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: () => getPendingRequests(),
    refetchInterval: 10000, // Refetch every 10 seconds
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

  const inviteUserMutation = useMutation({
    mutationFn: async ({ roomId, username, message }) => {
      return await inviteUserToRoom(roomId, username, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      setShowInviteModal(false);
      setInviteUsername("");
      setInviteMessage("");
    },
  });

  const requestJoinMutation = useMutation({
    mutationFn: async ({ roomId, message }) => {
      return await requestJoinRoom(roomId, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      return await acceptJoinRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      return await rejectJoinRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });

  const handleSearchPrivateRooms = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await searchPrivateRooms(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

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
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    let ws = null;

    const convertToWebSocketUrl = (url) => {
      return url
        .replace("/api/", "")
        .replace("http://", "ws://")
        .replace("https://", "wss://")
        .replace(/\/$/, "");
    };

    let baseUrl;
    if (import.meta.env.VITE_WS_URL) {
      baseUrl = import.meta.env.VITE_WS_URL.replace(/\/$/, "");
    } else if (import.meta.env.VITE_API_URL) {
      baseUrl = convertToWebSocketUrl(import.meta.env.VITE_API_URL);
    } else if (import.meta.env.PROD) {
      const railwayUrl = "https://vinverse-backend.up.railway.app";
      baseUrl = convertToWebSocketUrl(railwayUrl);
    } else {
      baseUrl = "ws://localhost:8000";
    }

    const token = localStorage.getItem("access_token");
    const wsPath = `/ws/chat/${selectedRoom}/`;
    const queryString = token ? `?token=${encodeURIComponent(token)}` : "";
    const wsUrl = `${baseUrl}${wsPath}${queryString}`;

    ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        setMessages((prev) => {
          const exists = prev.some(
            (msg) =>
              (msg.message_id && msg.message_id === data.message_id) ||
              (msg.timestamp === data.timestamp &&
                msg.message === data.message &&
                msg.user_id === data.user_id)
          );
          if (exists) return prev;
          return [...prev, data];
        });

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
        const users = new Map();
        (data.messages || []).forEach((msg) => {
          if (msg.user_id && msg.username) {
            users.set(msg.user_id, { id: msg.user_id, username: msg.username });
          }
        });
        setActiveUsers(users);
      } else if (data.type === "typing") {
        if (data.user_id !== user?.id) {
          setTypingUsers((prev) => new Set([...prev, data.username]));
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.username);
              return newSet;
            });
          }, 3000);
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setSocket(null);
      socketRef.current = null;
    };

    return () => {
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

  const checkIfNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  };

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (messages.length > 0) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 100);
      }
      return;
    }

    if (shouldAutoScrollRef.current || checkIfNearBottom()) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages]);

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

    shouldAutoScrollRef.current = true;

    currentSocket.send(
      JSON.stringify({
        type: "chat_message",
        message: message.trim(),
      })
    );

    setMessage("");
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    const currentSocket = socketRef.current || socket;
    if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      currentSocket.send(
        JSON.stringify({
          type: "typing",
        })
      );
      typingTimeoutRef.current = setTimeout(() => {
        // Stop typing indicator after 3 seconds
      }, 3000);
    }
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

    // Ensure room_type matches is_private
    let roomType = newRoomType;
    if (newRoomPrivate && roomType !== "private") {
      roomType = "private";
    } else if (!newRoomPrivate && roomType === "private") {
      roomType = "global";
    }

    const roomData = {
      name: newRoomName.toLowerCase().replace(/\s+/g, "-"),
      display_name: newRoomName,
      room_type: roomType,
      is_private: newRoomPrivate,
      description: newRoomPrivate ? "Private room" : "",
    };

    createRoomMutation.mutate(roomData, {
      onError: (error) => {
        console.error("Error creating room:", error);
        alert(
          `Failed to create room: ${
            error.response?.data?.error || error.message
          }`
        );
      },
    });
  };

  const emojis = ["😀", "😂", "❤️", "🔥", "👍", "🎮", "🏆", "💯", "🎯", "⚡"];
  const quickMessages = [
    "Hey! Anyone up for a game?",
    "Looking for teammates!",
    "GG everyone!",
    "Great match!",
    "Let's team up!",
  ];

  const insertQuickMessage = (quickMsg) => {
    setMessage(quickMsg);
    setShowEmojiPicker(false);
  };

  const publicRooms = rooms.filter((r) => !r.is_private);
  const privateRooms = rooms.filter((r) => r.is_private && r.is_member);
  const activeUsersArray = Array.from(activeUsers.values());
  const typingUsersArray = Array.from(typingUsers);

  return (
    <div className="min-h-screen pt-24 px-4 pb-4 sm:pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent mb-2">
            Global Chat
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            Connect with gamers, share strategies, and build your network
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-16rem)] sm:h-[calc(100vh-18rem)] lg:h-[700px] max-h-[700px] overflow-hidden">
          {/* Rooms Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-4 border border-neon-purple/30 flex flex-col h-full min-h-0"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Rooms</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                className="px-2 py-1 text-sm bg-neon-purple/20 text-neon-purple rounded hover:bg-neon-purple/30 transition-all"
              >
                +
              </motion.button>
            </div>

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
              {publicRooms.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2 uppercase">Public</p>
                  {publicRooms.map((room) => (
                    <motion.button
                      key={room.id}
                      whileHover={{ x: 4 }}
                      onClick={() => handleRoomChange(room.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                        selectedRoom === room.name
                          ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/30"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>🌐 {room.display_name || room.name}</span>
                        {room.message_count > 0 && (
                          <span className="text-xs bg-neon-purple/30 px-2 py-0.5 rounded-full">
                            {room.message_count}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {privateRooms.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400 uppercase">Private</p>
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowSearchModal(true)}
                        className="text-xs px-2 py-0.5 bg-neon-purple/20 text-neon-purple rounded hover:bg-neon-purple/30"
                        title="Search Private Rooms"
                      >
                        🔍
                      </motion.button>
                      {pendingRequests.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowRequestsModal(true)}
                          className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 relative"
                          title="Pending Requests"
                        >
                          📬
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white">
                            {pendingRequests.length}
                          </span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                  {privateRooms.map((room) => {
                    const isCreator = room.created_by === user?.id;
                    return (
                      <motion.div key={room.id} className="mb-2">
                        <div className="group relative">
                          <motion.button
                            whileHover={{ x: 4 }}
                            onClick={() => handleRoomChange(room.name)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                              selectedRoom === room.name
                                ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/30"
                                : "text-gray-300 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>🔒 {room.display_name || room.name}</span>
                              {room.member_count > 0 && (
                                <span className="text-xs bg-neon-purple/30 px-2 py-0.5 rounded-full">
                                  {room.member_count}
                                </span>
                              )}
                            </div>
                          </motion.button>
                          {room.room_code && (
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                              <div className="glass rounded-lg px-3 py-2 border border-neon-purple/30 shadow-xl whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">
                                    Code:
                                  </span>
                                  <span className="text-xs font-mono font-bold text-neon-purple">
                                    {room.room_code}
                                  </span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(
                                        room.room_code
                                      );
                                    }}
                                    className="text-xs text-gray-400 hover:text-neon-purple transition-colors"
                                    title="Copy code"
                                  >
                                    📋
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {isCreator && selectedRoom === room.name && (
                          <motion.button
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowInviteModal(true)}
                            className="w-full mt-1 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-all"
                          >
                            + Invite User
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Search Private Rooms Section */}
              {!privateRooms.some((r) => r.is_member) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSearchModal(true)}
                    className="w-full px-3 py-2 text-sm bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-all flex items-center justify-center gap-2"
                  >
                    🔍 Search Private Rooms
                  </motion.button>
                </div>
              )}

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
            <div className="flex items-center justify-between mb-4 flex-shrink-0 pb-3 border-b border-white/10">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="group relative">
                    <h3 className="text-lg font-semibold text-white cursor-pointer">
                      {rooms.find((r) => r.name === selectedRoom)
                        ?.display_name || "Global Lobby"}
                    </h3>
                    {rooms.find((r) => r.name === selectedRoom)?.room_code && (
                      <div className="absolute left-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                        <div className="glass rounded-lg px-3 py-2 border border-neon-purple/30 shadow-xl whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              Room Code:
                            </span>
                            <span className="text-xs font-mono font-bold text-neon-purple">
                              {
                                rooms.find((r) => r.name === selectedRoom)
                                  ?.room_code
                              }
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const code = rooms.find(
                                  (r) => r.name === selectedRoom
                                )?.room_code;
                                if (code) {
                                  navigator.clipboard.writeText(code);
                                }
                              }}
                              className="text-xs text-gray-400 hover:text-neon-purple transition-colors pointer-events-auto"
                              title="Copy room code"
                            >
                              📋
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConnected
                          ? "bg-green-400 animate-pulse shadow-lg shadow-green-400/50"
                          : "bg-red-400"
                      }`}
                    />
                    <span className="text-xs text-gray-400">
                      {isConnected ? "Live" : "Offline"}
                    </span>
                  </div>
                </div>
                {typingUsersArray.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-neon-purple mt-2 flex items-center gap-1"
                  >
                    <span className="animate-pulse">💬</span>
                    {typingUsersArray.join(", ")}{" "}
                    {typingUsersArray.length === 1 ? "is" : "are"} typing...
                  </motion.p>
                )}
                {activeUsersArray.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {activeUsersArray.length}{" "}
                    {activeUsersArray.length === 1 ? "user" : "users"} online
                  </p>
                )}
              </div>
            </div>

            {/* Messages - Fixed height with scroll */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto mb-4 px-2 custom-scrollbar min-h-0"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-6xl mb-4"
                    >
                      💬
                    </motion.div>
                    <p className="text-gray-400 text-lg mb-2 font-semibold">
                      {isConnected
                        ? "No messages yet. Start the conversation!"
                        : "Connecting..."}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Be the first to say hello! 👋
                    </p>
                  </motion.div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const showUsername =
                    !prevMsg || prevMsg.user_id !== msg.user_id;
                  const isCurrentUser = msg.user_id === user?.id;
                  const messageTime = msg.timestamp
                    ? new Date(msg.timestamp)
                    : null;
                  const timeString = messageTime
                    ? messageTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <motion.div
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`mb-2 ${
                        isCurrentUser
                          ? "flex justify-end"
                          : "flex justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] sm:max-w-[65%] ${
                          isCurrentUser ? "items-end" : "items-start"
                        } flex flex-col`}
                      >
                        {/* Username and Time */}
                        {showUsername && (
                          <div
                            className={`flex items-center gap-2 mb-1 px-1 ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span
                              className={`text-xs font-bold ${
                                isCurrentUser
                                  ? "text-purple-300"
                                  : "text-neon-purple"
                              }`}
                            >
                              {msg.username || "Anonymous"}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs text-green-400 font-semibold">
                                (You)
                              </span>
                            )}
                            {messageTime && (
                              <span className="text-xs text-gray-500">
                                {timeString}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`rounded-2xl px-4 py-2.5 transition-all shadow-lg ${
                            isCurrentUser
                              ? "bg-gradient-to-r from-neon-purple to-pink-500 text-white rounded-br-sm"
                              : "bg-black/40 text-white border border-white/10 rounded-bl-sm hover:border-neon-purple/30"
                          }`}
                        >
                          <p className="text-sm break-words leading-relaxed whitespace-pre-wrap">
                            {msg.message || msg.content}
                          </p>
                        </motion.div>

                        {/* Time for non-username messages */}
                        {!showUsername && messageTime && (
                          <span
                            className={`text-xs text-gray-500 mt-0.5 px-1 ${
                              isCurrentUser ? "text-right" : "text-left"
                            }`}
                          >
                            {timeString}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Messages */}
            {message.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex gap-2 overflow-x-auto pb-2 custom-scrollbar"
              >
                {quickMessages.map((quickMsg, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => insertQuickMessage(quickMsg)}
                    className="px-4 py-2 text-xs bg-gradient-to-r from-black/40 to-black/20 border border-neon-purple/30 rounded-full text-gray-300 hover:text-white hover:border-neon-purple/60 hover:bg-neon-purple/10 whitespace-nowrap transition-all shadow-md"
                  >
                    {quickMsg}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Message Input with Emoji Picker */}
            <form
              onSubmit={sendMessage}
              className="flex gap-2 flex-shrink-0 relative pt-2 border-t border-white/10"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder={`Message ${
                    rooms.find((r) => r.name === selectedRoom)?.display_name ||
                    "lobby"
                  }...`}
                  className="w-full px-4 py-3 pr-12 bg-black/60 border border-white/20 rounded-xl focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 text-white transition-all placeholder-gray-500"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.15, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl transition-transform hover:filter hover:brightness-110"
                >
                  😀
                </motion.button>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                disabled={!message.trim()}
                className="px-6 py-3 bg-gradient-to-r from-neon-purple to-pink-500 text-white rounded-xl hover:shadow-xl hover:shadow-neon-purple/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2"
              >
                <span>Send</span>
                <span className="text-lg">➤</span>
              </motion.button>
            </form>

            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-20 left-0 glass rounded-xl p-4 border border-neon-purple/30 grid grid-cols-5 gap-3 z-10 shadow-2xl"
                >
                  {emojis.map((emoji) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      whileHover={{ scale: 1.3, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setMessage((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl transition-transform p-2 rounded-lg hover:bg-neon-purple/20"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Active Users Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex glass rounded-xl p-4 border border-neon-purple/30 flex-col h-full min-h-0"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Active Users ({activeUsersArray.length})
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {activeUsersArray.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No active users yet
                </p>
              ) : (
                activeUsersArray.map((activeUser) => (
                  <motion.div
                    key={activeUser.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {activeUser.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse shadow-lg shadow-green-400/50"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {activeUser.username}
                      </p>
                      <p className="text-green-400 text-xs font-semibold">
                        Online
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Invite User Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-xl p-6 border border-neon-purple/30 max-w-md w-full z-10"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Invite User to Room
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const currentRoom = rooms.find(
                    (r) => r.name === selectedRoom
                  );
                  if (currentRoom && inviteUsername.trim()) {
                    inviteUserMutation.mutate({
                      roomId: currentRoom.id,
                      username: inviteUsername.trim(),
                      message: inviteMessage.trim(),
                    });
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-white resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={inviteUserMutation.isPending}
                    className="flex-1 px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  >
                    {inviteUserMutation.isPending
                      ? "Sending..."
                      : "Send Invite"}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteUsername("");
                      setInviteMessage("");
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search Private Rooms Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSearchModal(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-xl p-6 border border-neon-purple/30 max-w-md w-full z-10 max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Search Private Rooms
              </h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearchPrivateRooms();
                    }
                  }}
                  placeholder="Room name, ID, or code (e.g., 237601)"
                  className="flex-1 px-4 py-2 bg-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-purple text-white"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearchPrivateRooms}
                  className="px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-purple-600"
                >
                  Search
                </motion.button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {searchResults.length === 0 && searchQuery ? (
                  <p className="text-gray-400 text-center py-4">
                    No rooms found
                  </p>
                ) : (
                  searchResults.map((room) => (
                    <div
                      key={room.id}
                      className="p-3 bg-black/30 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">
                          {room.display_name || room.name}
                        </span>
                        {room.has_pending_request && (
                          <span className="text-xs bg-orange-500/30 text-orange-400 px-2 py-1 rounded">
                            Requested
                          </span>
                        )}
                      </div>
                      {room.room_code && (
                        <div className="group relative inline-block mb-2">
                          <span className="text-xs text-gray-400 cursor-pointer hover:text-neon-purple transition-colors">
                            Room Code: Hover to see
                          </span>
                          <div className="absolute left-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                            <div className="glass rounded-lg px-3 py-2 border border-neon-purple/30 shadow-xl whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-neon-purple">
                                  {room.room_code}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      room.room_code
                                    );
                                  }}
                                  className="text-xs text-gray-400 hover:text-neon-purple transition-colors pointer-events-auto"
                                  title="Copy code"
                                >
                                  📋
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {room.created_by_username && (
                        <p className="text-xs text-gray-400 mb-2">
                          Created by: {room.created_by_username}
                        </p>
                      )}
                      {!room.is_member && !room.has_pending_request && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            requestJoinMutation.mutate({
                              roomId: room.id,
                              message: "",
                            });
                          }}
                          disabled={requestJoinMutation.isPending}
                          className="w-full px-3 py-1.5 text-sm bg-neon-purple/20 text-neon-purple rounded hover:bg-neon-purple/30 disabled:opacity-50"
                        >
                          Request to Join
                        </motion.button>
                      )}
                    </div>
                  ))
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pending Requests Modal */}
      <AnimatePresence>
        {showRequestsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestsModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-xl p-6 border border-neon-purple/30 max-w-md w-full z-10 max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Pending Join Requests
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No pending requests
                  </p>
                ) : (
                  pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 bg-black/30 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">
                          {request.user_username}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            request.is_invite
                              ? "bg-green-500/30 text-green-400"
                              : "bg-blue-500/30 text-blue-400"
                          }`}
                        >
                          {request.is_invite ? "Invite" : "Request"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        Room: {request.room_name}
                      </p>
                      {request.message && (
                        <p className="text-sm text-gray-300 mb-3 italic">
                          "{request.message}"
                        </p>
                      )}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            acceptRequestMutation.mutate(request.id);
                          }}
                          disabled={
                            acceptRequestMutation.isPending ||
                            rejectRequestMutation.isPending
                          }
                          className="flex-1 px-3 py-1.5 text-sm bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50"
                        >
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            rejectRequestMutation.mutate(request.id);
                          }}
                          disabled={
                            acceptRequestMutation.isPending ||
                            rejectRequestMutation.isPending
                          }
                          className="flex-1 px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50"
                        >
                          Reject
                        </motion.button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRequestsModal(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
