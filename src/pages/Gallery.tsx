import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Sparkles, ArrowRight, Eye, TrendingUp, Star, Award, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { templates, Template, templateCategories } from "@/data/templates";

const Gallery = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [filterType, setFilterType] = useState("all");
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<Template | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Birthday: "🎂",
      Wedding: "💍",
      Education: "🎓",
      Corporate: "💼",
      Baby: "👶",
      Holiday: "🎄",
      Love: "❤️",
    };
    return icons[category] || "🎨";
  };

  // Get template count per category
  const getCategoryCount = (category: string) => {
    if (category === "All") return templates.length;
    return templates.filter((t) => t.category === category).length;
  };

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: templates.length,
      premium: templates.filter((t) => t.isPremium).length,
      free: templates.filter((t) => !t.isPremium).length,
      categories: templateCategories.length,
    };
  }, []);

  // Filter templates based on category and type
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter((template) => {
      const matchesCategory = activeCategory === "All" || template.category === activeCategory;
      const matchesType = 
        filterType === "all" ? true :
        filterType === "free" ? !template.isPremium :
        filterType === "premium" ? template.isPremium : true;
      
      return matchesCategory && matchesType;
    });

    // Sort templates
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // Default: popular (or could be by ID for now)
      return 0;
    });

    return filtered;
  }, [activeCategory, filterType, sortBy]);

  // Navigate to Booth with pre-selected template
  const handleUseTemplate = (templateId: string) => {
    navigate(`/booth?template=${templateId}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Enhanced Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              {stats.total} Professional Templates
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
            Discover Perfect Templates
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose from our collection of professionally designed photo booth templates
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 bg-secondary/50 backdrop-blur-sm border border-border rounded-full px-4 py-2"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-white">{stats.premium} Premium</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-secondary/50 backdrop-blur-sm border border-border rounded-full px-4 py-2"
            >
              <Star className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-white">{stats.free} Free</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 bg-secondary/50 backdrop-blur-sm border border-border rounded-full px-4 py-2"
            >
              <Image className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-white">{stats.categories} Categories</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Sort & Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center max-w-4xl mx-auto"
        >
          <div className="flex gap-3 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-full border-2">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Popular
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Name A-Z
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-full border-2">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(activeCategory !== "All" || filterType !== "all") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 flex-wrap"
            >
              <span className="text-sm text-muted-foreground">Active:</span>
              {activeCategory !== "All" && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-destructive transition-colors"
                  onClick={() => setActiveCategory("All")}
                >
                  {activeCategory} ×
                </Badge>
              )}
              {filterType !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-destructive transition-colors"
                  onClick={() => setFilterType("all")}
                >
                  {filterType === "free" ? "Free" : "Premium"} ×
                </Badge>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Visual Category Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Image className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Browse by Category</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {/* All Templates Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCategory("All")}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeCategory === "All"
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl">✨</div>
                <div className="font-semibold text-sm">All Templates</div>
                <Badge variant="secondary" className="text-xs">
                  {getCategoryCount("All")}
                </Badge>
              </div>
            </motion.button>

            {/* Category Cards */}
            {templateCategories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(category)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">{getCategoryIcon(category)}</div>
                  <div className="font-semibold text-sm">{category}</div>
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryCount(category)}
                  </Badge>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Template Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onHoverStart={() => setHoveredTemplate(template.id)}
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
                          opacity: hoveredTemplate === template.id ? 1 : 0,
                          y: hoveredTemplate === template.id ? 0 : 10
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-3 right-3"
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full shadow-lg backdrop-blur-sm bg-black/50 hover:bg-black/70 text-white border-0"
                          onClick={() => setSelectedTemplateForPreview(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </motion.div>

                      {/* Hover Overlay with Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ 
                            y: hoveredTemplate === template.id ? 0 : 20,
                            opacity: hoveredTemplate === template.id ? 1 : 0
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
                      handleUseTemplate(template.id);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-soft group-hover:shadow-hover transition-all"
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced No Results */}
        {filteredTemplates.length === 0 && (
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
                We couldn't find any templates matching your filters
              </p>

              {/* Suggestions */}
              <div className="bg-secondary/30 border border-border rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-white mb-2">Try:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Selecting a different category</li>
                  <li>• Changing the filter type (Free/Premium)</li>
                  <li>• Clearing all active filters</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => { 
                    setActiveCategory("All");
                    setFilterType("all");
                  }}
                  className="rounded-full bg-primary hover:bg-primary/90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/booth")}
                  className="rounded-full"
                >
                  Go to Booth
                </Button>
              </div>
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
                    onClick={() => handleUseTemplate(selectedTemplateForPreview.id)}
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
      </div>
    </div>
  );
};

export default Gallery;
