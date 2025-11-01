import { motion } from "framer-motion";
import { Plus, Trash2, Palette, Edit, Layers, Star } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Template = {
  id: string;
  name: string;
  category: string;
  isPremium: boolean;
  thumbnail: string;
};

const initialTemplates: Template[] = [
  {
    id: "1",
    name: "Birthday Party",
    category: "Birthday",
    isPremium: false,
    thumbnail: "https://images.unsplash.com/photo-1464047736614-af63643285bf?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Wedding Elegant",
    category: "Wedding",
    isPremium: true,
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=100&h=100&fit=crop",
  },
];

const HomeAdmin: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: "",
    category: "",
    isPremium: false,
    thumbnail: "",
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  // Edit state
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [editTemplate, setEditTemplate] = useState<Partial<Template>>({
    name: "",
    category: "",
    isPremium: false,
    thumbnail: "",
  });
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string>("");

  // Stats dummy
  const stats = [
    { number: templates.length, label: "Total Templates" },
    { number: templates.filter(t => t.isPremium).length, label: "Premium" },
    { number: templates.filter(t => !t.isPremium).length, label: "Free" },
    { number: "5", label: "Categories" },
  ];

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name || !newTemplate.category || !newTemplate.thumbnail) return;
    setTemplates([
      ...templates,
      {
        id: Date.now().toString(),
        name: newTemplate.name!,
        category: newTemplate.category!,
        isPremium: !!newTemplate.isPremium,
        thumbnail: newTemplate.thumbnail!,
      },
    ]);
    setNewTemplate({ name: "", category: "", isPremium: false, thumbnail: "" });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  // Handle file upload and preview for add
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        setNewTemplate({ ...newTemplate, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload and preview for edit
  const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditThumbnailPreview(reader.result as string);
        setEditTemplate({ ...editTemplate, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Open edit form
  const handleEditClick = (template: Template) => {
    setEditTemplateId(template.id);
    setEditTemplate({ ...template });
    setEditThumbnailPreview(template.thumbnail);
  };

  // Save edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTemplate.name || !editTemplate.category || !editTemplate.thumbnail) return;
    setTemplates(templates.map(t =>
      t.id === editTemplateId
        ? {
            ...t,
            name: editTemplate.name!,
            category: editTemplate.category!,
            isPremium: !!editTemplate.isPremium,
            thumbnail: editTemplate.thumbnail!,
          }
        : t
    ));
    setEditTemplateId(null);
    setEditTemplate({ name: "", category: "", isPremium: false, thumbnail: "" });
    setEditThumbnailPreview("");
  };

  // Cancel edit
  const handleEditCancel = () => {
    setEditTemplateId(null);
    setEditTemplate({ name: "", category: "", isPremium: false, thumbnail: "" });
    setEditThumbnailPreview("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      {/* Header Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight text-white">
              Admin Dashboard
            </h1>
            <p className="text-lg md:text-xl mb-8 leading-relaxed text-white/80">
              Manage photo booth templates and frames for your application.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-4xl md:text-5xl font-bold text-[#FFD700] mb-2">
                  {stat.number}
                </h3>
                <p className="text-white text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Management Features Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            
          </motion.div>
          <div className="flex justify-end mb-6">
            <Button
              className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-secondary flex items-center gap-2"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-5 h-5" />
              Add Template
            </Button>
          </div>
          {/* Add Template Form */}
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleAddTemplate}
              className="mb-8 bg-white p-6 rounded-lg text-black shadow-lg max-w-xl mx-auto"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Thumbnail File</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border rounded"
                  onChange={handleThumbnailChange}
                  required
                />
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="mt-2 w-24 h-24 object-cover rounded border"
                  />
                )}
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!newTemplate.isPremium}
                  onChange={(e) => setNewTemplate({ ...newTemplate, isPremium: e.target.checked })}
                  id="isPremium"
                />
                <label htmlFor="isPremium" className="text-sm">Premium</label>
              </div>
              {/* Real-time preview of input */}
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <div className="font-semibold">Preview:</div>
                <div>Nama: <span className="font-bold">{newTemplate.name}</span></div>
                <div>Kategori: <span className="font-bold">{newTemplate.category}</span></div>
                <div>Status: <span className="font-bold">{newTemplate.isPremium ? "Premium" : "Free"}</span></div>
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="mt-2 w-16 h-16 object-cover rounded border"
                  />
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary">Save</Button>
                <Button type="button" variant="outline" className="px-4 py-2 rounded" onClick={() => { setShowAddForm(false); setThumbnailPreview(""); }}>Cancel</Button>
              </div>
            </motion.form>
          )}
          {/* Edit Template Form */}
          {editTemplateId && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleEditSubmit}
              className="mb-8 bg-white p-6 rounded-lg text-black shadow-lg max-w-xl mx-auto"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editTemplate.name}
                  onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editTemplate.category}
                  onChange={(e) => setEditTemplate({ ...editTemplate, category: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Thumbnail File</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border rounded"
                  onChange={handleEditThumbnailChange}
                />
                {editThumbnailPreview && (
                  <img
                    src={editThumbnailPreview}
                    alt="Thumbnail Preview"
                    className="mt-2 w-24 h-24 object-cover rounded border"
                  />
                )}
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!editTemplate.isPremium}
                  onChange={(e) => setEditTemplate({ ...editTemplate, isPremium: e.target.checked })}
                  id="editIsPremium"
                />
                <label htmlFor="editIsPremium" className="text-sm">Premium</label>
              </div>
              {/* Real-time preview of input */}
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <div className="font-semibold">Preview:</div>
                <div>Nama: <span className="font-bold">{editTemplate.name}</span></div>
                <div>Kategori: <span className="font-bold">{editTemplate.category}</span></div>
                <div>Status: <span className="font-bold">{editTemplate.isPremium ? "Premium" : "Free"}</span></div>
                {editThumbnailPreview && (
                  <img
                    src={editThumbnailPreview}
                    alt="Thumbnail Preview"
                    className="mt-2 w-16 h-16 object-cover rounded border"
                  />
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary">Save</Button>
                <Button type="button" variant="outline" className="px-4 py-2 rounded" onClick={handleEditCancel}>Cancel</Button>
              </div>
            </motion.form>
          )}
        </div>
      </section>

      {/* Template List Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-heading font-bold mb-4 text-white">
              All Templates
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all group overflow-hidden h-full">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4">
                      <img src={t.thumbnail} alt={t.name} className="w-16 h-16 object-cover rounded-lg border-2 border-primary/20" />
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-white mb-1">{t.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/90 text-white border-0">{t.category}</Badge>
                          {t.isPremium && (
                            <Badge className="bg-yellow-500 text-white border-0">
                              <Star className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 px-4 pb-4">
                      <Button
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => handleEditClick(t)}
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {templates.length === 0 && (
              <div className="col-span-full text-center text-white py-8">No templates available.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeAdmin;
