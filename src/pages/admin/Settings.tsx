import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/services/api";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    templateAlerts: true,
    weeklyReports: false,
  });

  // Theme Settings
  const [themeSettings, setThemeSettings] = useState({
    theme: "dark",
    language: "en",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
    }
    // Load settings from backend
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await userAPI.getSettings() as {
        success: boolean;
        data?: {
          notifications: {
            emailNotifications: boolean;
            templateAlerts: boolean;
            weeklyReports: boolean;
          };
          theme: {
            theme: string;
            language: string;
          };
        };
      };

      if (response.success && response.data) {
        setNotificationSettings(response.data.notifications);
        setThemeSettings(response.data.theme);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await userAPI.updateProfile(profileData) as {
        success: boolean;
        message: string;
      };

      if (response.success) {
        toast.success("Profile updated successfully!");
        await checkAuth(); // Refresh user data
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      const response = await userAPI.updateSettings('notifications', notificationSettings) as {
        success: boolean;
        message: string;
      };

      if (response.success) {
        toast.success("Notification preferences saved!");
      } else {
        toast.error(response.message || "Failed to save notification preferences");
      }
    } catch (error) {
      console.error("Error saving notifications:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save notification preferences";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    setIsSaving(true);
    try {
      const response = await userAPI.updateSettings('theme', themeSettings) as {
        success: boolean;
        message: string;
      };

      if (response.success) {
        toast.success("Appearance settings saved!");
      } else {
        toast.error(response.message || "Failed to save appearance settings");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save appearance settings";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-300 mt-1">Manage your application settings and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-500/30">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                  <p className="text-sm text-gray-400">Update your personal information</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white placeholder-gray-500"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#C62828] hover:bg-[#E53935] text-white font-semibold"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 backdrop-blur-sm rounded-lg border border-purple-500/30">
                  <Bell className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Notifications</h2>
                  <p className="text-sm text-gray-400">Manage notification preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-medium text-white">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive email updates</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                    className="w-5 h-5 text-[#C62828] rounded focus:ring-[#C62828] bg-white/10 border-white/20" 
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-medium text-white">Template Alerts</p>
                    <p className="text-sm text-gray-400">Notify when template is used</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.templateAlerts}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, templateAlerts: e.target.checked })}
                    className="w-5 h-5 text-[#C62828] rounded focus:ring-[#C62828] bg-white/10 border-white/20" 
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-medium text-white">Weekly Reports</p>
                    <p className="text-sm text-gray-400">Receive weekly analytics</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.weeklyReports}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReports: e.target.checked })}
                    className="w-5 h-5 text-[#C62828] rounded focus:ring-[#C62828] bg-white/10 border-white/20" 
                  />
                </label>
                <Button 
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold mt-4"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#C62828]/20 backdrop-blur-sm rounded-lg border border-[#C62828]/30">
                  <Shield className="w-6 h-6 text-[#FF6B6B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Security</h2>
                  <p className="text-sm text-gray-400">Manage password and security</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start bg-[#C62828]/10 border-[#C62828]/30 text-[#FF6B6B] hover:bg-[#C62828]/20 hover:text-[#FF6B6B]">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-500/30">
                  <Palette className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Appearance</h2>
                  <p className="text-sm text-gray-400">Customize your interface</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <select 
                    value={themeSettings.theme}
                    onChange={(e) => setThemeSettings({ ...themeSettings, theme: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white"
                  >
                    <option className="bg-gray-900" value="light">Light</option>
                    <option className="bg-gray-900" value="dark">Dark</option>
                    <option className="bg-gray-900" value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select 
                    value={themeSettings.language}
                    onChange={(e) => setThemeSettings({ ...themeSettings, language: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white"
                  >
                    <option className="bg-gray-900" value="en">English</option>
                    <option className="bg-gray-900" value="id">Bahasa Indonesia</option>
                  </select>
                </div>
                <Button 
                  onClick={handleSaveTheme}
                  disabled={isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold mt-4"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
