import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/services/api';
import { downloadFile } from '@/lib/fileUtils';

interface SharedComposite {
  _id: string;
  compositeUrl: string;
  thumbnailUrl: string;
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: string;
  metadata: {
    templateName?: string;
    sessionId?: string;
  };
}

interface ShareData {
  composite: SharedComposite;
  shareUrl: string;
}

const SharePage = () => {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const loadSharedComposite = async () => {
      if (!id) return;

      try {
        const response = await apiCall(`/api/share/public/${id}`, { method: 'GET' }) as ShareData;
        setShareData(response);
      } catch (err: any) {
        setError(err.message || 'Failed to load shared composite');
      } finally {
        setLoading(false);
      }
    };

    loadSharedComposite();
  }, [id]);

  const handleDownload = async () => {
    if (!shareData || isDownloading) return;

    setIsDownloading(true);
    try {
      // Use utility function to download with correct extension
      await downloadFile(
        shareData.composite.compositeUrl,
        `karyaKlik-composite-${shareData.composite._id}`
      );

      toast({
        title: 'Download Started',
        description: 'Your composite image is being downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download the composite image.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!shareData || isSharing) return;

    setIsSharing(true);
    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'KaryaKlik Photo Composite',
            text: 'Check out this amazing photo composite created with KaryaKlik!',
            url: shareData.shareUrl,
          });
        } catch (error) {
          copyToClipboard();
        }
      } else {
        copyToClipboard();
      }
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareData) return;

    navigator.clipboard.writeText(shareData.shareUrl).then(() => {
      toast({
        title: 'Link Copied',
        description: 'Share link has been copied to clipboard.',
      });
    }).catch(() => {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link to clipboard.',
        variant: 'destructive',
      });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared composite...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
            <p className="text-gray-600 mb-6">
              {error || 'This shared composite could not be found.'}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { composite } = shareData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={composite.compositeUrl}
                alt="Shared Photo Composite"
                className="w-full h-auto max-h-[70vh] object-contain bg-gray-100"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge variant="secondary" className="bg-white/90">
                  <Eye className="w-4 h-4 mr-1" />
                  {composite.views}
                </Badge>
                <Badge variant="secondary" className="bg-white/90">
                  <Heart className="w-4 h-4 mr-1" />
                  {composite.likes}
                </Badge>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    KaryaKlik Photo Composite
                  </h1>
                  {composite.metadata?.templateName && (
                    <p className="text-gray-600">
                      Template: {composite.metadata.templateName}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Created on {new Date(composite.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleDownload} className="flex-1" disabled={isDownloading}>
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex-1" disabled={isSharing}>
                  <Share2 className="w-4 h-4 mr-2" />
                  {isSharing ? 'Sharing...' : 'Share'}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Created with ❤️ using KaryaKlik
                </p>
                <Button
                  variant="link"
                  onClick={() => window.location.href = '/'}
                  className="text-purple-600 hover:text-purple-800"
                >
                  Create Your Own Composite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharePage;