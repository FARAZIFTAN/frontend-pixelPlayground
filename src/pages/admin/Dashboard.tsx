import { motion } from "framer-motion";
import { Image, Camera, Users, TrendingUp, Eye, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Templates",
      value: "12",
      change: "+2 this week",
      icon: Image,
      color: "bg-blue-500",
      trend: "up"
    },
    {
      title: "Photos Taken",
      value: "1,234",
      change: "+156 today",
      icon: Camera,
      color: "bg-green-500",
      trend: "up"
    },
    {
      title: "Active Users",
      value: "89",
      change: "+12 this hour",
      icon: Users,
      color: "bg-purple-500",
      trend: "up"
    },
    {
      title: "Downloads",
      value: "856",
      change: "+89 today",
      icon: Download,
      color: "bg-orange-500",
      trend: "up"
    },
  ];

  const recentTemplates = [
    { id: 1, name: "Morris IF'25", category: "Artistic", photos: 245, status: "Active" },
    { id: 2, name: "Graduation 2024", category: "Education", photos: 189, status: "Active" },
    { id: 3, name: "Wedding Gold", category: "Wedding", photos: 156, status: "Draft" },
  ];

  const recentActivity = [
    { action: "Template created", detail: "Morris IF'25 template added", time: "2 hours ago", type: "create" },
    { action: "Photos taken", detail: "50 photos using Graduation template", time: "3 hours ago", type: "photo" },
    { action: "Template updated", detail: "Coordinates adjusted for Morris", time: "5 hours ago", type: "update" },
    { action: "User registered", detail: "New admin user added", time: "1 day ago", type: "user" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-300 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-black/40 backdrop-blur-lg border border-white/10 hover:border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                      <h3 className="text-4xl font-bold text-white mt-2">{stat.value}</h3>
                      <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Templates */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Popular Templates</h2>
                <button className="text-sm text-[#FF6B6B] hover:text-[#C62828] hover:underline font-medium transition-colors">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#C62828] to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Image className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{template.name}</h3>
                        <p className="text-sm text-gray-400">{template.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{template.photos} photos</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        template.status === 'Active' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                      }`}>
                        {template.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <button className="text-sm text-[#FF6B6B] hover:text-[#C62828] hover:underline font-medium transition-colors">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                  >
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      activity.type === 'create' ? 'bg-blue-500' :
                      activity.type === 'photo' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm">{activity.action}</h3>
                      <p className="text-sm text-gray-400 mt-1">{activity.detail}</p>
                      <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
