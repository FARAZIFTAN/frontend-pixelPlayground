import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Image, 
  PlusCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Download,
  Copy,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LazyImage from "@/components/ui/LazyImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { templateAPI } from "@/services/api";
import { toast } from "react-hot-toast";

interface Template {
  _id: string;
  name: string;
  category: string;
  thumbnail: string;
  frameUrl: string;
  frameCount: number;
  isPremium: boolean;
  isActive: boolean;
  layoutPositions: Array<{ x: number; y: number; width: number; height: number }>;
  createdAt: string;
  updatedAt: string;
}

const Templates = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const categories = ["All", "Education", "Artistic", "Wedding", "Birthday", "Corporate", "Baby", "Holiday", "Love", "General"];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching templates...");
      const response = await templateAPI.getTemplates({ limit: 20 }) as {
        success: boolean;
        data?: { templates: Template[] };
      };
      
      console.log("Templates response:", response);
      
      if (response.success && response.data) {
        console.log("Templates loaded:", response.data.templates.length);
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error('Load templates error:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"? This will deactivate it.`)) return;

    try {
      await templateAPI.deleteTemplate(id);
      toast.success('Template deleted successfully');
      loadTemplates(); // Reload
    } catch (error) {
      console.error('Delete template error:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleToggleActive = async (template: Template) => {
    try {
      await templateAPI.updateTemplate(template._id, {
        isActive: !template.isActive
      });
      toast.success(`Template ${!template.isActive ? 'activated' : 'deactivated'}`);
      loadTemplates(); // Reload
    } catch (error) {
      console.error('Update template error:', error);
      toast.error('Failed to update template');
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowEditDialog(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setIsSaving(true);
    try {
      await templateAPI.updateTemplate(editingTemplate._id, {
        name: editingTemplate.name,
        category: editingTemplate.category,
        isPremium: editingTemplate.isPremium,
        isActive: editingTemplate.isActive,
      });
      toast.success('Template updated successfully');
      setShowEditDialog(false);
      loadTemplates();
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Templates</h1>
          <p className="text-gray-300 mt-1">Manage your photo booth templates</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/template-creator')}
          className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold shadow-lg"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/20 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-[#C62828] text-white" : "text-gray-400 hover:text-white"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-[#C62828] text-white" : "text-gray-400 hover:text-white"}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing <span className="font-semibold text-white">{filteredTemplates.length}</span> templates
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#C62828]" />
          <span className="ml-3 text-white">Loading templates...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20">
          <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-2xl font-heading font-semibold text-white">No templates found</h3>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="shadow-xl hover:shadow-2xl transition-all overflow-hidden group bg-black/30 backdrop-blur-lg border border-white/10">
                <div className="relative">
                  {/* Template Image */}
                  <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    <LazyImage
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleToggleActive(template)}
                      className="p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors border border-white/20" 
                      title={template.isActive ? "Deactivate" : "Activate"}
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={() => handleEditTemplate(template)}
                      className="p-3 bg-blue-500/80 backdrop-blur-sm rounded-lg hover:bg-blue-500 transition-colors" 
                      title="Edit"
                    >
                      <Edit className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTemplate(template._id, template.name)}
                      className="p-3 bg-[#C62828]/80 backdrop-blur-sm rounded-lg hover:bg-[#C62828] transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className={template.isActive ? "bg-green-500" : "bg-gray-500"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-amber-500">Premium</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-white mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{template.category}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Image className="w-4 h-4" />
                      <span>{template.frameCount} photos</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <span className="text-xs">{new Date(template.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Template</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Photos</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr key={template._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <LazyImage
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-12 h-16 object-cover rounded border border-white/20"
                        />
                        <div>
                          <p className="font-semibold text-white">{template.name}</p>
                          <p className="text-xs text-gray-500">{new Date(template.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{template.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{template.frameCount}</td>
                    <td className="px-6 py-4">
                      <Badge className={template.isActive ? "bg-green-500" : "bg-gray-500"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{template.isPremium ? 'Premium' : 'Free'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditTemplate(template)}
                          className="p-2 hover:bg-white/10 rounded transition-colors" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(template._id, template.name)}
                          className="p-2 hover:bg-white/10 rounded transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-black/95 border border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Edit className="w-6 h-6 text-blue-400" />
              Edit Template
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update template information and settings
            </DialogDescription>
          </DialogHeader>
          
          {editingTemplate && (
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              {/* Template Preview */}
              <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <img
                  src={editingTemplate.thumbnail}
                  alt={editingTemplate.name}
                  className="w-32 h-48 object-cover rounded-lg border border-white/20"
                />
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-gray-400">Template ID: {editingTemplate._id}</p>
                  <p className="text-sm text-gray-400">Frame Count: {editingTemplate.frameCount}</p>
                  <p className="text-sm text-gray-400">Created: {new Date(editingTemplate.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                >
                  {categories.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Premium</p>
                    <p className="text-xs text-gray-400">Requires payment</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.isPremium}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, isPremium: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Active</p>
                    <p className="text-xs text-gray-400">Visible to users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.isActive}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <Button
                  type="button"
                  onClick={() => setShowEditDialog(false)}
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;
