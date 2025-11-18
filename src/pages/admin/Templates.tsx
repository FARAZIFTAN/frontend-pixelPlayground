import { motion } from "framer-motion";
import { useState } from "react";
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
  Copy
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Templates = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Sample data - replace with real data from API
  const templates = [
    {
      id: 1,
      name: "Morris IF'25",
      category: "Artistic",
      thumbnail: "/assets/templates/morris/morris-1.png",
      frameCount: 3,
      isPremium: false,
      isActive: true,
      photosCount: 245,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Graduation 2024",
      category: "Education",
      thumbnail: "/assets/templates/graduation/graduation-1.png",
      frameCount: 3,
      isPremium: false,
      isActive: true,
      photosCount: 189,
      createdAt: "2024-01-10"
    },
  ];

  const categories = ["All", "Education", "Artistic", "Wedding", "Birthday", "Corporate"];

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

      {/* Templates Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="shadow-xl hover:shadow-2xl transition-all overflow-hidden group bg-black/30 backdrop-blur-lg border border-white/10">
                <div className="relative">
                  {/* Template Image */}
                  <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors border border-white/20" title="View">
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors border border-white/20" title="Edit">
                      <Edit className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors border border-white/20" title="Copy">
                      <Copy className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-3 bg-[#C62828]/80 backdrop-blur-sm rounded-lg hover:bg-[#C62828] transition-colors" title="Delete">
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
                      <Download className="w-4 h-4" />
                      <span>{template.photosCount}</span>
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Downloads</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-12 h-16 object-cover rounded border border-white/20"
                        />
                        <div>
                          <p className="font-semibold text-white">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.createdAt}</p>
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
                    <td className="px-6 py-4 text-sm text-gray-400">{template.photosCount}</td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-white/10 rounded transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Templates;
