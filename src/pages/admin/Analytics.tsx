import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Image, Calendar, Activity, Monitor, Smartphone, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface AnalyticsData {
  overview: {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
  };
  eventsByCategory: Array<{ _id: string; count: number }>;
  eventsByType: Array<{ _id: string; count: number }>;
  eventsOverTime: Array<{ date: string; count: number }>;
  topTemplates: Array<{ _id: string; count: number }>;
  deviceBreakdown: Array<{ _id: string; count: number }>;
  recentEvents: Array<any>;
}

const COLORS = ['#C62828', '#E53935', '#FF6B6B', '#FF8A80', '#FFAB91'];

const Analytics = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`${API_BASE_URL}/analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch analytics');
      }

      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C62828] animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#E53935] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "Total Events", 
      value: analyticsData?.overview.totalEvents.toLocaleString() || "0", 
      icon: Activity,
      color: "from-blue-500 to-blue-600"
    },
    { 
      label: "Unique Users", 
      value: analyticsData?.overview.uniqueUsers.toLocaleString() || "0", 
      icon: Users,
      color: "from-green-500 to-green-600"
    },
    { 
      label: "Sessions", 
      value: analyticsData?.overview.uniqueSessions.toLocaleString() || "0", 
      icon: Calendar,
      color: "from-purple-500 to-purple-600"
    },
    { 
      label: "Avg Events/Session", 
      value: analyticsData?.overview.uniqueSessions 
        ? Math.round(analyticsData.overview.totalEvents / analyticsData.overview.uniqueSessions).toString()
        : "0",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600"
    },
  ];

  // Format data for charts
  const timelineData = analyticsData?.eventsOverTime.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    events: item.count,
  })) || [];

  const categoryData = analyticsData?.eventsByCategory.map(item => ({
    name: item._id,
    value: item.count,
  })) || [];

  const deviceData = analyticsData?.deviceBreakdown.map(item => ({
    name: item._id,
    value: item.count,
  })) || [];

  const topTemplates = analyticsData?.topTemplates.slice(0, 5).map((template, index) => ({
    name: template._id || 'Unknown',
    uses: template.count,
    percentage: Math.round((template.count / (analyticsData?.overview.totalEvents || 1)) * 100)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-300 mt-1">Track your performance and user insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-white backdrop-blur-sm"
          >
            <option className="bg-gray-900" value="7">Last 7 days</option>
            <option className="bg-gray-900" value="30">Last 30 days</option>
            <option className="bg-gray-900" value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="shadow-xl bg-black/40 backdrop-blur-lg border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold text-white mt-2">{stat.value}</h3>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Over Time Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Events Over Time</h2>
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="#C62828" 
                      strokeWidth={3}
                      dot={{ fill: '#C62828', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Categories Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Events by Category</h2>
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Top Templates</h2>
                <Image className="w-6 h-6 text-gray-400" />
              </div>
              {topTemplates.length > 0 ? (
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
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  No template data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Device Breakdown</h2>
                <Monitor className="w-6 h-6 text-gray-400" />
              </div>
              {deviceData.length > 0 ? (
                <div className="space-y-6">
                  {deviceData.map((device, index) => {
                    const total = deviceData.reduce((sum, d) => sum + d.value, 0);
                    const percentage = Math.round((device.value / total) * 100);
                    const Icon = device.name === 'Mobile' ? Smartphone : Monitor;
                    
                    return (
                      <div key={device.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-semibold text-white">{device.name}</p>
                              <p className="text-sm text-gray-400">{device.value.toLocaleString()} events</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-[#C62828]">{percentage}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3">
                          <div 
                            className={`bg-gradient-to-r ${
                              device.name === 'Mobile' 
                                ? 'from-blue-500 to-blue-600' 
                                : 'from-purple-500 to-purple-600'
                            } h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  No device data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Events</h2>
              <Activity className="w-6 h-6 text-gray-400" />
            </div>
            {analyticsData && analyticsData.recentEvents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.recentEvents.slice(0, 10).map((event, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-3 px-4 text-sm text-white">{event.eventType}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          <span className="px-2 py-1 bg-[#C62828]/20 text-[#FF6B6B] rounded-full text-xs">
                            {event.eventCategory}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {event.userId ? event.userId.substring(0, 8) + '...' : 'Anonymous'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">
                No recent events
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Analytics;
