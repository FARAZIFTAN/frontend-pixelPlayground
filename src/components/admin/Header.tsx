import { Bell, Search, User, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="bg-black/30 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg">
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
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C62828] rounded-full shadow-lg shadow-[#C62828]/50"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20 z-50">
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold text-white">Notifications</h3>
                </div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {/* Sample notifications */}
                  <div className="flex gap-3 p-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">New template created</p>
                      <p className="text-xs text-gray-400 mt-1">Morris template was added</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">Photo session completed</p>
                      <p className="text-xs text-gray-400 mt-1">100 photos taken today</p>
                      <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-white/10 text-center">
                  <button className="text-sm text-[#FF6B6B] hover:text-[#C62828] hover:underline font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-[#C62828] rounded-full flex items-center justify-center shadow-lg shadow-[#C62828]/50">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user?.name || "Admin User"}</p>
                <p className="text-xs text-gray-400">{user?.email || "admin@karyaklik.com"}</p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20 z-50">
                <div className="p-2 space-y-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                    Account Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
                    Help & Support
                  </button>
                  <hr className="my-2 border-white/10" />
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-[#FF6B6B] hover:bg-[#C62828]/20 hover:text-[#C62828] rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
