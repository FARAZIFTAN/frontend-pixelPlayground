import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Calendar,
  Shield,
  User,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  LogOut,
  Award,
  Clock,
  Camera,
  RefreshCw,
  Image,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { userAPI } from "@/services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  isPremium: boolean;
  premiumExpiresAt?: string;
  photosCount?: number;
  downloadsCount?: number;
}

interface UserDetail {
  user: User;
  statistics: {
    totalSessions: number;
    totalComposites: number;
    totalEvents: number;
    totalViews: number;
    totalLikes: number;
  };
  recentSessions: Array<{
    _id: string;
    sessionName: string;
    status: string;
    startedAt: string;
    completedAt?: string;
  }>;
  recentComposites: Array<{
    _id: string;
    templateId: string;
    compositeUrl: string;
    thumbnailUrl: string;
    createdAt: string;
    likes: number;
    views: number;
  }>;
}

interface Activity {
  type: string;
  action: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [userActivities, setUserActivities] = useState<Activity[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview");
  const [premiumFilter, setPremiumFilter] = useState<"all" | "premium" | "free">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [previousPremiumCount, setPreviousPremiumCount] = useState<number>(0);

  useEffect(() => {
    loadUsers();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log('[AUTO-REFRESH] Refreshing user data...');
      loadUsers();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      console.log('[LOAD USERS] Fetching users from backend...');
      const response = await userAPI.getAllUsers() as {
        success: boolean;
        data: { users: User[] };
      };
      
      console.log('[LOAD USERS] Response received:', {
        success: response.success,
        userCount: response.data?.users?.length || 0,
        premiumCount: response.data?.users?.filter(u => u.isPremium).length || 0
      });
      
      if (response.success && response.data) {
        // Filter out invalid users (missing name or email)
        const validUsers = response.data.users.filter(u => u && u.name && u.email);
        const newPremiumCount = validUsers.filter(u => u.isPremium).length;
        
        console.log('[LOAD USERS] Setting users state:', {
          total: validUsers.length,
          premium: newPremiumCount,
          free: validUsers.filter(u => !u.isPremium).length,
          previousPremium: previousPremiumCount
        });
        
        // Notify if premium count changed
        if (previousPremiumCount > 0 && newPremiumCount !== previousPremiumCount) {
          const diff = newPremiumCount - previousPremiumCount;
          if (diff > 0) {
            toast.success(`🎉 ${diff} new Premium user${diff > 1 ? 's' : ''}!`, {
              duration: 5000,
            });
          } else if (diff < 0) {
            toast.info(`${Math.abs(diff)} user${Math.abs(diff) > 1 ? 's' : ''} downgraded from Premium`);
          }
        }
        
        setUsers(validUsers);
        setPreviousPremiumCount(newPremiumCount);
        setLastRefresh(new Date());
        
        if (validUsers.length < response.data.users.length) {
          console.warn(`Filtered out ${response.data.users.length - validUsers.length} invalid users`);
        }
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const response = await userAPI.deleteUser(userToDelete._id) as {
        success: boolean;
      };
      if (response.success) {
        toast.success("User deleted successfully");
        setUsers(users.filter((u) => u._id !== userToDelete._id));
        setShowDeleteDialog(false);
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleRole = async (user: User) => {
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      const response = await userAPI.updateUserRole(user._id, newRole) as {
        success: boolean;
      };
      if (response.success) {
        setUsers(
          users.map((u) =>
            u._id === user._id ? { ...u, role: newRole } : u
          )
        );
        toast.success(
          `User ${newRole === "admin" ? "promoted to admin" : "demoted to user"}`
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleToggleBlock = async (user: User) => {
    try {
      const newStatus = !user.isActive;
      const response = await userAPI.blockUser(user._id, newStatus) as {
        success: boolean;
      };
      if (response.success) {
        setUsers(
          users.map((u) =>
            u._id === user._id ? { ...u, isActive: newStatus } : u
          )
        );
        toast.success(
          `User ${newStatus ? "unblocked" : "blocked"} successfully`
        );
      }
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleTogglePremium = async (user: User) => {
    try {
      const newPremiumStatus = !user.isPremium;
      const expiresInDays = 30; // Default 30 days
      
      console.log('Toggle premium for user:', user._id, 'New status:', newPremiumStatus);
      
      const response = await userAPI.togglePremium(user._id, newPremiumStatus, expiresInDays) as {
        success: boolean;
        data?: { user: User };
      };
      
      console.log('Toggle premium response:', response);
      
      if (response.success && response.data && response.data.user) {
        const updatedUser = response.data.user;
        
        // Validate updated user has required fields
        if (!updatedUser.name || !updatedUser.email) {
          console.error('Updated user missing required fields:', updatedUser);
          toast.error("Invalid user data received");
          return;
        }
        
        // Update local state with new user data from server
        setUsers(
          users.map((u) =>
            u._id === user._id ? updatedUser : u
          )
        );
        
        // Update selectedUser if detail dialog is open
        if (selectedUser?._id === user._id) {
          setSelectedUser(updatedUser);
        }
        
        toast.success(
          newPremiumStatus 
            ? `User upgraded to Premium (30 days)` 
            : `User downgraded to Free`
        );
      } else {
        toast.error(response.message || "Failed to update premium status");
      }
    } catch (error) {
      console.error("Error updating premium status:", error);
      toast.error("Failed to update premium status");
    }
  };

  const handleViewUserDetail = async (user: User) => {
    setSelectedUser(user);
    setShowUserDetailDialog(true);
    setIsLoadingDetail(true);
    setActiveTab("overview");
    
    try {
      // Refresh user data first to get latest info
      const userResponse = await userAPI.getUser(user._id) as {
        success: boolean;
        data?: User;
      };
      
      if (userResponse.success && userResponse.data) {
        // Update local state with fresh user data
        setSelectedUser(userResponse.data);
        setUsers(users.map(u => u._id === user._id ? userResponse.data! : u));
      }
      
      // Load user detail with statistics
      const detailResponse = await userAPI.getUserDetail(user._id) as {
        success: boolean;
        data: UserDetail;
      };
      
      if (detailResponse.success) {
        setUserDetail(detailResponse.data);
        // Update selectedUser with latest data from detail response
        if (detailResponse.data.user) {
          setSelectedUser(detailResponse.data.user as User);
        }
      }

      // Load user activities
      const activitiesResponse = await userAPI.getUserActivities(user._id, { limit: 20 }) as {
        success: boolean;
        data: { activities: Activity[] };
      };
      
      if (activitiesResponse.success) {
        setUserActivities(activitiesResponse.data.activities);
      }
    } catch (error) {
      console.error("Error loading user detail:", error);
      toast.error("Failed to load user details");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Safety check for undefined fields
    if (!user || !user.name || !user.email) return false;
    
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesPremium = 
      premiumFilter === "all" || 
      (premiumFilter === "premium" && user.isPremium) ||
      (premiumFilter === "free" && !user.isPremium);
    return matchesSearch && matchesRole && matchesPremium;
  });

  const userStats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    active: users.filter((u) => u.isActive).length,
    premium: users.filter((u) => u.isPremium).length,
    free: users.filter((u) => !u.isPremium).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-400" />
            User Management
          </h1>
          <div className="text-gray-300 mt-1 flex items-center gap-3">
            <span>Manage and monitor all users in the application</span>
            {autoRefresh && (
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/50 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
                Auto-refresh ON
              </span>
            )}
            <span className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant="outline"
            size="sm"
            className={`${
              autoRefresh 
                ? 'border-green-500/50 text-green-400 hover:bg-green-500/20' 
                : 'border-gray-500/50 text-gray-400 hover:bg-gray-500/20'
            }`}
          >
            {autoRefresh ? '⏸' : '▶'} Auto-refresh
          </Button>
          <Button
            onClick={() => loadUsers()}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total Users",
            value: userStats.total,
            icon: Users,
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "Administrators",
            value: userStats.admins,
            icon: Shield,
            color: "from-purple-500 to-purple-600",
          },
          {
            label: "Active Users",
            value: userStats.active,
            icon: Award,
            color: "from-green-500 to-green-600",
          },
          {
            label: "Premium Users",
            value: userStats.premium,
            icon: Award,
            color: "from-yellow-500 to-orange-600",
            highlight: true,
          },
          {
            label: "Free Users",
            value: userStats.free,
            icon: User,
            color: "from-gray-500 to-gray-600",
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="shadow-xl hover:shadow-2xl transition-all bg-black/40 backdrop-blur-lg border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-white mt-2">
                        {stat.value}
                      </h3>
                    </div>
                    <div
                      className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <Card className="shadow-xl bg-black/40 backdrop-blur-lg border border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as "all" | "user" | "admin")
                }
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={premiumFilter}
                onChange={(e) =>
                  setPremiumFilter(e.target.value as "all" | "premium" | "free")
                }
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">All Subscriptions</option>
                <option value="premium">Premium Only</option>
                <option value="free">Free Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-xl bg-black/40 backdrop-blur-lg border border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users List ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-gray-400 mt-4">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-4 text-left font-semibold text-gray-300">
                        User
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-300">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-300">
                        Premium
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-300">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-300">
                        Last Login
                      </th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredUsers.map((user, idx) => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                            user.isPremium ? 'bg-yellow-500/5' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                user.isPremium 
                                  ? 'bg-gradient-to-br from-yellow-400 to-orange-600 ring-2 ring-yellow-500/50' 
                                  : 'bg-gradient-to-br from-blue-400 to-purple-600'
                              }`}>
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white flex items-center gap-2">
                                  {user.name}
                                  {user.isPremium && (
                                    <Award className="w-4 h-4 text-yellow-400" />
                                  )}
                                </p>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={`${
                                user.role === "admin"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                              }`}
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              {user.role === "admin" ? "Admin" : "User"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={`${
                                user.isActive
                                  ? "bg-green-500/20 text-green-300 border border-green-500/50"
                                  : "bg-red-500/20 text-red-300 border border-red-500/50"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={`${
                                user.isPremium
                                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                                  : "bg-gray-500/20 text-gray-300 border border-gray-500/50"
                              }`}
                            >
                              <Award className="w-3 h-3 mr-1" />
                              {user.isPremium ? "Premium" : "Free"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-400 text-xs flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(user.createdAt).toLocaleDateString(
                                "id-ID"
                              )}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-400 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleDateString(
                                    "id-ID"
                                  )
                                : "Never"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                onClick={() => handleViewUserDetail(user)}
                                size="sm"
                                variant="outline"
                                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleToggleBlock(user)}
                                size="sm"
                                variant="outline"
                                className={`${
                                  user.isActive
                                    ? "border-red-500/50 text-red-400 hover:bg-red-500/20"
                                    : "border-green-500/50 text-green-400 hover:bg-green-500/20"
                                }`}
                                title={user.isActive ? "Block User" : "Unblock User"}
                              >
                                {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                onClick={() => handleTogglePremium(user)}
                                size="sm"
                                variant="outline"
                                className={`${
                                  user.isPremium
                                    ? "border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
                                    : "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                                }`}
                                title={user.isPremium ? "Downgrade to Free" : "Upgrade to Premium"}
                              >
                                <Award className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleToggleRole(user)}
                                size="sm"
                                variant="outline"
                                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                                title={
                                  user.role === "admin"
                                    ? "Demote to user"
                                    : "Promote to admin"
                                }
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteDialog(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Detail Dialog - Enhanced */}
      <Dialog open={showUserDetailDialog} onOpenChange={setShowUserDetailDialog}>
        <DialogContent className="bg-black/95 border border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <User className="w-6 h-6 text-blue-400" />
              User Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete user information, statistics, and activity history
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetail ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
              <p className="text-gray-400">Loading user details...</p>
            </div>
          ) : selectedUser && userDetail ? (
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-2xl font-bold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedUser.name}</h3>
                    <p className="text-gray-300 flex items-center gap-2 mb-3">
                      <Mail className="w-4 h-4" />
                      {selectedUser.email}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={selectedUser.role === "admin" ? "bg-purple-500/20 text-purple-300 border-purple-500/50" : "bg-blue-500/20 text-blue-300 border-blue-500/50"}>
                        <Shield className="w-3 h-3 mr-1" />
                        {selectedUser.role}
                      </Badge>
                      <Badge className={selectedUser.isActive ? "bg-green-500/20 text-green-300 border-green-500/50" : "bg-red-500/20 text-red-300 border-red-500/50"}>
                        {selectedUser.isActive ? "Active" : "Blocked"}
                      </Badge>
                      <Badge className={selectedUser.isPremium ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50" : "bg-gray-500/20 text-gray-300 border-gray-500/50"}>
                        <Award className="w-3 h-3 mr-1" />
                        {selectedUser.isPremium ? "Premium" : "Free"}
                      </Badge>
                      <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50">
                        <Calendar className="w-3 h-3 mr-1" />
                        Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </Badge>
                      {selectedUser.isPremium && selectedUser.premiumExpiresAt && (
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                          <Clock className="w-3 h-3 mr-1" />
                          Expires {new Date(selectedUser.premiumExpiresAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Sessions", value: userDetail.statistics.totalSessions, icon: Camera, color: "blue" },
                  { label: "Composites", value: userDetail.statistics.totalComposites, icon: Image, color: "green" },
                  { label: "Total Views", value: userDetail.statistics.totalViews, icon: Eye, color: "purple" },
                  { label: "Total Likes", value: userDetail.statistics.totalLikes, icon: Award, color: "orange" },
                  { label: "Events", value: userDetail.statistics.totalEvents, icon: Activity, color: "pink" },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-2`}>
                        <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Premium Status Section - Enhanced */}
              <div className={`border rounded-lg p-6 ${
                selectedUser.isPremium 
                  ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30" 
                  : "bg-white/5 border-white/10"
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedUser.isPremium 
                        ? "bg-yellow-500/20" 
                        : "bg-gray-500/20"
                    }`}>
                      <Award className={`w-6 h-6 ${
                        selectedUser.isPremium 
                          ? "text-yellow-400" 
                          : "text-gray-400"
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        Premium Membership
                        {selectedUser.isPremium && (
                          <span className="text-xs px-2 py-1 bg-yellow-500/30 text-yellow-300 rounded-full border border-yellow-500/50 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {selectedUser.isPremium 
                          ? "User has active premium subscription" 
                          : "Free account - No active subscription"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleTogglePremium(selectedUser)}
                    size="sm"
                    variant="outline"
                    className={`${
                      selectedUser.isPremium
                        ? "border-red-500/50 text-red-400 hover:bg-red-500/20"
                        : "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                    }`}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    {selectedUser.isPremium ? "Remove Premium" : "Grant Premium"}
                  </Button>
                </div>
                
                {selectedUser.isPremium && selectedUser.premiumExpiresAt && (
                  <div className="bg-black/20 rounded-lg p-4 space-y-3">
                    <h5 className="text-sm font-semibold text-yellow-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Subscription Details
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Expiry Date */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Expiration Date</p>
                        <p className="text-sm font-semibold text-white">
                          {new Date(selectedUser.premiumExpiresAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(selectedUser.premiumExpiresAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      
                      {/* Days Remaining */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Time Remaining</p>
                        <p className={`text-2xl font-bold ${
                          Math.ceil((new Date(selectedUser.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) < 7
                            ? "text-red-400"
                            : Math.ceil((new Date(selectedUser.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) < 15
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}>
                          {Math.max(0, Math.ceil((new Date(selectedUser.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                          <span className="text-sm font-normal text-gray-400 ml-1">days</span>
                        </p>
                        {Math.ceil((new Date(selectedUser.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) < 7 && (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
                            Expiring soon
                          </p>
                        )}
                      </div>
                      
                      {/* Start Date */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Member Since</p>
                        <p className="text-sm font-semibold text-white">
                          {new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      
                      {/* Duration */}
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Subscription Period</p>
                        <p className="text-sm font-semibold text-white">
                          30 Days
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Standard Premium</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Subscription Progress</span>
                        <span>
                          {Math.round(
                            ((30 - Math.max(0, Math.ceil((new Date(selectedUser.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))) / 30) * 100
                          )}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.round(
                              ((30 - Math.max(0, Math.ceil((new Date(selectedUser.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))) / 30) * 100
                            )}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!selectedUser.isPremium && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-300 mb-1">Free Account</p>
                        <p className="text-xs text-gray-400">
                          This user is on a free plan. Premium features are restricted. Admin can grant temporary premium access using the button above.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedUser.isPremium && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-green-300 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                      Premium benefits: Unlimited AI frames, priority support, no watermarks, premium templates access
                    </p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-white/10">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === "overview"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === "activity"
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Activity Log
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" ? (
                <div className="space-y-4">
                  {/* Recent Sessions */}
                  {userDetail.recentSessions.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-400" />
                        Recent Sessions
                      </h4>
                      <div className="space-y-2">
                        {userDetail.recentSessions.map((session) => (
                          <div key={session._id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">{session.sessionName}</p>
                              <p className="text-xs text-gray-400">{new Date(session.startedAt).toLocaleString()}</p>
                            </div>
                            <Badge className={session.status === "completed" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}>
                              {session.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Composites */}
                  {userDetail.recentComposites.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Image className="w-5 h-5 text-green-400" />
                        Recent Composites
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {userDetail.recentComposites.map((composite) => (
                          <div key={composite._id} className="bg-white/5 border border-white/10 rounded-lg p-2">
                            <img 
                              src={composite.thumbnailUrl || composite.compositeUrl} 
                              alt="Composite" 
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {composite.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {composite.likes}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userActivities.length > 0 ? (
                    userActivities.map((activity, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === "event" ? "bg-blue-500/20" :
                          activity.type === "session" ? "bg-purple-500/20" :
                          "bg-green-500/20"
                        }`}>
                          {activity.type === "event" ? <Activity className="w-4 h-4 text-blue-400" /> :
                           activity.type === "session" ? <Camera className="w-4 h-4 text-purple-400" /> :
                           <Image className="w-4 h-4 text-green-400" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.description}</p>
                          <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8">No activities found</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <Button
                  onClick={() => handleToggleBlock(selectedUser)}
                  variant="outline"
                  className={`${
                    selectedUser.isActive
                      ? "border-red-500/50 text-red-400 hover:bg-red-500/20"
                      : "border-green-500/50 text-green-400 hover:bg-green-500/20"
                  }`}
                >
                  {selectedUser.isActive ? <><EyeOff className="w-4 h-4 mr-2" /> Block User</> : <><Eye className="w-4 h-4 mr-2" /> Unblock User</>}
                </Button>
                <Button
                  onClick={() => handleToggleRole(selectedUser)}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {selectedUser.role === "admin" ? "Demote to User" : "Promote to Admin"}
                </Button>
                <Button
                  onClick={() => {
                    setUserToDelete(selectedUser);
                    setShowUserDetailDialog(false);
                    setShowDeleteDialog(true);
                  }}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-black/90 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete User</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-sm">
                <span className="font-semibold text-white">
                  {userToDelete.name}
                </span>{" "}
                ({userToDelete.email})
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
