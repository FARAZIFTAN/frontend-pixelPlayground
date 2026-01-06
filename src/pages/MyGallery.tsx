import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Camera, Upload, Download, Heart, Eye, Calendar, Loader2, Search, Filter, ChevronDown, Trash2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { compositeAPI, API_BASE_URL } from "@/services/api";
import { toast } from "react-hot-toast";
import { safeAnalytics } from "@/lib/analytics";
import { downloadFile } from "@/lib/fileUtils";

// Helper function to get full image URL
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  // For relative URLs, construct full URL properly
  try {
    const apiUrl = new URL(API_BASE_URL);
    const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`;
    return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  } catch {
    // Fallback to simple string replace if URL parsing fails
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  }
};

interface Composite {
  _id: string;
  compositeUrl: string;
  thumbnailUrl?: string;
  templateId?: string;
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: string;
  metadata?: {
    width?: number;
    height?: number;
    fileSize?: number;
    format?: string;
    photosUsed?: number;
  };
}

const MyGallery = () => {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();

  // Check premium status - Redirect ke upgrade page jika bukan premium
  useEffect(() => {
    if (user && !isPremium) {
      // Redirect langsung ke halaman upgrade
      navigate("/upgrade-pro");
    } else if (user && isPremium) {
      // User adalah premium, load gallery
      if (composites.length === 0) {
        loadComposites();
      }
    }
  }, [user, isPremium, navigate]);

  // State management
  const [composites, setComposites] = useState<Composite[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [selectedComposite, setSelectedComposite] = useState<Composite | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareData, setShareData] = useState<{ shareLink?: string; shareCode?: string; shareUrl?: string; qrCode?: string } | null>(null);
  const [sharingComposite, setSharingComposite] = useState<Composite | null>(null);
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingComposite, setDeletingComposite] = useState<Composite | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler untuk close modal - hanya set flag, redirect dihandle useEffect
  const handleCloseModal = () => {
    setModalClosedManually(true);
    setShowPremiumModal(false);
  };

  // Track page view
  useEffect(() => {
    safeAnalytics.pageView('My Gallery', user?.id);
  }, [user?.id]);

  // Delete composite
  const handleDeleteClick = (composite: Composite) => {
    setDeletingComposite(composite);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingComposite) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting composite:', deletingComposite._id);
      const response = await compositeAPI.deleteComposite(deletingComposite._id);
      console.log('✅ Delete response:', response);
      
      // Remove from local state
      setComposites(prev => prev.filter(c => c._id !== deletingComposite._id));
      
      toast.success('Photo deleted successfully!');
      
      // Track deletion in analytics
      safeAnalytics.compositeDelete(deletingComposite._id, user?.id);
      
      setDeleteDialogOpen(false);
      setDeletingComposite(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // User-friendly error messages
      let displayMessage = 'Failed to delete photo. Please try again.';
      if (errorMessage.includes('not found') || errorMessage.includes('unauthorized')) {
        displayMessage = 'Photo not found. It may have been already deleted.';
        // Close dialog since photo doesn't exist anyway
        setDeleteDialogOpen(false);
        setDeletingComposite(null);
        // Refresh the gallery to sync
        loadComposites();
      }
      
      toast.error(displayMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Load composites
  const loadComposites = async (pageNum = 1, append = false) => {
    // Jangan load jika bukan premium user
    if (!isPremium) {
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setError("");

      const response = await compositeAPI.getComposites({
        page: pageNum,
        limit: 20,
      }) as { data: { composites: Composite[]; pagination: { page: number; pages: number } } };

      const newComposites = response.data.composites || [];
      const pagination = response.data.pagination as { page: number; pages: number } || { page: 1, pages: 1 };

      if (append) {
        setComposites(prev => [...prev, ...newComposites]);
      } else {
        setComposites(newComposites);
      }

      setHasMore(pagination.page < pagination.pages);
      setPage(pageNum);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load gallery';
      setError(message);
      // Hanya tampilkan toast error jika memang error bukan karena tidak premium
      if (isPremium) {
        toast.error('Failed to load gallery');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Hanya load gallery jika user premium
    if (user && isPremium) {
      loadComposites();
    } else if (user && !isPremium) {
      // Set loading false untuk non-premium user
      setLoading(false);
    }
  }, [user, isPremium]);

  // Filter and sort composites
  const filteredComposites = composites
    .filter(composite => {
      const matchesSearch = !searchQuery ||
        (composite.metadata?.format || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(composite.createdAt).toLocaleDateString().includes(searchQuery);

      const matchesFilter = filterBy === 'all' ||
        (filterBy === 'public' && composite.isPublic) ||
        (filterBy === 'private' && !composite.isPublic);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-liked':
          return b.likes - a.likes;
        case 'most-viewed':
          return b.views - a.views;
        default:
          return 0;
      }
    });

  // Handle view composite
  const handleView = (composite: Composite) => {
    setSelectedComposite(composite);
    setIsViewDialogOpen(true);
    // Track view event using safeAnalytics
    safeAnalytics.templateView(composite._id, 'gallery_view', user?.id);
  };

  // Handle download
  const handleDownload = async (composite: Composite) => {
    try {
      // Get full URL
      const fullUrl = getImageUrl(composite.compositeUrl);
      
      // Use utility function to download with correct extension
      await downloadFile(
        fullUrl,
        `karyaKlik-composite-${composite._id}`
      );

      toast.success('Composite downloaded!');
      // Track download event using safeAnalytics
      safeAnalytics.compositeDownload(composite._id, user?.id);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download composite');
    }
  };

  // Handle share
  const handleShare = async (composite: Composite) => {
    setSharingComposite(composite);
    try {
      const response = await compositeAPI.shareComposite(composite._id) as { success: boolean; data: { shareLink?: string; shareCode?: string; shareUrl?: string; qrCode?: string } };
      if (response.success) {
        setShareData(response.data);
        setShareDialogOpen(true);
        // Track share event using safeAnalytics
        safeAnalytics.templateView(composite._id, 'gallery_share', user?.id);
      } else {
        toast.error('Failed to generate share link');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to generate share link');
    }
  };

  // Handle share to WhatsApp
  const handleShareWhatsApp = async (shareUrl: string) => {
    try {
      const message = `Lihat foto keren saya dari KaryaKlik! 📸\n\n${shareUrl}\n\nBuat foto kamu sendiri di KaryaKlik Photo Booth!`;
      const encodedMessage = encodeURIComponent(message);
      
      // Detect if mobile or desktop
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile: Use whatsapp:// protocol
        window.location.href = `whatsapp://send?text=${encodedMessage}`;
      } else {
        // Desktop: Use web.whatsapp.com
        const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
      
      // Track WhatsApp share using safeAnalytics
      safeAnalytics.templateView('whatsapp_share', isMobile ? 'mobile' : 'desktop', user?.id);
      
      toast.success('Opening WhatsApp...');
    } catch (error) {
      console.error('WhatsApp share error:', error);
      toast.error('Failed to open WhatsApp');
    }
  };

  // Load more composites
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      loadComposites(page + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#C62828]" />
          <p className="text-white">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => loadComposites()} className="bg-[#C62828] hover:bg-[#E53935]">
            Try Again
          </Button>
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
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <Image className="w-8 h-8 text-[#C62828]" />
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white text-center">My Gallery</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Kumpulan foto hasil jepretanmu. Di sini kamu bisa melihat, mengunduh, atau membagikan momen terbaik.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={() => navigate('/booth')}
              className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-full px-5 py-2 shadow-soft flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by date or format..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Photos</SelectItem>
              <SelectItem value="public">Public Only</SelectItem>
              <SelectItem value="private">Private Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-liked">Most Liked</SelectItem>
              <SelectItem value="most-viewed">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          {filteredComposites.length > 0 ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredComposites.map((composite, index) => (
                <motion.div
                  key={composite._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={getImageUrl(composite.compositeUrl)}
                        alt="Photo composite"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                        <Button
                          onClick={() => handleView(composite)}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                      {composite.isPublic && (
                        <Badge className="absolute top-2 left-2 bg-green-500/80 text-white text-xs">
                          Public
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(composite.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {composite.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {composite.likes}
                          </div>
                        </div>
                      </div>

                      {composite.metadata && (
                        <div className="text-xs text-gray-400 mb-3">
                          {composite.metadata.width}x{composite.metadata.height} • {composite.metadata.format?.toUpperCase()}
                          {composite.metadata.photosUsed && ` • ${composite.metadata.photosUsed} photos`}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(composite)}
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={async () => {
                            // Generate share link first
                            const response = await compositeAPI.shareComposite(composite._id) as { success: boolean; data: { shareUrl?: string } };
                            if (response.success && response.data.shareUrl) {
                              const imageUrl = getImageUrl(composite.compositeUrl);
                              handleShareWhatsApp(response.data.shareUrl, imageUrl);
                            } else {
                              toast.error('Failed to generate share link');
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(composite)}
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-heading font-semibold text-white mb-2">No photos yet</h3>
              <p className="text-muted-foreground mb-6">You haven't created any photo composites yet.</p>
              <Button
                onClick={() => navigate('/gallery')}
                className="bg-[#C62828] hover:bg-[#E53935] text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Creating Photos
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Photos'
              )}
            </Button>
          </div>
        )}

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="max-w-md bg-gray-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white text-center">Share Your Photo</DialogTitle>
            </DialogHeader>
            {shareData && sharingComposite && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={getImageUrl(sharingComposite.compositeUrl)}
                    alt="Photo composite"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>

                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-4">
                    Share this amazing photo composite with your friends!
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-lg">
                    <img
                      src={shareData.qrCode}
                      alt="QR Code"
                      className="w-32 h-32"
                    />
                  </div>
                </div>

                <div className="text-center text-xs text-gray-400 mb-4">
                  Scan QR code or copy link below
                </div>

                {/* Share URL */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-white text-sm break-all font-mono">
                    {shareData.shareUrl}
                  </p>
                </div>

                {/* Share Buttons */}
                <div className="space-y-2">
                  {/* WhatsApp Share Button - Primary */}
                  <Button
                    onClick={() => {
                      const imageUrl = getImageUrl(sharingComposite.compositeUrl);
                      handleShareWhatsApp(shareData.shareUrl, imageUrl);
                    }}
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Share to WhatsApp
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(shareData.shareUrl);
                        toast.success('Link copied to clipboard!');
                      }}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Copy Link
                    </Button>
                    {navigator.share && (
                      <Button
                        onClick={async () => {
                          try {
                            await navigator.share({
                              title: 'Check out my photo from KaryaKlik!',
                              text: 'I created this awesome photo using KaryaKlik Photo Booth',
                              url: shareData.shareUrl,
                            });
                            setShareDialogOpen(false);
                          } catch (error) {
                            // User cancelled share
                          }
                        }}
                        className="flex-1 bg-[#C62828] hover:bg-[#E53935] text-white"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        More
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md bg-gray-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white text-center">Delete Photo</DialogTitle>
            </DialogHeader>
            {deletingComposite && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={getImageUrl(deletingComposite.compositeUrl)}
                    alt="Photo to delete"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-red-500/30"
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-white font-semibold">
                    Are you sure you want to delete this photo?
                  </p>
                  <p className="text-gray-400 text-sm">
                    This action cannot be undone. The photo will be permanently deleted from your gallery and our servers.
                  </p>
                  <div className="text-xs text-gray-500 pt-2">
                    Created: {new Date(deletingComposite.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setDeletingComposite(null);
                    }}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyGallery;
