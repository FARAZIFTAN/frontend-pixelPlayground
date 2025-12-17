import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Clock, Trash2, Eye, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { sessionAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

interface Session {
  _id: string;
  sessionName: string;
  status: 'active' | 'completed' | 'cancelled';
  capturedPhotos: string[];
  templateId?: string;
  metadata?: {
    totalPhotos?: number;
    duration?: number;
  };
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export default function PhotoSessions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      loadSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const response = await sessionAPI.getSessions(params) as {
        success: boolean;
        data?: { sessions: Session[] };
      };
      
      if (response.success && response.data) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      toast.error('Gagal memuat sesi foto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Yakin ingin menghapus sesi ini?')) return;

    try {
      await sessionAPI.deleteSession(sessionId);
      toast.success('Sesi berhasil dihapus');
      loadSessions();
    } catch (error) {
      toast.error('Gagal menghapus sesi');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktif', color: 'bg-blue-500' },
      completed: { label: 'Selesai', color: 'bg-green-500' },
      cancelled: { label: 'Dibatalkan', color: 'bg-gray-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} text-white border-0`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            📸 Sesi Foto Saya
          </h1>
          <p className="text-muted-foreground text-lg">
            Kelola semua sesi foto yang pernah Anda buat
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <Button
            onClick={() => navigate('/gallery')}
            className="bg-primary hover:bg-primary/90 rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Sesi Baru
          </Button>

          {/* Filter */}
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? 'default' : 'outline'}
                className="rounded-full"
              >
                {status === 'all' ? 'Semua' : status === 'active' ? 'Aktif' : 'Selesai'}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-12 text-center">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-heading font-semibold mb-2">
                  Belum Ada Sesi Foto
                </h3>
                <p className="text-muted-foreground mb-6">
                  Mulai sesi foto pertama Anda sekarang!
                </p>
                <Button
                  onClick={() => navigate('/gallery')}
                  className="bg-primary hover:bg-primary/90 rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Sesi Baru
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, index) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all group">
                  <CardContent className="p-6">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      {getStatusBadge(session.status)}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {session.status === 'active' && (
                          <Button
                            onClick={() => navigate(`/booth?template=${session.templateId}`)}
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteSession(session._id)}
                          size="sm"
                          variant="destructive"
                          className="rounded-full"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Session Info */}
                    <h3 className="font-heading font-semibold text-lg mb-2">
                      {session.sessionName}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span>{session.metadata?.totalPhotos || 0} foto</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(session.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {session.status === 'completed' && (
                      <Button
                        onClick={() => navigate(`/my-gallery`)}
                        className="w-full mt-4 rounded-full"
                        variant="outline"
                      >
                        Lihat Hasil
                      </Button>
                    )}
                    {session.status === 'active' && (
                      <Button
                        onClick={() => navigate(`/booth?template=${session.templateId}`)}
                        className="w-full mt-4 rounded-full bg-primary hover:bg-primary/90"
                      >
                        Lanjutkan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
