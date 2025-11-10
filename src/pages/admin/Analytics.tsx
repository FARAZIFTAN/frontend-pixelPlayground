import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Image, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Analytics = () => {
  const stats = [
    { label: "Total Sessions", value: "1,234", change: "+12.5%", trend: "up" },
    { label: "Unique Users", value: "856", change: "+8.3%", trend: "up" },
    { label: "Photos Taken", value: "4,567", change: "+15.2%", trend: "up" },
    { label: "Downloads", value: "3,890", change: "+10.1%", trend: "up" },
  ];

  const topTemplates = [
    { name: "Morris IF'25", uses: 245, percentage: 78 },
    { name: "Graduation 2024", uses: 189, percentage: 60 },
    { name: "Wedding Gold", uses: 156, percentage: 50 },
    { name: "Birthday Party", uses: 123, percentage: 39 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-300 mt-1">Track your performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-white backdrop-blur-sm">
            <option className="bg-gray-900">Last 7 days</option>
            <option className="bg-gray-900">Last 30 days</option>
            <option className="bg-gray-900">Last 90 days</option>
            <option className="bg-gray-900">This year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-black/40 backdrop-blur-lg border border-white/10">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <h3 className="text-4xl font-bold text-white mt-2">{stat.value}</h3>
                <p className={`text-sm mt-2 flex items-center gap-1 ${
                  stat.trend === "up" ? "text-green-400" : "text-red-400"
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Usage Over Time</h2>
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <div className="h-64 bg-gradient-to-br from-[#C62828]/20 to-purple-900/20 rounded-lg flex items-center justify-center border border-white/10">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-300 font-medium">Chart Coming Soon</p>
                  <p className="text-sm text-gray-500">Integration with Recharts pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Templates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Top Templates</h2>
                <Image className="w-6 h-6 text-gray-400" />
              </div>
              <div className="space-y-4">
                {topTemplates.map((template, index) => (
                  <div key={template.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-semibold text-white">{template.name}</p>
                          <p className="text-sm text-gray-400">{template.uses} uses</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[#FF6B6B]">{template.percentage}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#C62828] to-purple-600 h-2 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${template.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Heatmap Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Activity Heatmap</h2>
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <div className="h-48 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 rounded-lg flex items-center justify-center border border-white/10">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-300 font-medium">Heatmap Coming Soon</p>
                <p className="text-sm text-gray-500">Track usage patterns by day and time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Analytics;
