import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Sparkles, ArrowRight, Eye, Award, Camera, TrendingUp, Star, Loader2, Search, Filter, ChevronDown, Check, X, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import analytics from "@/lib/analytics";
import { templateAPI, userFrameAPI } from "@/services/api";
import { toast } from "react-hot-toast";
import PremiumModal from "@/components/PremiumModal";

interface Template {
  _id: string;
  name: string;
  category: string;
  thumbnail: string;
  frameUrl: string;
  isPremium: boolean;
  frameCount: number;
  layoutPositions: Array<{ x: number; y: number; width: number; height: number }>;
}

const Gallery = () => {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<Template | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userCustomFrames, setUserCustomFrames] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20;

  // Ref for infinite scroll trigger
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Gallery tidak perlu proteksi - user bisa lihat semua template
  // Hanya frame premium yang di-lock untuk non-premium user

  // Available categories with template counts
  const categories = ["All", "Education", "Wedding", "Birthday", "Corporate", "Baby", "Holiday", "Love", "Artistic", "General"];
  
  // Calculate template counts per category
  const categoryCounts = templates.reduce((acc, template) => {
    acc[template.category] = (acc[template.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // All templates count
  categoryCounts["All"] = templates.length;

  // Load templates from API immediately on mount
  useEffect(() => {
    loadTemplates();
    loadCustomFrames();
  }, [user]);

  const loadTemplates = async (page = 1, append = false) => {
    if (page === 1 && !append) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    // Check cache first for faster loading (only for first page)
    if (page === 1 && !append) {
      const cachedTemplates = sessionStorage.getItem('templates_cache');
      if (cachedTemplates) {
        try {
          const parsed = JSON.parse(cachedTemplates);
          console.log('⚡ Using cached templates:', parsed.length);
          setTemplates(parsed);
          setIsLoading(false);
          // Still fetch in background to update cache
          fetchTemplates(page, append);
          return;
        } catch (e) {
          console.warn('Cache parse error, fetching fresh');
        }
      }
    }
    
    await fetchTemplates(page, append);
  };
  
  const fetchTemplates = async (page = 1, append = false) => {
    try {
      const response = await templateAPI.getTemplates({ 
        limit: itemsPerPage, 
        page,
        skip: (page - 1) * itemsPerPage 
      }) as {
        success: boolean;
        data?: { templates: Template[]; total?: number };
      };
      
      console.log('📦 Template response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Templates loaded:', response.data.templates.length);
        
        if (append) {
          setTemplates(prev => [...prev, ...response.data!.templates]);
        } else {
          setTemplates(response.data.templates);
        }
        
        // Check if there are more pages
        const totalTemplates = response.data.total || 0;
        const loadedCount = append ? templates.length + response.data.templates.length : response.data.templates.length;
        setHasMore(loadedCount < totalTemplates);
        
        // Cache only first page
        if (page === 1 && !append) {
          try {
            const lightweightCache = response.data.templates.map(t => ({
              _id: t._id,
              name: t.name,
              category: t.category,
              thumbnail: t.thumbnail,
              frameUrl: t.frameUrl,
              isPremium: t.isPremium,
              frameCount: t.frameCount,
            }));
            sessionStorage.setItem('templates_cache', JSON.stringify(lightweightCache));
          } catch (cacheError) {
            if (cacheError instanceof Error && cacheError.name === 'QuotaExceededError') {
              console.warn('⚠️ Cache quota exceeded, clearing old cache');
              sessionStorage.removeItem('templates_cache');
            }
          }
        }
      } else {
        console.warn('⚠️ No templates data in response');
        setHasMore(false);
        if (!append) {
          toast.error('No templates found');
        }
      }
    } catch (error) {
      console.error('❌ Load templates error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('fetch')) {
        toast.error('Backend server not running. Start backend first!', { duration: 5000 });
      } else {
        toast.error('Failed to load templates');
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load user's custom frames
  const loadCustomFrames = async () => {
    if (!user) {
      setUserCustomFrames([]);
      return;
    }

    try {
      const response = await userFrameAPI.getAll();
      if (response.data) {
        console.log('📸 Custom frames loaded:', response.data.length);
        // Ensure custom frames have all required Template fields
        const normalizedFrames = response.data.map((frame: any) => ({
          ...frame,
          category: frame.category || 'User Generated',
          isPremium: false,
          thumbnail: frame.thumbnail || frame.frameUrl,
        }));
        setUserCustomFrames(normalizedFrames);
      }
    } catch (error) {
      console.error('Error loading custom frames:', error);
      // Tidak perlu toast error untuk custom frames
      setUserCustomFrames([]);
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          setCurrentPage(prev => prev + 1);
          loadTemplates(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadTemplates(1, false);
  }, [selectedCategories, searchQuery]);

  // Filter templates based on search and categories (from loaded templates)
  const filteredTemplates = templates.filter(template => {
    const matchSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategories.includes("All") || selectedCategories.includes(template.category);
    
    return matchSearch && matchCategory;
  });

  // Track page view
  useEffect(() => {
    analytics.pageView('Gallery', user?.id);
  }, [user?.id]);

  // Track template preview
  const handlePreview = (template: Template) => {
    setSelectedTemplateForPreview(template);
    analytics.templateView(template._id, template.name, user?.id);
  };

  // Navigate to Input Method Selection with pre-selected template
  const handleUseTemplate = (template: Template) => {
    // Cegah akses template premium jika user belum premium
    if (template.isPremium && !isPremium) {
      // Jika belum login, arahkan ke login
      if (!user) {
        toast.error("Login diperlukan untuk menggunakan frame premium!", { 
          duration: 4000,
          icon: "🔒"
        });
        setTimeout(() => {
          navigate("/login");
        }, 1500);
        return;
      }
      
      // Jika sudah login tapi belum premium, tampilkan modal upgrade
      toast.error("Upgrade ke Premium untuk menggunakan frame PRO!", { 
        duration: 3000,
        icon: "👑"
      });
      setShowPremiumModal(true);
      return;
    }
    
    analytics.templateSelect(template._id, template.name, user?.id);
    navigate(`/input-method?template=${template._id}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Simple & Clean Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
            Explore Templates
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Temukan dan pilih template foto yang sempurna untuk Anda
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <motion.div 
                className="flex flex-col md:flex-row gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                {/* Search Input */}
                <motion.div 
                  className="flex-1 relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                    whileFocus={{ 
                      boxShadow: "0 0 0 3px rgba(198, 40, 40, 0.1)",
                      scale: 1.01
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>

                {/* Category Filter with Multi-Select */}
                <motion.div 
                  className="flex items-start gap-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Filter className="w-5 h-5 text-gray-400 mt-3" />
                  <div className="flex-1">
                    {/* Selected Categories Chips */}
                    <AnimatePresence mode="popLayout">
                      {selectedCategories.length > 0 && (
                        <motion.div 
                          className="flex flex-wrap gap-2 mb-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AnimatePresence>
                            {selectedCategories.map((category) => (
                              <motion.span
                                key={category}
                                layout
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ 
                                  type: "spring", 
                                  stiffness: 500, 
                                  damping: 30,
                                  opacity: { duration: 0.2 }
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30"
                              >
                                {category}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setSelectedCategories(prev => {
                                      const newCategories = prev.filter(c => c !== category);
                                      // If no categories selected after removal, default to "All"
                                      return newCategories.length === 0 ? ["All"] : newCategories;
                                    });
                                  }}
                                  className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </motion.button>
                              </motion.span>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Custom Dropdown */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-between px-4 py-3 bg-white/10 border border-white/20 rounded-lg hover:border-white/30 text-white transition-all duration-300"
                          >
                            {selectedCategories.length === 0 
                              ? "Select categories..." 
                              : `${selectedCategories.length} selected`
                            }
                            <motion.div
                              animate={{ rotate: 0 }}
                              whileHover={{ rotate: 180 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="w-4 h-4 opacity-50" />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-80 p-0 bg-gray-900 border border-white/20 text-white shadow-2xl"
                        align="start"
                        asChild
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 30,
                            duration: 0.3 
                          }}
                        >
                        <div className="p-3 border-b border-white/10">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search categories..."
                              value={categorySearchQuery}
                              onChange={(e) => setCategorySearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-white placeholder-gray-400 text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto">
                          {/* All Categories Option */}
                          <div className="p-2">
                            <motion.button
                              whileHover={{ 
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                scale: 1.02 
                              }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedCategories(prev => {
                                  if (prev.includes("All")) {
                                    return [];
                                  } else {
                                    return ["All"];
                                  }
                                });
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                                selectedCategories.includes("All") 
                                  ? 'bg-primary/20 text-primary border border-primary/30' 
                                  : 'hover:bg-white/5 text-white'
                              } ${categorySearchQuery && !("All".toLowerCase().includes(categorySearchQuery.toLowerCase())) ? 'hidden' : ''}`}
                            >
                              <span className="font-medium">All Categories</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  ({categoryCounts["All"] || 0} templates)
                                </span>
                                <AnimatePresence>
                                  {selectedCategories.includes("All") && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    >
                                      <Check className="w-4 h-4 text-primary" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.button>
                          </div>

                          {/* Individual Categories */}
                          <div className="border-t border-white/10">
                            <AnimatePresence mode="popLayout">
                              {categories
                                .filter(cat => cat !== "All")
                                .filter(cat => cat.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                                .map((cat, index) => (
                                <motion.div
                                  key={cat}
                                  layout
                                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                  transition={{ 
                                    type: "spring", 
                                    stiffness: 400, 
                                    damping: 30,
                                    delay: index * 0.02 
                                  }}
                                >
                                  <motion.button
                                    whileHover={{ 
                                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                                      scale: 1.02 
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      setSelectedCategories(prev => {
                                        if (prev.includes(cat)) {
                                          // Remove category
                                          const newCategories = prev.filter(c => c !== cat);
                                          return newCategories.length === 0 ? ["All"] : newCategories;
                                        } else {
                                          // Add category, remove "All" if present
                                          return prev.filter(c => c !== "All").concat(cat);
                                        }
                                      });
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                                      selectedCategories.includes(cat) 
                                        ? 'bg-primary/20 text-primary border border-primary/30' 
                                        : 'hover:bg-white/5 text-white'
                                    }`}
                                  >
                                    <span className="font-medium">{cat}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400">
                                        ({categoryCounts[cat] || 0} templates)
                                      </span>
                                      <AnimatePresence>
                                        {selectedCategories.includes(cat) && (
                                          <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                          >
                                            <Check className="w-4 h-4 text-primary" />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </motion.button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                        </motion.div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </motion.div>
              </motion.div>

              {/* Results Count */}
              <motion.div 
                className="mt-4 text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                key={`${filteredTemplates.length}-${templates.length}`} // Re-animate when counts change
              >
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Showing {filteredTemplates.length} of {templates.length} templates
                </motion.span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Custom Frames Section */}
        {userCustomFrames.length > 0 && (
          <div className="mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500" />
                My Custom Frames
              </h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {userCustomFrames.map((frame, index) => (
                <motion.div
                  key={`custom-${frame._id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onMouseEnter={() => setHoveredTemplate(`custom-${frame._id}`)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  className="group cursor-pointer"
                >
                  <Card className="overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 h-full flex flex-col">
                    <CardContent className="p-0 relative flex-1 overflow-hidden">
                      {/* Template Image */}
                      <div className="relative w-full aspect-[3/4] overflow-hidden bg-black/20">
                        <img
                          src={frame.thumbnail}
                          alt={frame.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                        
                        {/* Custom Frame Badge */}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-current" />
                          Your Frame
                        </div>

                        {/* Hover Overlay */}
                        <AnimatePresence>
                          {hoveredTemplate === `custom-${frame._id}` && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3"
                            >
                              <Button
                                onClick={() => handlePreview(frame)}
                                className="bg-primary hover:bg-primary/90 text-white"
                                size="sm"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                onClick={() => handleUseTemplate(frame)}
                                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/50 text-white"
                                size="sm"
                              >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Use
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 border-t border-white/5 bg-white/[0.02]">
                      <div className="w-full">
                        <h3 className="font-semibold text-white truncate">{frame.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{frame.frameCount} photos</p>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Template Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#C62828]" />
            <span className="ml-3 text-white">Loading templates...</span>
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template, index) => {
            console.log(`🎨 Rendering template ${index + 1}:`, template.name, template._id);
            return (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: (index % itemsPerPage) * 0.05 }}
              onHoverStart={() => setHoveredTemplate(template._id)}
              onHoverEnd={() => setHoveredTemplate(null)}
            >
              <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all group overflow-hidden h-full">
                {/* Template Image */}
                <div className="relative cursor-pointer">
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] bg-secondary relative overflow-hidden">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Premium Badge */}
                      {template.isPremium && (
                        <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 shadow-lg">
                          <Award className="w-3 h-3 mr-1" />
                          PRO
                        </Badge>
                      )}

                      {/* Quick View Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: hoveredTemplate === template._id ? 1 : 0,
                          y: hoveredTemplate === template._id ? 0 : 10
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-3 right-3"
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full shadow-lg backdrop-blur-sm bg-black/50 hover:bg-black/70 text-white border-0"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </motion.div>

                      {/* Hover Overlay with Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ 
                            y: hoveredTemplate === template._id ? 0 : 20,
                            opacity: hoveredTemplate === template._id ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge className="mb-2 bg-primary/90 text-white border-0">
                            {template.category}
                          </Badge>
                          <p className="text-white text-sm font-medium mb-1">
                            {template.name}
                          </p>
                          <p className="text-gray-300 text-xs">
                            Click to preview or use template
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Template Info & Action */}
                <CardFooter className="flex flex-col items-start p-4 gap-3">
                  <div className="w-full">
                    <h3 className="font-heading font-semibold text-base mb-1 text-white line-clamp-1">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{template.category}</p>
                      {!template.isPremium && (
                        <Badge variant="outline" className="text-xs border-green-500/50 text-green-500">
                          Free
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                    className={`w-full rounded-full shadow-soft group-hover:shadow-hover transition-all ${
                      template.isPremium && !isPremium
                        ? 'bg-gray-600 hover:bg-gray-500 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {template.isPremium && !isPremium ? (
                      <>
                        <span>🔒 Premium Only</span>
                      </>
                    ) : (
                      <>
                        Use Template
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            );
          })}
        </div>
        )}

        {/* Load More Trigger */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more templates...</span>
              </div>
            ) : (
              <div className="h-10" /> // Invisible trigger for intersection observer
            )}
          </div>
        )}

        {/* Enhanced No Results */}
        {!isLoading && filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Image className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-heading font-semibold mb-2 text-white">
                No templates found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or category filters
              </p>

              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories([]);
                }}
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Template Preview Modal */}
        <Dialog open={!!selectedTemplateForPreview} onOpenChange={(open) => !open && setSelectedTemplateForPreview(null)}>
          <DialogContent className="max-w-4xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading flex items-center gap-2">
                {selectedTemplateForPreview?.name}
                {selectedTemplateForPreview?.isPremium && (
                  <Badge className="bg-amber-500 text-white border-0">
                    <Award className="w-3 h-3 mr-1" />
                    PRO
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {selectedTemplateForPreview?.category} Template • Perfect for your event
              </DialogDescription>
            </DialogHeader>
            
            {selectedTemplateForPreview && (
              <div className="space-y-6">
                {/* Template Preview Image */}
                <div className="aspect-video rounded-lg overflow-hidden bg-secondary relative group">
                  <img
                    src={selectedTemplateForPreview.frameUrl}
                    alt={selectedTemplateForPreview.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Badge className="bg-white/90 text-black">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview Mode
                    </Badge>
                  </div>
                </div>

                {/* Template Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-lg text-center border border-border">
                    <Image className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="font-semibold text-white text-sm">{selectedTemplateForPreview.category}</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg text-center border border-border">
                    <Award className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="font-semibold text-white text-sm">
                      {selectedTemplateForPreview.isPremium ? "Premium" : "Free"}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg text-center border border-border">
                    <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Quality</p>
                    <p className="font-semibold text-white text-sm">High-Res</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg text-center border border-border">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <p className="font-semibold text-white text-sm">4.8/5</p>
                  </div>
                </div>

                {/* Features List */}
                <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Template Features
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Professional design
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      High-resolution output
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Instant download
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Easy sharing
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleUseTemplate(selectedTemplateForPreview)}
                    className="flex-1 bg-primary hover:bg-primary/90 rounded-full py-6 shadow-lg shadow-primary/20"
                    size="lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Use This Template
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTemplateForPreview(null)}
                    className="rounded-full px-8"
                    size="lg"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Premium Modal */}
        <PremiumModal 
          isOpen={showPremiumModal} 
          onClose={() => setShowPremiumModal(false)}
          feature="Gallery"
        />
      </div>
    </div>
  );
};

export default Gallery;
