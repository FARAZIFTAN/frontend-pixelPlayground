import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, ImagePlus, Trash2, Eye, Download, Loader2, AlertCircle, Sparkles, ArrowRight, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface AIFrame {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  frameUrl: string;
  frameCount: number;
  category: string;
  tags: string[];
  visibility: 'public' | 'private';
  isAIGenerated: boolean;
  aiFrameSpec?: {
    layout: string;
    frameCount: number;
    backgroundColor: string;
    borderColor: string;
  };
  createdAt: string;
}

const MyAIFrames = () => {
  const [frames, setFrames] = useState<AIFrame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAIFrames();
  }, []);

  const fetchAIFrames = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use sessionStorage instead of localStorage (consistent with app's auth pattern)
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/ai/my-frames`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch AI frames');
      }

      const data = await response.json();
      setFrames(data.frames || []);
    } catch (err) {
      console.error('Error fetching AI frames:', err);
      setError(err instanceof Error ? err.message : 'Failed to load AI frames');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (frameId: string, frameName: string) => {
    if (!confirm(`Are you sure you want to delete "${frameName}"?`)) {
      return;
    }

    try {
      // Use sessionStorage instead of localStorage
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to delete frames.');
        navigate('/login');
        return;
      }

      // Use AI-specific delete endpoint that checks ownership
      const response = await fetch(`${API_BASE_URL}/ai/delete-frame/${frameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Failed to delete frame (${response.status})`);
      }

      toast.success(`"${frameName}" has been deleted successfully.`);

      // Refresh the list
      fetchAIFrames();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete frame');
    }
  };

  const handleDownload = (frame: AIFrame) => {
    const link = document.createElement('a');
    link.href = frame.frameUrl;
    link.download = `${frame.name.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUseFrame = (frame: AIFrame) => {
    // Navigate to input method selection page
    // User bisa pilih mode: Upload Photos atau Use Camera
    navigate(`/input-method?template=${frame._id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading your AI frames...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
                <Wand2 className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">My AI Frames</h1>
                <p className="text-gray-400 mt-1">Your AI-generated frame workspace</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/ai-template-creator')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create New Frame
            </Button>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-purple-300 mb-1">AI Frame Workspace</p>
                <p className="text-gray-400">
                  These are your draft AI-generated frames. They may have different sizes and are not yet ready for camera use.
                  Review, edit, and add them to "My Creations" when ready.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-300 font-semibold">Error loading frames</h3>
                <p className="text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={fetchAIFrames}
              variant="outline"
              className="mt-4 border-red-500/30 text-red-300 hover:bg-red-500/10"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {!error && frames.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex p-6 bg-purple-500/10 rounded-full mb-6">
              <Wand2 className="w-16 h-16 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No AI Frames Yet</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Start creating beautiful photo frames with AI. Your generated frames will appear here automatically.
            </p>
            <Button
              onClick={() => navigate('/ai-template-creator')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Your First AI Frame
            </Button>
          </motion.div>
        )}

        {/* Frames Grid */}
        {!error && frames.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frames.map((frame, index) => (
              <motion.div
                key={frame._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-white text-lg line-clamp-1">
                        {frame.name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30 flex-shrink-0"
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        AI Draft
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Thumbnail */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-900/50 border border-gray-700">
                      <img
                        src={frame.thumbnail}
                        alt={frame.name}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Frame Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <ImagePlus className="w-4 h-4" />
                        <span>{frame.frameCount} photos · {frame.aiFrameSpec?.layout || 'custom'} layout</span>
                      </div>
                      {frame.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {frame.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {frame.tags.slice(0, 3).map((tag, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs border-gray-600 text-gray-400"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                        onClick={() => handleUseFrame(frame)}
                      >
                        <Camera className="w-4 h-4 mr-1" />
                        Use This Frame
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => handleDownload(frame)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(frame._id, frame.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Add to My Creations - Coming Soon */}
                    <div className="pt-2 border-t border-gray-700">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
                        disabled
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Add to My Creations
                        <span className="ml-2 text-xs opacity-60">(Coming Soon)</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {frames.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-gray-400 text-sm"
          >
            Total: {frames.length} AI-generated frame{frames.length !== 1 ? 's' : ''}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyAIFrames;
