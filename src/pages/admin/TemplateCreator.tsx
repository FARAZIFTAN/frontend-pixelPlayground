import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Copy, 
  Eye, 
  Trash2,
  Grid3x3,
  Move,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Rectangle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TemplateData {
  name: string;
  category: string;
  description: string;
  frameCount: number;
  imageUrl: string;
  coordinates: Rectangle[];
}

const TemplateCreator = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  
  // Template Info
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("Artistic");
  const [description, setDescription] = useState("");
  const [frameCount, setFrameCount] = useState(3);
  
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [selectedRect, setSelectedRect] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const categories = ["Artistic", "Education", "Wedding", "Birthday", "Corporate", "Graduation"];

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        setImageUrl(event.target?.result as string);
        toast.success("Image uploaded successfully!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !uploadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image (PENTING!)
    canvas.width = uploadedImage.width;
    canvas.height = uploadedImage.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // CRITICAL: Draw the uploaded image first as background
    ctx.drawImage(uploadedImage, 0, 0, uploadedImage.width, uploadedImage.height);

    // Draw rectangles for photo areas on top of image
    rectangles.forEach((rect, index) => {
      const isSelected = index === selectedRect;
      
      // Draw semi-transparent fill - kotak merah transparan
      ctx.fillStyle = isSelected ? "rgba(198, 40, 40, 0.35)" : "rgba(255, 107, 107, 0.25)";
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      
      // Draw border - garis tepi kotak
      ctx.strokeStyle = isSelected ? "#C62828" : "#FF6B6B";
      ctx.lineWidth = isSelected ? 5 : 3;
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

      // Draw corner handles for selected rectangle
      if (isSelected) {
        const handleSize = 14;
        ctx.fillStyle = "#C62828";
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        
        const drawHandle = (x: number, y: number) => {
          ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        };
        
        // Draw 4 corner handles
        drawHandle(rect.x, rect.y); // Top-left
        drawHandle(rect.x + rect.width, rect.y); // Top-right
        drawHandle(rect.x, rect.y + rect.height); // Bottom-left
        drawHandle(rect.x + rect.width, rect.y + rect.height); // Bottom-right
      }

      // Draw label with background
      const labelText = `Photo ${index + 1}`;
      ctx.font = "bold 20px Arial";
      const textMetrics = ctx.measureText(labelText);
      const textWidth = textMetrics.width;
      const textHeight = 28;
      const padding = 10;
      
      // Label background with shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = isSelected ? "#C62828" : "#FF6B6B";
      ctx.fillRect(rect.x, rect.y - textHeight - padding, textWidth + padding * 2, textHeight + padding);
      
      // Reset shadow for text
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Label text
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(labelText, rect.x + padding, rect.y - padding - 6);
    });
  }, [uploadedImage, rectangles, selectedRect]);

  // Add new rectangle
  const addRectangle = () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (rectangles.length >= frameCount) {
      toast.error(`Maximum ${frameCount} photo frames`);
      return;
    }

    const newRect: Rectangle = {
      id: Date.now(),
      x: 100 + rectangles.length * 30,
      y: 80 + rectangles.length * 30,
      width: 400,
      height: 250,
    };

    setRectangles([...rectangles, newRect]);
    setSelectedRect(rectangles.length);
    toast.success(`Photo frame ${rectangles.length + 1} added`);
  };

  // Delete selected rectangle
  const deleteRectangle = () => {
    if (selectedRect === null) {
      toast.error("Please select a photo frame first");
      return;
    }

    setRectangles(rectangles.filter((_, index) => index !== selectedRect));
    setSelectedRect(null);
    toast.success("Photo frame deleted");
  };

  // Handle canvas mouse down
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicked on existing rectangle or its handles
    for (let i = rectangles.length - 1; i >= 0; i--) {
      const r = rectangles[i];
      const handleSize = 14;
      
      // Check corner handles first (for resize)
      if (i === selectedRect) {
        // Top-left handle
        if (Math.abs(x - r.x) < handleSize && Math.abs(y - r.y) < handleSize) {
          setSelectedRect(i);
          setIsResizing(true);
          setResizeHandle('top-left');
          setDragStart({ x, y });
          return;
        }
        // Top-right handle
        if (Math.abs(x - (r.x + r.width)) < handleSize && Math.abs(y - r.y) < handleSize) {
          setSelectedRect(i);
          setIsResizing(true);
          setResizeHandle('top-right');
          setDragStart({ x, y });
          return;
        }
        // Bottom-left handle
        if (Math.abs(x - r.x) < handleSize && Math.abs(y - (r.y + r.height)) < handleSize) {
          setSelectedRect(i);
          setIsResizing(true);
          setResizeHandle('bottom-left');
          setDragStart({ x, y });
          return;
        }
        // Bottom-right handle
        if (Math.abs(x - (r.x + r.width)) < handleSize && Math.abs(y - (r.y + r.height)) < handleSize) {
          setSelectedRect(i);
          setIsResizing(true);
          setResizeHandle('bottom-right');
          setDragStart({ x, y });
          return;
        }
      }
      
      // Check if clicked inside rectangle (for move)
      if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
        setSelectedRect(i);
        setIsDragging(true);
        setDragStart({ x: x - r.x, y: y - r.y });
        return;
      }
    }

    setSelectedRect(null);
  };

  // Handle canvas mouse move
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || selectedRect === null) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const newRectangles = [...rectangles];
    const currentRect = newRectangles[selectedRect];

    if (isResizing && resizeHandle) {
      // Handle resizing
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      switch (resizeHandle) {
        case 'top-left':
          newRectangles[selectedRect] = {
            ...currentRect,
            x: Math.max(0, currentRect.x + dx),
            y: Math.max(0, currentRect.y + dy),
            width: Math.max(50, currentRect.width - dx),
            height: Math.max(50, currentRect.height - dy),
          };
          break;
        case 'top-right':
          newRectangles[selectedRect] = {
            ...currentRect,
            y: Math.max(0, currentRect.y + dy),
            width: Math.max(50, currentRect.width + dx),
            height: Math.max(50, currentRect.height - dy),
          };
          break;
        case 'bottom-left':
          newRectangles[selectedRect] = {
            ...currentRect,
            x: Math.max(0, currentRect.x + dx),
            width: Math.max(50, currentRect.width - dx),
            height: Math.max(50, currentRect.height + dy),
          };
          break;
        case 'bottom-right':
          newRectangles[selectedRect] = {
            ...currentRect,
            width: Math.max(50, currentRect.width + dx),
            height: Math.max(50, currentRect.height + dy),
          };
          break;
      }
      
      setDragStart({ x, y });
    } else if (isDragging) {
      // Handle dragging
      newRectangles[selectedRect] = {
        ...currentRect,
        x: Math.max(0, Math.min(x - dragStart.x, canvas.width - currentRect.width)),
        y: Math.max(0, Math.min(y - dragStart.y, canvas.height - currentRect.height)),
      };
    }

    setRectangles(newRectangles);
  };

  // Handle canvas mouse up
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Update coordinate manually
  const updateCoordinate = (index: number, field: keyof Rectangle, value: number) => {
    const newRectangles = [...rectangles];
    newRectangles[index] = {
      ...newRectangles[index],
      [field]: Math.max(0, value),
    };
    setRectangles(newRectangles);
  };

  // Save template
  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Please enter template name");
      return;
    }

    if (!uploadedImage) {
      toast.error("Please upload an image");
      return;
    }

    if (rectangles.length !== frameCount) {
      toast.error(`Please add exactly ${frameCount} photo frames`);
      return;
    }

    const templateData: TemplateData = {
      name: templateName,
      category,
      description,
      frameCount,
      imageUrl,
      coordinates: rectangles,
    };

    // Save to localStorage for demo
    const existingTemplates = JSON.parse(localStorage.getItem("customTemplates") || "[]");
    existingTemplates.push({
      ...templateData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("customTemplates", JSON.stringify(existingTemplates));

    toast.success("Template saved successfully!");
    
    // Navigate back to templates page after 1 second
    setTimeout(() => {
      navigate("/admin/templates");
    }, 1000);
  };

  // Copy coordinates to clipboard
  const copyCoordinates = () => {
    const coordsText = rectangles
      .map((rect, index) => 
        `// Photo ${index + 1}\n{ x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height} }`
      )
      .join(",\n");

    navigator.clipboard.writeText(coordsText);
    toast.success("Coordinates copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Template Creator</h1>
          <p className="text-gray-300 mt-1">Create a new photo booth template</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/templates")}
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Template Info & Upload */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Information */}
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Template Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Graduation 2025"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-900">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-white placeholder-gray-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Photos *
                </label>
                <input
                  type="number"
                  value={frameCount}
                  onChange={(e) => setFrameCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 10 photos per template</p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Upload Template</h2>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-[#C62828] hover:bg-white/5 transition-all"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">
                  {uploadedImage ? "Change Image" : "Click to upload"}
                </p>
                <p className="text-sm text-gray-400">
                  PNG, JPG up to 5MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {uploadedImage && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-300">
                    Image size: {uploadedImage.width} × {uploadedImage.height}px
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Canvas */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Canvas Editor</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={addRectangle}
                    size="sm"
                    className="bg-[#C62828] hover:bg-[#E53935] text-white"
                  >
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Add Frame
                  </Button>
                  <Button
                    onClick={deleteRectangle}
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/20 text-white hover:bg-[#C62828]/20"
                    disabled={selectedRect === null}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    onClick={copyCoordinates}
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    disabled={rectangles.length === 0}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              {uploadedImage ? (
                <div className="space-y-3">
                  <div className="border-2 border-white/20 rounded-lg overflow-hidden bg-gray-900">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      className="w-full h-auto cursor-move"
                      style={{ maxHeight: "600px" }}
                    />
                  </div>
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#C62828]/20 to-purple-600/20 rounded-lg border border-[#C62828]/50">
                    <p className="text-sm text-white font-medium mb-2">
                      📍 <strong>Cara Menggunakan Canvas Editor:</strong>
                    </p>
                    <ul className="text-sm text-gray-300 space-y-1 ml-5 list-disc">
                      <li><strong>Klik "Add Frame"</strong> untuk menambah kotak foto merah semi-transparan</li>
                      <li><strong>Klik & Drag kotak merah</strong> untuk memindahkan posisi</li>
                      <li><strong>Drag sudut kotak (handle putih)</strong> untuk mengubah ukuran</li>
                      <li>Kotak merah menandai <strong>area dimana foto akan ditempatkan</strong></li>
                      <li>Posisikan kotak di atas area kosong/biru di template Anda</li>
                      {rectangles.length < frameCount && (
                        <li className="text-yellow-400 font-semibold">⚠️ Tambahkan {frameCount - rectangles.length} kotak lagi</li>
                      )}
                      {rectangles.length === frameCount && (
                        <li className="text-green-400 font-semibold">✅ Semua {frameCount} kotak sudah ditambahkan!</li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-96 border border-white/20 rounded-lg flex items-center justify-center bg-gray-900/50">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">Upload an image to start</p>
                    <p className="text-sm text-gray-600">Your template preview will appear here</p>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-gradient-to-r from-[#C62828]/20 to-purple-600/20 rounded-lg border border-[#C62828]/50">
                <p className="text-sm text-white font-medium mb-2">
                  📍 <strong>Cara Menggunakan Canvas Editor:</strong>
                </p>
                <ul className="text-sm text-gray-300 space-y-1 ml-5 list-disc">
                  <li><strong>Klik "Add Frame"</strong> untuk menambah kotak foto merah</li>
                  <li><strong>Klik & Drag kotak merah</strong> untuk memindahkan posisi</li>
                  <li>Kotak merah menandai <strong>area dimana foto akan ditempatkan</strong></li>
                  <li>Posisikan kotak di atas area biru/kosong yang ada di template</li>
                  {rectangles.length < frameCount && (
                    <li className="text-yellow-400">⚠️ Tambahkan {frameCount - rectangles.length} kotak lagi</li>
                  )}
                  {rectangles.length === frameCount && (
                    <li className="text-green-400">✅ Semua {frameCount} kotak sudah ditambahkan</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Coordinates List */}
          {rectangles.length > 0 && (
            <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10 mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Photo Frame Coordinates</h2>
                <div className="space-y-4">
                  {rectangles.map((rect, index) => (
                    <div
                      key={rect.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedRect === index
                          ? "bg-[#C62828]/20 border-[#C62828]"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => setSelectedRect(index)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">Photo Frame {index + 1}</h3>
                        {selectedRect === index && (
                          <span className="text-xs px-2 py-1 bg-[#C62828] text-white rounded">Selected</span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">X</label>
                          <input
                            type="number"
                            value={Math.round(rect.x)}
                            onChange={(e) => updateCoordinate(index, "x", parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Y</label>
                          <input
                            type="number"
                            value={Math.round(rect.y)}
                            onChange={(e) => updateCoordinate(index, "y", parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Width</label>
                          <input
                            type="number"
                            value={Math.round(rect.width)}
                            onChange={(e) => updateCoordinate(index, "width", parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Height</label>
                          <input
                            type="number"
                            value={Math.round(rect.height)}
                            onChange={(e) => updateCoordinate(index, "height", parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCreator;
