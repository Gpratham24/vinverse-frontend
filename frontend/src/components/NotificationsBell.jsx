/**
 * Notifications Bell - Shows notification count and dropdown.
 */
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BiBell } from "bootstrap-icons/react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notifications";

const NotificationsBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch notifications with polling for live updates
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 3000, // Poll every 3 seconds for new notifications
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unread_count || 0;

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 hover:text-neon-purple hover:bg-white/5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-neon-purple/50"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <BiBell className="text-xl sm:text-2xl" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-black/20"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 md:w-96 glass rounded-xl border border-neon-purple/30 shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-neon-purple hover:text-neon-purple-dark"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-4 text-center text-white/60">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-white/60">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                      !notification.is_read ? "bg-neon-purple/10" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">
                          {notification.title}
                        </p>
                        <p className="text-white/70 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-neon-purple rounded-full mt-1"></span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsBell;
