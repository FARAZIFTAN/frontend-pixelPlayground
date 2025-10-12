import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const Gallery = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = ["All", "3 Photos", "4 Photos", "6 Photos", "Popular", "Newest"];

  const templates = [
    { id: 1, name: "Birthday Celebration", category: "4 Photos", thumbnail: "🎂", popular: true },
    { id: 2, name: "Wedding Elegance", category: "6 Photos", thumbnail: "💐", popular: true },
    { id: 3, name: "Summer Vibes", category: "3 Photos", thumbnail: "🌴", popular: false },
    { id: 4, name: "Corporate Event", category: "4 Photos", thumbnail: "💼", popular: false },
    { id: 5, name: "Baby Shower", category: "6 Photos", thumbnail: "🍼", popular: true },
    { id: 6, name: "Graduation Day", category: "3 Photos", thumbnail: "🎓", popular: false },
    { id: 7, name: "Holiday Special", category: "4 Photos", thumbnail: "🎄", popular: true },
    { id: 8, name: "Valentine's Love", category: "6 Photos", thumbnail: "💕", popular: false },
    { id: 9, name: "New Year Party", category: "3 Photos", thumbnail: "🎉", popular: true },
  ];

  const filteredTemplates = templates.filter((template) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "popular") return template.popular;
    if (selectedFilter === "newest") return template.id > 6;
    return template.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
            Template Gallery
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our collection of beautiful photo booth templates
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <Button
                key={filter}
                onClick={() => setSelectedFilter(filter.toLowerCase())}
                variant={selectedFilter === filter.toLowerCase() ? "default" : "outline"}
                className={`rounded-full transition-all ${
                  selectedFilter === filter.toLowerCase()
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "hover:bg-accent"
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Template Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all group overflow-hidden h-full">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-accent to-secondary flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <span className="text-8xl">{template.thumbnail}</span>
                    {template.popular && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Popular
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start p-6 gap-3">
                  <div className="w-full">
                    <h3 className="font-heading font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.category}</p>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-soft group-hover:shadow-hover transition-all">
                    <Image className="w-4 h-4 mr-2" />
                    Use This Template
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Image className="w-24 h-24 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-heading font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">Try selecting a different filter</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
