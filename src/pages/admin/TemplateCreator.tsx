import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Modal sederhana pengganti jika '@/components/ui/modal' tidak ada
type SimpleModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<SimpleModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
      onClick={onClose}
    >
      <div style={{ background: '#222', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 24, color: '#fff', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
        {children}
      </div>
    </div>
  );
};
import { Upload, Image as ImageIcon, Save } from "lucide-react";
import { templateAPI } from "@/services/api";

// Types
interface PhotoFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // derajat
  borderRadius?: number; // px
}

type FrameEditorProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  uploadedImage: HTMLImageElement;
  frames: PhotoFrame[];
  setFrames: React.Dispatch<React.SetStateAction<PhotoFrame[]>>;
};

const FrameEditor: React.FC<FrameEditorProps> = ({ canvasRef, uploadedImage, frames, setFrames }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Hitung skala agar canvas dan overlay proporsional
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, [uploadedImage.width, uploadedImage.height]);

  // Skala antara gambar asli dan tampilan
  const scale = Math.min(
    containerSize.width / uploadedImage.width || 1,
    containerSize.height / uploadedImage.height || 1,
    1
  );

  // Drag & resize state
  const [dragging, setDragging] = useState<
    | { idx: number; type: 'move' | 'resize'; startX: number; startY: number; startFrame: PhotoFrame }
    | null
  >(null);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, idx: number, type: 'move' | 'resize') => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    const mouseX = e.clientX - (rect?.left || 0);
    const mouseY = e.clientY - (rect?.top || 0);
    setDragging({
      idx,
      type,
      startX: mouseX / scale,
      startY: mouseY / scale,
      startFrame: { ...frames[idx] },
    });
  };

  React.useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setFrames(prev => prev.map((f, i) => {
        if (i !== dragging.idx) return f;
        if (dragging.type === 'move') {
          // Geser frame
          let newX = dragging.startFrame.x + (mouseX / scale - dragging.startX);
          let newY = dragging.startFrame.y + (mouseY / scale - dragging.startY);
          // Batas area
          newX = Math.max(0, Math.min(newX, uploadedImage.width - f.width));
          newY = Math.max(0, Math.min(newY, uploadedImage.height - f.height));
          return { ...f, x: Math.round(newX), y: Math.round(newY) };
        } else if (dragging.type === 'resize') {
          // Resize dari pojok kanan bawah
          let newW = Math.max(30, dragging.startFrame.width + (mouseX / scale - dragging.startX));
          let newH = Math.max(30, dragging.startFrame.height + (mouseY / scale - dragging.startY));
          // Batas area
          newW = Math.min(newW, uploadedImage.width - dragging.startFrame.x);
          newH = Math.min(newH, uploadedImage.height - dragging.startFrame.y);
          return { ...f, width: Math.round(newW), height: Math.round(newH) };
        }
        return f;
      }));
    };
    const handleMouseUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, scale, setFrames, uploadedImage.width, uploadedImage.height]);

  // Render
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: uploadedImage.width * scale, height: uploadedImage.height * scale, display: 'block' }}
      />
      {frames.map((frame, idx) => {
        const rotation = frame.rotation ?? 0;
        const borderRadius = frame.borderRadius ?? 0;
        const w = frame.width * scale;
        const h = frame.height * scale;
        const style: React.CSSProperties = {
          position: 'absolute',
          left: frame.x * scale + w / 2,
          top: frame.y * scale + h / 2,
          width: w,
          height: h,
          border: '2px solid #C62828',
          borderRadius: borderRadius * scale,
          background: 'rgba(198,40,40,0.08)',
          cursor: dragging && dragging.idx === idx ? (dragging.type === 'move' ? 'grabbing' : 'nwse-resize') : 'move',
          zIndex: 10,
          boxSizing: 'border-box',
          userSelect: 'none',
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          transition: dragging ? 'none' : 'box-shadow 0.1s',
          boxShadow: dragging && dragging.idx === idx ? '0 0 0 2px #fff' : undefined,
        };
        return (
          <div
            key={idx}
            style={style}
            onMouseDown={e => handleMouseDown(e, idx, 'move')}
          >
            {/* Resize handle pojok kanan bawah */}
            <div
              onMouseDown={e => handleMouseDown(e, idx, 'resize')}
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 16,
                height: 16,
                background: '#C62828',
                borderRadius: 4,
                cursor: 'nwse-resize',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="10" height="10"><polyline points="0,10 10,10 10,0" style={{ fill: 'none', stroke: 'white', strokeWidth: 2 }} /></svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Simple canvas preview for frames
function drawCanvasPreview(canvasRef: React.RefObject<HTMLCanvasElement>, uploadedImage: HTMLImageElement | null, frames: PhotoFrame[]) {
  if (!canvasRef.current || !uploadedImage) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = uploadedImage.width;
  canvas.height = uploadedImage.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(uploadedImage, 0, 0);
  frames.forEach((frame, index) => {
    ctx.save();
    // Rotasi
    const cx = frame.x + frame.width / 2;
    const cy = frame.y + frame.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(((frame.rotation ?? 0) * Math.PI) / 180);
    // Border radius
    const r = Math.min(frame.borderRadius ?? 0, Math.min(frame.width, frame.height) / 2);
    ctx.strokeStyle = '#C62828';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (r > 0) {
      // Rounded rect
      const w = frame.width, h = frame.height;
      ctx.moveTo(-w/2 + r, -h/2);
      ctx.lineTo(w/2 - r, -h/2);
      ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
      ctx.lineTo(w/2, h/2 - r);
      ctx.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
      ctx.lineTo(-w/2 + r, h/2);
      ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
      ctx.lineTo(-w/2, -h/2 + r);
      ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
    } else {
      // Normal rect
      ctx.rect(-frame.width/2, -frame.height/2, frame.width, frame.height);
    }
    ctx.closePath();
    ctx.stroke();
    // Label
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = '#C62828';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for text
    ctx.fillText(`Frame ${index + 1}`, frame.x + 4, frame.y + 4);
    ctx.restore();
  });
}

// Types
interface PhotoFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Fungsi auto arrange frame
function autoArrangeFrames(img: HTMLImageElement | null, count: number): PhotoFrame[] {
  if (!img) {
    // fallback default
    return Array.from({ length: count }, (_, i) => ({ x: 50, y: 50 + i * 220, width: 200, height: 300 }));
  }
  const margin = 32;
  const gap = 24;
  const maxW = img.width - margin * 2;
  const maxH = img.height - margin * 2;
  const isPortrait = img.height > img.width;

  if (count === 2) {
    if (isPortrait) {
      // 2 vertikal
      const h = Math.floor((maxH - gap) / 2);
      const w = Math.floor(maxW * 0.95);
      return [
        { x: margin + (maxW - w) / 2, y: margin, width: w, height: h },
        { x: margin + (maxW - w) / 2, y: margin + h + gap, width: w, height: h },
      ];
    } else {
      // 2 horizontal
      const w = Math.floor((maxW - gap) / 2);
      const h = Math.floor(maxH * 0.7);
      return [
        { x: margin, y: margin + (maxH - h) / 2, width: w, height: h },
        { x: margin + w + gap, y: margin + (maxH - h) / 2, width: w, height: h },
      ];
    }
  } else if (count === 3) {
    if (isPortrait) {
      // 3 vertikal
      const h = Math.floor((maxH - gap * 2) / 3);
      const w = Math.floor(maxW * 0.95);
      return [
        { x: margin + (maxW - w) / 2, y: margin, width: w, height: h },
        { x: margin + (maxW - w) / 2, y: margin + h + gap, width: w, height: h },
        { x: margin + (maxW - w) / 2, y: margin + (h + gap) * 2, width: w, height: h },
      ];
    } else {
      // 3 horizontal
      const w = Math.floor((maxW - gap * 2) / 3);
      const h = Math.floor(maxH * 0.7);
      return [
        { x: margin, y: margin + (maxH - h) / 2, width: w, height: h },
        { x: margin + w + gap, y: margin + (maxH - h) / 2, width: w, height: h },
        { x: margin + (w + gap) * 2, y: margin + (maxH - h) / 2, width: w, height: h },
      ];
    }
  } else if (count === 4) {
    // 2x2 grid
    const w = Math.floor((maxW - gap) / 2);
    const h = Math.floor((maxH - gap) / 2);
    return [
      { x: margin, y: margin, width: w, height: h },
      { x: margin + w + gap, y: margin, width: w, height: h },
      { x: margin, y: margin + h + gap, width: w, height: h },
      { x: margin + w + gap, y: margin + h + gap, width: w, height: h },
    ];
  }
  // fallback
  return Array.from({ length: count }, (_, i) => ({ x: 50, y: 50 + i * 220, width: 200, height: 300 }));
}

const TemplateCreator: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("Artistic");
  const [description, setDescription] = useState("");
  const [frameCount, setFrameCount] = useState(2);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [frames, setFrames] = useState<PhotoFrame[]>([
    { x: 50, y: 50, width: 200, height: 150 },
    { x: 300, y: 50, width: 200, height: 150 },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Auto arrange frames when frameCount or uploadedImage changes
  React.useEffect(() => {
    if (uploadedImage) {
      setFrames(autoArrangeFrames(uploadedImage, frameCount));
    } else {
      setFrames(Array.from({ length: frameCount }, (_, i) => ({ x: 50 + i * 220, y: 50, width: 200, height: 150 })));
    }
    // eslint-disable-next-line
  }, [frameCount, uploadedImage]);

  // Draw preview (main form)
  React.useEffect(() => {
    drawCanvasPreview(canvasRef, uploadedImage, frames);
  }, [uploadedImage, frames]);

  // Draw preview (modal)
  React.useEffect(() => {
    if (showPreview && previewCanvasRef.current && uploadedImage) {
      drawCanvasPreview(previewCanvasRef, uploadedImage, frames);
    }
    // eslint-disable-next-line
  }, [showPreview, uploadedImage, frames]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        const img = new window.Image();
        img.onload = () => {
          setUploadedImage(img);
          setImageUrl(result);
          toast.success("Image uploaded!");
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle save
  const handleSave = async () => {
    // Validasi input wajib
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!uploadedImage) {
      toast.error("Please upload a template image");
      return;
    }
    if (frames.length !== frameCount) {
      toast.error(`Must have exactly ${frameCount} frames`);
      return;
    }
    // Validasi setiap frame
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      if (f.width <= 0 || f.height <= 0) {
        toast.error(`Frame ${i + 1}: width/height must be > 0`);
        return;
      }
      if (typeof f.rotation === 'number' && (f.rotation < 0 || f.rotation > 359)) {
        toast.error(`Frame ${i + 1}: rotation must be 0-359`);
        return;
      }
      const maxRadius = Math.floor(Math.min(f.width, f.height) / 2);
      if (typeof f.borderRadius === 'number' && (f.borderRadius < 0 || f.borderRadius > maxRadius)) {
        toast.error(`Frame ${i + 1}: border radius must be 0-${maxRadius}`);
        return;
      }
    }
    setIsSaving(true);
    try {
      // Pastikan setiap frame punya rotation dan borderRadius default
      const framesWithDefaults = frames.map(f => ({
        ...f,
        rotation: typeof f.rotation === 'number' ? f.rotation : 0,
        borderRadius: typeof f.borderRadius === 'number' ? f.borderRadius : 0,
      }));
      const templateData = {
        name: templateName,
        category,
        description,
        frameCount,
        layoutPositions: framesWithDefaults,
        frameUrl: imageUrl,
        thumbnail: imageUrl,
      };
      await templateAPI.createTemplate(templateData);
      toast.success("Template created!");
      navigate("/admin/templates");
    } catch (err: any) {
      if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create template");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ["Artistic", "Education", "Wedding", "Birthday", "Corporate", "Graduation"];

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Create Template</h1>
      <Card className="mb-8">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Template Name *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
                  placeholder="e.g. Wedding Portrait"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Number of Photos *</label>
                <select
                  value={frameCount}
                  onChange={e => setFrameCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
                >
                  <option value={2}>2 Photos</option>
                  <option value={3}>3 Photos</option>
                  <option value={4}>4 Photos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Template Image *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer hover:border-[#C62828] hover:bg-white/10"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-white font-semibold text-base mb-1">
                    {uploadedImage ? "Change Image" : "Upload Template"}
                  </p>
                  <p className="text-xs text-gray-400">PNG/JPG • Max 5MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadedImage && (
                  <div className="mt-2 text-xs text-gray-400">Image size: {uploadedImage.width} × {uploadedImage.height}px</div>
                )}
              </div>
            </div>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Frame Area Preview</label>
                <div
                  className="border border-white/20 rounded bg-gray-900 flex items-center justify-center relative"
                  style={{ minHeight: 320, minWidth: 200 }}
                >
                  {uploadedImage ? (
                    <FrameEditor
                      canvasRef={canvasRef}
                      uploadedImage={uploadedImage}
                      frames={frames}
                      setFrames={setFrames}
                    />
                  ) : (
                    <div className="text-center py-10">
                      <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">Upload a template image to preview</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Frame Coordinates</label>
                {frames.map((frame, idx) => (
                  <div key={idx} className="mb-2 flex flex-wrap gap-2 items-center bg-white/5 p-2 rounded">
                    <span className="text-white text-xs font-bold mr-2">Frame {idx + 1}</span>
                    <input
                      type="number"
                      value={frame.x}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setFrames(frames.map((f, i) => i === idx ? { ...f, x: val } : f));
                      }}
                      className="w-16 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs"
                      placeholder="X"
                    />
                    <input
                      type="number"
                      value={frame.y}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setFrames(frames.map((f, i) => i === idx ? { ...f, y: val } : f));
                      }}
                      className="w-16 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs"
                      placeholder="Y"
                    />
                    <input
                      type="number"
                      value={frame.width}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 100;
                        setFrames(frames.map((f, i) => i === idx ? { ...f, width: val } : f));
                      }}
                      className="w-16 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs"
                      placeholder="Width"
                    />
                    <input
                      type="number"
                      value={frame.height}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 100;
                        setFrames(frames.map((f, i) => i === idx ? { ...f, height: val } : f));
                      }}
                      className="w-16 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs"
                      placeholder="Height"
                    />
                    <input
                      type="number"
                      value={frame.rotation ?? 0}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setFrames(frames.map((f, i) => i === idx ? { ...f, rotation: val } : f));
                      }}
                      className="w-20 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs"
                      placeholder="Rotation (°)"
                      min={0}
                      max={359}
                    />
                    <input
                      type="number"
                      value={frame.borderRadius ?? 0}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setFrames(frames.map((f, i) => i === idx ? { ...f, borderRadius: val } : f));
                      }}
                      className="w-24 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs"
                      placeholder="Border Radius (px)"
                      min={0}
                      max={200}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/templates")}
              className="bg-gradient-to-r from-gray-700/60 to-gray-900/80 border-white/20 text-white px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!uploadedImage}
              className="bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold px-8 py-2 text-lg"
            >
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#C62828] to-[#E53935] text-white font-bold px-8 py-2 text-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="bg-white/10 rounded p-4 text-white text-sm">
        <b>Instructions:</b> Isi nama, kategori, deskripsi, jumlah foto, upload gambar template, lalu atur koordinat frame secara manual (atau otomatis). Klik Preview untuk melihat hasil, lalu Save Template untuk menyimpan.
      </div>

      {/* Modal Preview */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)}>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-white mb-4">Preview Template</h2>
          {uploadedImage && (
            <canvas
              ref={previewCanvasRef}
              width={uploadedImage.width}
              height={uploadedImage.height}
              style={{ maxWidth: 400, maxHeight: 600, borderRadius: 12, border: '2px solid #C62828', background: '#222' }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TemplateCreator;

