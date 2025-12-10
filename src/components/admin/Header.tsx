import { Bell, Search, User, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'template' | 'user' | 'system' | 'analytics';
  isRead: boolean;
  createdAt: string;
}

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const { logout, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await fetch(
        `http://localhost:3001/api/notifications?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data.notifications);
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/notifications/mark-read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notificationId }),
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/notifications/mark-read`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ markAllAsRead: true }),
        }
      );

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'template': return 'bg-blue-500';
      case 'user': return 'bg-green-500';
      case 'system': return 'bg-yellow-500';
      case 'analytics': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="bg-black/30 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg relative z-40">
      <div className="flex items-center justify-between">
        {/* Left Section - Search */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates, users..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-gray-300" />
          </button>

          {/* Notifications */}
          <div className="relative z-50">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-[#C62828] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[#C62828]/50">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20 z-50">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-[#FF6B6B] hover:text-[#C62828] font-medium transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {isLoadingNotifications ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          notification.isRead
                            ? 'hover:bg-white/5'
                            : 'bg-white/10 hover:bg-white/15'
                        }`}
                        onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                      >
                        <div className={`flex-shrink-0 w-2 h-2 ${getNotificationColor(notification.type)} rounded-full mt-2`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                        </div>
                        {!notification.isRead && (
                          <div className="flex-shrink-0 w-2 h-2 bg-[#C62828] rounded-full mt-2"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-white/10 text-center">
                  <button className="text-sm text-[#FF6B6B] hover:text-[#C62828] hover:underline font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Info Display (No Dropdown) */}
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-[#C62828] rounded-full flex items-center justify-center shadow-lg shadow-[#C62828]/50">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">{user?.name || "Admin User"}</p>
              <p className="text-xs text-gray-400">{user?.email || "admin@karyaklik.com"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
