import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Settings = () => {
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
          <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@karyaklik.com"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white placeholder-gray-500"
                  />
                </div>
                <Button className="w-full bg-[#C62828] hover:bg-[#E53935] text-white font-semibold">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
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
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#C62828] rounded focus:ring-[#C62828] bg-white/10 border-white/20" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-medium text-white">Template Alerts</p>
                    <p className="text-sm text-gray-400">Notify when template is used</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#C62828] rounded focus:ring-[#C62828] bg-white/10 border-white/20" />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-medium text-white">Weekly Reports</p>
                    <p className="text-sm text-gray-400">Receive weekly analytics</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-[#C62828] rounded focus:ring-[#C62828] bg-white/10 border-white/20" />
                </label>
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
          <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
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
          <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
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
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white">
                    <option className="bg-gray-900">Light</option>
                    <option className="bg-gray-900">Dark</option>
                    <option className="bg-gray-900">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white">
                    <option className="bg-gray-900">English</option>
                    <option className="bg-gray-900">Bahasa Indonesia</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
