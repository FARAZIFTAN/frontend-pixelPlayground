import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const samplePhotos = new Array(8).fill(null).map((_, i) => ({
  id: `sample-${i}`,
  title: `Photo ${i + 1}`,
}));

const MyGallery = () => {
  const [photos] = useState(samplePhotos);

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
            <Button className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-full px-5 py-2 shadow-soft flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/5">
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {photos.map((p) => (
            <div key={p.id} className="rounded-lg overflow-hidden bg-secondary border border-border shadow-soft hover:shadow-hover transition-all">
              <div className="aspect-[3/4] bg-gradient-to-tr from-black/20 via-black/10 to-black/5 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="w-40 h-40 rounded-md bg-white/5 flex items-center justify-center mb-3">
                    <Image className="w-12 h-12 text-white/70" />
                  </div>
                  <p className="text-sm text-white font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">No description</p>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">Taken recently</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="text-white hover:bg-white/5 px-2 py-1">View</Button>
                  <Button variant="ghost" className="text-white hover:bg-white/5 px-2 py-1">Share</Button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {photos.length === 0 && (
          <div className="text-center py-20">
            <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-heading font-semibold text-white">No photos yet</h3>
            <p className="text-muted-foreground mt-2">Upload your first photo to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGallery;
