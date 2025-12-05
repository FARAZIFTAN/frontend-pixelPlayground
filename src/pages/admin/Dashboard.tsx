import { motion } from "framer-motion";
import { Image, Camera, Users, TrendingUp, Eye, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { dashboardAPI } from "@/services/api";
import toast from "react-hot-toast";

interface Stat {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: string;
}

interface Template {
  id: number;
  name: string;
  category: string;
  photos: number;
  status: string;
}

interface Activity {
  action: string;
  detail: string;
  time: string;
  type: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [statsRes, templatesRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentTemplates(),
        dashboardAPI.getRecentActivity(),
      ]);

      // Build stats array from response
      if ((statsRes as Record<string, unknown>).success && (statsRes as Record<string, unknown>).data) {
        const statsData = ((statsRes as Record<string, unknown>).data as Record<string, number>);
        const builtStats: Stat[] = [
          {
            title: "Total Templates",
            value: statsData.totalTemplates,
            change: `+${statsData.weekTemplates} this week`,
            icon: Image,
            color: "bg-blue-500",
            trend: "up"
          },
          {
            title: "Photos Taken",
            value: statsData.totalPhotos.toLocaleString(),
            change: `+${statsData.todayPhotos} today`,
            icon: Camera,
            color: "bg-green-500",
            trend: "up"
          },
          {
            title: "Active Users",
            value: statsData.activeUsers,
            change: "+updates in real-time",
            icon: Users,
            color: "bg-purple-500",
            trend: "up"
          },
          {
            title: "Total Downloads",
            value: statsData.totalDownloads.toLocaleString(),
            change: "+views tracked",
            icon: Download,
            color: "bg-orange-500",
            trend: "up"
          },
        ];
        setStats(builtStats);
      }

      if ((templatesRes as Record<string, unknown>).success && Array.isArray((templatesRes as Record<string, unknown>).data)) {
        setRecentTemplates((templatesRes as Record<string, unknown>).data as Template[]);
      }

      if ((activityRes as Record<string, unknown>).success && Array.isArray((activityRes as Record<string, unknown>).data)) {
        setRecentActivity((activityRes as Record<string, unknown>).data as Activity[]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-300 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading dashboard data...</div>
        </div>
      )}

      {/* Stats Grid */}
      {!isLoading && stats.length > 0 && (
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
                <Card className="shadow-xl hover:shadow-2xl transition-all bg-black/40 backdrop-blur-lg border border-white/10 hover:border-white/20">
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
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Templates */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
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
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
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
      )}
    </div>
  );
};

export default Dashboard;
