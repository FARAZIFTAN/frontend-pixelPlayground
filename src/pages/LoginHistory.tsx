import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, MapPin, Monitor, ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { userAPI } from "@/services/api";

interface LoginEntry {
  ipAddress: string;
  userAgent: string;
  loginAt: string;
}

const LoginHistory = () => {
  const [loading, setLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadLoginHistory = async () => {
      setLoading(true);
      try {
        const data = await userAPI.getLoginHistory();
        const history = (data as any).data?.loginHistory || (data as any).loginHistory || [];
        const last = (data as any).data?.lastLogin || (data as any).lastLogin || null;

        setLoginHistory(history);
        setLastLogin(last);
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load login history.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadLoginHistory();
  }, [toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return { type: 'Mobile', icon: '📱' };
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return { type: 'Tablet', icon: '📱' };
    } else {
      return { type: 'Desktop', icon: '💻' };
    }
  };

  const getBrowserInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();

    if (ua.includes('chrome') && !ua.includes('edg')) {
      return 'Chrome';
    } else if (ua.includes('firefox')) {
      return 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari';
    } else if (ua.includes('edg')) {
      return 'Edge';
    } else if (ua.includes('opera')) {
      return 'Opera';
    } else {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading login history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <History className="w-8 h-8 text-[#C62828]" />
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white">Login History</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            View your recent login activity and device information for security purposes.
          </p>
        </motion.div>

        {/* Last Login Info */}
        {lastLogin && (
          <div className="bg-secondary border border-border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Last Login
            </h3>
            <p className="text-muted-foreground">
              {formatDate(lastLogin)}
            </p>
          </div>
        )}

        {/* Login History List */}
        <div className="space-y-4">
          {loginHistory.length === 0 ? (
            <div className="bg-secondary border border-border rounded-lg p-8 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Login History</h3>
              <p className="text-muted-foreground">
                Your login history will appear here once you start logging in.
              </p>
            </div>
          ) : (
            loginHistory.map((entry, index) => {
              const deviceInfo = getDeviceInfo(entry.userAgent);
              const browser = getBrowserInfo(entry.userAgent);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-secondary border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{deviceInfo.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                          <span className="text-white font-medium">{deviceInfo.type}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{browser}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>IP: {entry.ipAddress}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(entry.loginAt)}</span>
                        </div>
                      </div>
                    </div>

                    {index === 0 && (
                      <div className="bg-[#C62828]/20 text-[#C62828] px-3 py-1 rounded-full text-xs font-medium">
                        Latest
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate("/my-account")}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginHistory;