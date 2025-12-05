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
  photosCount?: number;
  downloadsCount?: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.getAllUsers() as {
        success: boolean;
        data: { users: User[] };
      };
      if (response.success && response.data) {
        setUsers(response.data.users);
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    active: users.filter((u) => u.isActive).length,
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
          <p className="text-gray-300 mt-1">
            Manage and monitor all users in the application
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {user.name}
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
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserDetailDialog(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                              >
                                <Eye className="w-4 h-4" />
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

      {/* User Detail Dialog */}
      <Dialog open={showUserDetailDialog} onOpenChange={setShowUserDetailDialog}>
        <DialogContent className="bg-black/90 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="font-medium">{selectedUser.name}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-gray-400">Role:</span>
                  <Badge
                    className={
                      selectedUser.role === "admin"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                    }
                  >
                    {selectedUser.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-gray-400">Status:</span>
                  <Badge
                    className={
                      selectedUser.isActive
                        ? "bg-green-500/20 text-green-300 border border-green-500/50"
                        : "bg-red-500/20 text-red-300 border border-red-500/50"
                    }
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-gray-400">Member Since:</span>
                  <span className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      "id-ID"
                    )}
                  </span>
                </div>
                {selectedUser.lastLogin && (
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-gray-400">Last Login:</span>
                    <span className="font-medium">
                      {new Date(selectedUser.lastLogin).toLocaleDateString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
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
