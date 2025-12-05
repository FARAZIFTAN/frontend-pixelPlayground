import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Smile, RotateCcw, ArrowLeft, Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";

// Filter and Sticker interfaces
interface FilterSettings {
  name: string;
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  grayscale: number;
  hueRotate: number;
}

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

interface LocationState {
  capturedImages: string[];
  selectedTemplate: Template;
  sessionId: string;
  uploadedPhotoIds: string[];
}

// Filter presets
const FILTER_PRESETS: Record<string, FilterSettings> = {
  none: { name: "None", brightness: 100, contrast: 100, saturate: 100, sepia: 0, grayscale: 0, hueRotate: 0 },
  grayscale: { name: "Grayscale", brightness: 100, contrast: 100, saturate: 0, sepia: 0, grayscale: 100, hueRotate: 0 },
  sepia: { name: "Sepia", brightness: 100, contrast: 100, saturate: 100, sepia: 100, grayscale: 0, hueRotate: 0 },
  vintage: { name: "Vintage", brightness: 110, contrast: 90, saturate: 80, sepia: 30, grayscale: 0, hueRotate: 10 },
  bright: { name: "Bright", brightness: 130, contrast: 110, saturate: 120, sepia: 0, grayscale: 0, hueRotate: 0 },
};

// Sticker categories
const STICKER_CATEGORIES = {
  emoji: {
    name: "Emoji",
    stickers: ["😀", "😂", "❤️", "🎉", "🔥", "⭐", "👍", "✨", "🎈", "🎊", "💯", "🚀"],
  },
  decorative: {
    name: "Decorative",
    stickers: ["✓", "❋", "✦", "❖", "◈", "❉", "✻", "✼", "❇️", "✵", "✶", "✷"],
  },
  flowers: {
    name: "Flowers",
    stickers: ["🌸", "🌼", "🌻", "🌷", "🌹", "🥀", "🌺", "🏵️", "💐", "🌿", "🍀", "🌱"],
  },
};

const PhotoEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;

  const [capturedImages] = useState<string[]>(state?.capturedImages || []);
  const [selectedTemplate] = useState<Template>(state?.selectedTemplate);
  const [globalFilter, setGlobalFilter] = useState<FilterSettings>(FILTER_PRESETS.none);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<keyof typeof STICKER_CATEGORIES>("emoji");
  const [compositePreview, setCompositePreview] = useState<string>("");
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // If no data passed, redirect back
  useEffect(() => {
    if (!state?.capturedImages || !state?.selectedTemplate) {
      console.log("No state found, redirecting...", { state });
      navigate(-1);
    }
  }, [state, navigate]);

  // Generate composite with filtered photos (filters only apply to photos, not template)
  const generateComposite = useCallback((photos: string[], filter: FilterSettings) => {
    return new Promise<string>((resolve) => {
      const canvas = compositeCanvasRef.current;
      if (!canvas || !selectedTemplate || photos.length === 0) {
        console.log("generateComposite: missing required data", {
          canvas: !!canvas,
          selectedTemplate: !!selectedTemplate,
          photosLength: photos.length,
        });
        resolve("");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Could not get 2D context");
        resolve("");
        return;
      }

      // Draw template background (NO FILTER APPLIED) - load first to get dimensions
      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";

      // Define processPhotos function FIRST so it can be called from multiple places
      const processPhotos = () => {
        const layoutPositions = selectedTemplate?.layoutPositions || [];
        const numPhotosToProcess = Math.min(photos.length, Math.max(layoutPositions.length, photos.length));
        let loadedCount = 0;
        let resolved = false;

        console.log("Processing photos", { numPhotosToProcess, totalPhotos: photos.length, layoutPositions: layoutPositions.length });

        const tryResolve = () => {
          if (!resolved && loadedCount === numPhotosToProcess) {
            resolved = true;
            console.log("All photos loaded, resolving composite");
            resolve(canvas.toDataURL("image/png"));
          }
        };

        if (numPhotosToProcess === 0) {
          console.log("No photos to process");
          resolve(canvas.toDataURL("image/png"));
          return;
        }

        photos.forEach((photoSrc, idx) => {
          if (layoutPositions.length > 0 && idx >= layoutPositions.length) return;

          const img = new Image();
          img.crossOrigin = "anonymous";

          img.onload = () => {
            // Use template position if available, otherwise arrange photos vertically
            let pos: { x: number; y: number; width: number; height: number };
            
            if (layoutPositions.length > idx) {
              pos = layoutPositions[idx];
            } else {
              // Fallback: arrange photos vertically
              const photoHeight = Math.floor((canvas.height / numPhotosToProcess));
              pos = {
                x: 0,
                y: idx * photoHeight,
                width: canvas.width,
                height: photoHeight,
              };
            }

            // Create temporary canvas for filtered image
            const tempCanvas = document.createElement("canvas");
            const tempCtx = tempCanvas.getContext("2d");
            if (!tempCtx) {
              console.warn("Could not get 2D context for temp canvas");
              loadedCount++;
              tryResolve();
              return;
            }

            tempCanvas.width = pos.width;
            tempCanvas.height = pos.height;

            // Apply filter ONLY to photo
            const filterString = `brightness(${filter.brightness}%) contrast(${filter.contrast}%) saturate(${filter.saturate}%) sepia(${filter.sepia}%) grayscale(${filter.grayscale}%) hue-rotate(${filter.hueRotate}deg)`;
            tempCtx.filter = filterString;
            tempCtx.drawImage(img, 0, 0, pos.width, pos.height);

            // Draw filtered photo on main canvas at template position
            ctx.drawImage(tempCanvas, pos.x, pos.y);

            loadedCount++;
            console.log(`Photo ${idx} loaded and drawn`, { pos });
            tryResolve();
          };

          img.onerror = () => {
            console.error(`Failed to load photo ${idx} from:`, photoSrc);
            loadedCount++;
            tryResolve();
          };

          img.src = photoSrc;
        });
      };

      templateImg.onload = () => {
        // Set canvas size from template image
        const templateWidth = templateImg.naturalWidth || 600;
        const templateHeight = templateImg.naturalHeight || 800;
        
        canvas.width = templateWidth;
        canvas.height = templateHeight;
        
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
        console.log("Template loaded and drawn", { templateWidth, templateHeight });
        processPhotos();
      };

      templateImg.onerror = () => {
        console.error("Failed to load template image from:", selectedTemplate.frameUrl);
        // Default size if template fails to load
        canvas.width = 600;
        canvas.height = Math.max(400 * capturedImages.length, 800);
        // Fill with white background if no template
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        processPhotos();
      };

      // Load template if frameUrl exists, otherwise skip to processPhotos
      if (selectedTemplate.frameUrl && selectedTemplate.frameUrl.trim()) {
        templateImg.src = selectedTemplate.frameUrl;
      } else {
        console.log("No template frameUrl, using default background");
        canvas.width = 600;
        canvas.height = Math.max(400 * capturedImages.length, 800);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        processPhotos();
      }
    });
  }, [selectedTemplate, capturedImages]);

  // Apply filter and update preview
  const applyFilterToPreview = async (filter: FilterSettings) => {
    setGlobalFilter(filter);
    const newComposite = await generateComposite(capturedImages, filter);
    setCompositePreview(newComposite);
  };

  // Initialize preview on mount
  useEffect(() => {
    console.log("PhotoEditor mounted. State:", {
      capturedImages: capturedImages.length,
      selectedTemplate: selectedTemplate?._id,
      state: state,
    });

    if (capturedImages.length > 0 && selectedTemplate) {
      console.log("Generating initial composite...");
      
      // Add timeout safeguard - resolve after 5 seconds anyway
      const timeoutId = setTimeout(() => {
        console.warn("Composite generation timeout - setting fallback");
        // If not resolved yet, try with empty template
        generateComposite(capturedImages, FILTER_PRESETS.none).then((result) => {
          if (result) {
            setCompositePreview(result);
          }
        });
      }, 5000);
      
      generateComposite(capturedImages, FILTER_PRESETS.none).then((result) => {
        clearTimeout(timeoutId);
        console.log("Composite generated, setting preview");
        if (result) {
          setCompositePreview(result);
        } else {
          console.warn("Generated composite is empty");
        }
      });
    } else {
      console.error("Missing data for composite", {
        capturedImages: capturedImages.length,
        selectedTemplate: !!selectedTemplate,
      });
    }
  }, [capturedImages, selectedTemplate, generateComposite, state]);

  const handleDownload = () => {
    if (!compositePreview) return;
    const link = document.createElement("a");
    link.href = compositePreview;
    link.download = `photo-strip-${new Date().getTime()}.png`;
    link.click();
    toast({ title: "Success", description: "Photo downloaded! 📥" });
  };

  const handleShare = async () => {
    try {
      if (navigator.share && compositePreview) {
        await navigator.share({
          title: "My Photo Strip",
          text: "Check out my awesome photo strip!",
          files: [
            new File([await (await fetch(compositePreview)).blob()], "photo-strip.png", {
              type: "image/png",
            }),
          ],
        });
      } else {
        // Fallback: copy to clipboard
        if (compositePreview) {
          await navigator.clipboard.writeText(compositePreview);
          toast({ title: "Success", description: "Image copied to clipboard! 📋" });
        }
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  if (!compositePreview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Generating preview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-primary hover:bg-secondary mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          <h1 className="text-4xl font-bold text-white">Edit Your Photo Strip</h1>
          <p className="text-muted-foreground mt-2">Customize filters - template stays original</p>
        </div>

        {/* Main Editor Layout */}
        <div className="flex gap-8">
          {/* LEFT - Preview */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl overflow-hidden border-2 border-border p-4"
            >
              <img
                src={compositePreview}
                alt="Preview"
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 text-sm text-muted-foreground">
                Current Filter: <span className="text-foreground font-semibold">{globalFilter.name}</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT - Controls */}
          <div className="w-96">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Filters Section */}
              <div className="bg-card rounded-2xl border-2 border-border p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles size={20} />
                  Filters
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(FILTER_PRESETS).map((filter) => (
                    <motion.button
                      key={filter.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => applyFilterToPreview(filter)}
                      className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                        globalFilter.name === filter.name
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-secondary hover:bg-accent text-foreground border border-border"
                      }`}
                    >
                      {filter.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Stickers Section */}
              <div className="bg-card rounded-2xl border-2 border-border p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Smile size={20} />
                  Stickers
                </h3>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-4 border-b border-border pb-3">
                  {Object.entries(STICKER_CATEGORIES).map(([key, category]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStickerCategory(key as keyof typeof STICKER_CATEGORIES)}
                      className={`px-4 py-2 font-semibold text-sm rounded-lg transition-all ${
                        selectedStickerCategory === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>

                {/* Sticker Grid */}
                <div className="grid grid-cols-4 gap-3 bg-secondary/50 p-3 rounded-lg max-h-48 overflow-y-auto">
                  {STICKER_CATEGORIES[selectedStickerCategory].stickers.map((sticker, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => console.log("Sticker selected:", sticker)}
                      className="p-2 rounded-lg bg-background hover:bg-primary/20 transition-colors text-2xl flex items-center justify-center border border-border hover:border-primary"
                    >
                      {sticker}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 font-semibold flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  className="w-full bg-accent hover:bg-accent/80 text-accent-foreground py-6 font-semibold flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for compositing */}
      <canvas ref={compositeCanvasRef} className="hidden" />
    </div>
  );
};

export default PhotoEditor;
