import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Image, 
  BarChart3,
  Settings,
  LogOut,
  Camera,
  ChevronDown,
  MessageSquare,
  CheckCircle,
  CreditCard
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTemplatesSubmenu, setShowTemplatesSubmenu] = useState(false);
  const [showAnalyticsSubmenu, setShowAnalyticsSubmenu] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const menuItems = [
    { 
      path: "/admin/dashboard", 
      icon: LayoutDashboard, 
      label: "Dashboard" 
    },
    { 
      path: "/admin/templates", 
      icon: Image, 
      label: "Templates",
      submenu: [
        { path: "/admin/template-creator", label: "Download Template" },
        { path: "/admin/frame-approvals", icon: CheckCircle, label: "Frame Approvals" }
      ]
    },
    { 
      path: "/admin/payments", 
      icon: CreditCard, 
      label: "Payments" 
    },
    { 
      path: "/admin/analytics", 
      icon: BarChart3, 
      label: "Analytics",
      submenu: [
        { path: "/admin/users", label: "Users" }
      ]
    },
    { 
      path: "/admin/feedback", 
      icon: MessageSquare, 
      label: "Feedback" 
    },
    { 
      path: "/admin/settings", 
      icon: Settings, 
      label: "Settings" 
    },
  ];

  return (
    <aside 
      className={`bg-black/60 backdrop-blur-md text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      } flex flex-col border-r border-[#C62828]/50`}
    >
      {/* Logo Area */}
      <div className="p-6 border-b border-[#C62828]/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-[#C62828]" />
              <div>
                <h1 className="text-xl font-bold">KaryaKlik</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-[#C62828]/30 rounded-lg transition-colors"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isTemplates = item.label === "Templates";
          const isAnalytics = item.label === "Analytics";
          const showSubmenu = isTemplates ? showTemplatesSubmenu : isAnalytics ? showAnalyticsSubmenu : false;

          return (
            <div key={item.path}>
              {hasSubmenu ? (
                <div>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
                        isActive
                          ? "bg-[#C62828] text-white shadow-lg shadow-[#C62828]/50"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`
                    }
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium flex-1">{item.label}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (isTemplates) setShowTemplatesSubmenu(!showTemplatesSubmenu);
                            if (isAnalytics) setShowAnalyticsSubmenu(!showAnalyticsSubmenu);
                          }}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${showSubmenu ? "rotate-180" : ""}`} />
                        </button>
                      </>
                    )}
                  </NavLink>
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#C62828] text-white shadow-lg shadow-[#C62828]/50"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                  title={isCollapsed ? item.label : ""}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </NavLink>
              )}

              {/* Submenu Items */}
              {hasSubmenu && showSubmenu && !isCollapsed && (
                <div className="ml-4 space-y-1 mt-1">
                  {item.submenu.map((subitem) => {
                    const SubIcon = subitem.icon;
                    return (
                      <NavLink
                        key={subitem.path}
                        to={subitem.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive
                              ? "bg-[#C62828] text-white shadow-lg shadow-[#C62828]/50"
                              : "text-gray-300 hover:bg-white/10 hover:text-white"
                          }`
                        }
                      >
                        {SubIcon ? (
                          <SubIcon className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <div className="w-2 h-2 bg-current rounded-full"></div>
                        )}
                        <span className="font-medium">{subitem.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#C62828]/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#C62828]/80 hover:text-white transition-all duration-200 w-full"
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
