import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Sparkles, ImagePlus, Download, Layout, MessageSquare, Zap, Send, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { aiAPI, userFrameAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import PremiumModal from '@/components/PremiumModal';
import { toast } from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIFrameSpec {
  frameCount: number;
  layout: 'vertical' | 'horizontal' | 'grid';
  backgroundColor: string;
  borderColor: string;
  gradientFrom?: string;
  gradientTo?: string;
}

interface ChatAIResponse {
  message: string;
  frameSpec?: AIFrameSpec;
}
// Konversi nama warna Indonesia/Inggris ke hex color
const colorNameToHex = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    // Warna Indonesia
    'merah': '#FF0000',
    'kuning': '#FFFF00',
    'biru': '#0000FF',
    'hijau': '#00FF00',
    'putih': '#FFFFFF',
    'hitam': '#000000',
    'pink': '#FF69B4',
    'ungu': '#800080',
    'orange': '#FFA500',
    'oranye': '#FFA500',
    'coklat': '#8B4513',
    'abu': '#808080',
    'abu-abu': '#808080',
    'emas': '#FFD700',
    'perak': '#C0C0C0',
    
    // Warna Inggris
    'red': '#FF0000',
    'yellow': '#FFFF00',
    'blue': '#0000FF',
    'green': '#00FF00',
    'white': '#FFFFFF',
    'black': '#000000',
    'purple': '#800080',
    'orange': '#FFA500',
    'brown': '#8B4513',
    'gray': '#808080',
    'grey': '#808080',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
  };

  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || '#FFFFFF';
};

// Validasi dan konversi hex color
const ensureHexColor = (color: string): string => {
  // Jika sudah format hex yang valid
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return color;
  }
  
  // Jika format hex tanpa #
  if (/^[0-9A-Fa-f]{6}$/.test(color)) {
    return `#${color}`;
  }
  
  // Jika nama warna, konversi ke hex
  return colorNameToHex(color);
};
// Type guard for AIFrameSpec
const isValidFrameSpec = (spec: unknown): spec is AIFrameSpec => {
  if (!spec || typeof spec !== 'object') return false;
  const s = spec as Partial<AIFrameSpec>;
  return (
    typeof s.frameCount === 'number' &&
    s.frameCount >= 2 &&
    s.frameCount <= 4 &&
    (s.layout === 'vertical' || s.layout === 'horizontal' || s.layout === 'grid') &&
    typeof s.backgroundColor === 'string' &&
    typeof s.borderColor === 'string'
  );
}

interface ChatAIResponse {
  message: string;
  frameSpec?: AIFrameSpec;
}

const AITemplateCreator = () => {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [modalClosedManually, setModalClosedManually] = useState(false);

  // Check premium status on mount
  useEffect(() => {
    if (user) {
      // Hanya tampilkan modal jika user TIDAK premium
      if (!isPremium) {
        setShowPremiumModal(true);
      } else {
        // User adalah premium, tutup modal dan reset flag
        setShowPremiumModal(false);
        setModalClosedManually(false);
      }
    }
  }, [user, isPremium]);

  // Redirect logic terpisah - hanya redirect jika modal ditutup manual tanpa upgrade
  useEffect(() => {
    if (modalClosedManually && !showPremiumModal && user && !isPremium) {
      // Modal ditutup manual tapi user belum premium, redirect
      navigate("/");
    }
  }, [modalClosedManually, showPremiumModal, user, isPremium, navigate]);

  // Handler untuk close modal - hanya set flag, redirect dihandle useEffect
  const handleCloseModal = () => {
    setModalClosedManually(true);
    setShowPremiumModal(false);
  };

  // Form states - 1x process
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [frameSpec, setFrameSpec] = useState<AIFrameSpec | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [frameName, setFrameName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();



  // Generate template dari deskripsi user
  const handleGenerateTemplate = async () => {
    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Mohon masukkan deskripsi template Anda',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setFrameSpec(null);
    setGeneratedImage(null);

    try {
      // Parse dari deskripsi user untuk mendapatkan frame spec
      const promptIndonesia = `Parse deskripsi berikut dan buat spesifikasi frame foto JSON:
Deskripsi: "${description}"

IMPORTANT: Berikan response dalam format JSON dengan fields berikut. Semua warna HARUS dalam format HEX COLOR (contoh: #FF0000 untuk merah, #FFFF00 untuk kuning):

- frameCount (number: 2, 3, 4, atau 6)
- layout (string: "vertical" atau "horizontal" atau "grid")
- backgroundColor (string: HEX COLOR format #RRGGBB, contoh: #FF69B4)
- borderColor (string: HEX COLOR format #RRGGBB, contoh: #FFD700)
- gradientFrom (optional string: HEX COLOR untuk gradient start)
- gradientTo (optional string: HEX COLOR untuk gradient end)

Jika user menyebutkan nama warna, konversi ke hex:
- merah → #FF0000
- kuning → #FFFF00
- biru → #0000FF
- pink → #FF69B4
- ungu → #800080
- hijau → #00FF00
- orange → #FFA500

Untuk gradasi, gunakan gradientFrom dan gradientTo dengan warna yang sesuai.
Buatkan desain yang menarik dan modern sesuai deskripsi user.`;

      const messages: Message[] = [
        {
          role: 'user',
          content: promptIndonesia
        }
      ];

      const chatResponse = await aiAPI.chatAI(messages) as ChatAIResponse;
      const spec = chatResponse?.frameSpec;

      if (!spec || !isValidFrameSpec(spec)) {
        throw new Error('Gagal generate spesifikasi frame dari AI');
      }

      setFrameSpec(spec);

      // Step 2: Konversi warna ke hex dan generate visual frame
      const backgroundColor = ensureHexColor(spec.backgroundColor || '#FFFFFF');
      const borderColor = ensureHexColor(spec.borderColor || '#000000');
      const gradientFrom = spec.gradientFrom ? ensureHexColor(spec.gradientFrom) : backgroundColor;
      const gradientTo = spec.gradientTo ? ensureHexColor(spec.gradientTo) : backgroundColor;

      const requestBody = {
        frameCount: spec.frameCount,
        layout: spec.layout,
        backgroundColor,
        borderColor,
        gradientFrom,
        gradientTo,
        borderThickness: 2,
        borderRadius: 8,
      };

      console.log('Sending frame request:', requestBody);

      const imageResponse = await aiAPI.generateFrame(requestBody);

      console.log('Frame response:', imageResponse);

      if (imageResponse.success && imageResponse.image) {
        let base64Image = imageResponse.image;
        
        // Ensure proper data URI format for SVG
        if (!base64Image.startsWith('data:')) {
          // Check if it's SVG by trying to decode
          try {
            const decoded = atob(base64Image);
            if (decoded.includes('<svg')) {
              base64Image = `data:image/svg+xml;base64,${base64Image}`;
            } else {
              base64Image = `data:image/png;base64,${base64Image}`;
            }
          } catch (e) {
            console.error('Failed to decode base64:', e);
            base64Image = `data:image/svg+xml;base64,${base64Image}`;
          }
        }
        
        console.log('✅ Base64 image with proper prefix:', base64Image.substring(0, 50) + '...');
        
        setGeneratedImage(base64Image);
        
        toast({
          title: '✨ Template Berhasil Dibuat!',
          description: 'Template frame Anda sudah siap digunakan',
        });
      } else {
        throw new Error(imageResponse.error || 'Gagal generate gambar frame');
      }
    } catch (error) {
      console.error('Generate template error:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat template. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle generate click from button
  const handleGenerateClick = () => {
    if (!description.trim()) {
      toast({
        title: 'Deskripsi Kosong',
        description: 'Mohon tulis deskripsi frame terlebih dahulu',
        variant: 'destructive'
      });
      return;
    }
    
    handleGenerateTemplate();
  };

  // Handle save template to database
  const handleSaveTemplate = async () => {
    if (!frameSpec || !generatedImage) {
      toast({
        title: 'Error',
        description: 'Frame belum dibuat. Generate frame terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }

    if (!frameName.trim()) {
      toast({
        title: 'Nama Frame Kosong',
        description: 'Mohon isi nama frame terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Load generated frame to get actual dimensions
      const frameImg = document.createElement('img');
      frameImg.crossOrigin = "anonymous";
      
      const actualDimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        frameImg.onload = () => {
          console.log(`📐 Frame image loaded - naturalWidth: ${frameImg.naturalWidth}, naturalHeight: ${frameImg.naturalHeight}, width: ${frameImg.width}, height: ${frameImg.height}`);
          const w = frameImg.naturalWidth || frameImg.width;
          const h = frameImg.naturalHeight || frameImg.height;
          console.log(`📐 Using dimensions: ${w}x${h}`);
          resolve({ width: w, height: h });
        };
        frameImg.onerror = (err) => {
          console.error('Failed to load frame image:', err);
          reject(new Error('Failed to load frame'));
        };
        frameImg.src = generatedImage;
        console.log(`🖼️ Starting to load frame from: ${generatedImage?.substring(0, 50)}...`);
      });

      console.log(`✅ Frame dimensions resolved: ${actualDimensions.width}x${actualDimensions.height}`);

      // Generate layout positions based on ACTUAL frame dimensions
      const layoutPositions = generateLayoutPositionsWithActualSize(
        frameSpec.frameCount,
        frameSpec.layout,
        actualDimensions.width,
        actualDimensions.height
      );

      // Prepare frame data for user-generated frames (private)
      const userFrameData = {
        name: frameName.trim(),
        description: description.trim() || `Custom ${frameSpec.layout} frame with ${frameSpec.frameCount} photos`,
        frameUrl: generatedImage, // base64 SVG data
        thumbnail: generatedImage, // same as frameUrl for now
        frameCount: frameSpec.frameCount,
        layoutPositions: layoutPositions,
        frameSpec: frameSpec,
      };

      console.log('💾 Saving custom frame to user frames:', userFrameData);

      // Save to user-generated frames (always private)
      const result = await userFrameAPI.create(userFrameData);

      console.log('✅ Custom frame saved:', result);

      toast({
        title: '✅ Frame Tersimpan!',
        description: `Frame "${frameName}" berhasil disimpan. Hanya Anda yang bisa melihat frame ini.`,
      });

      // Reset form after successful save
      setFrameName('');
      setDescription('');
      setGeneratedImage(null);
      setFrameSpec(null);

    } catch (error) {
      console.error('Save template error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyimpan template',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to generate layout positions based on frame count and layout type
  const generateLayoutPositions = (frameCount: number, layout: string) => {
    const positions = [];
    const frameWidth = 400;
    const frameHeight = 600;
    const padding = 20;
    const photoWidth = (frameWidth - padding * 2) / (layout === 'horizontal' ? frameCount : 1);
    const photoHeight = (frameHeight - padding * 2) / (layout === 'vertical' ? frameCount : 1);

    if (layout === 'vertical') {
      for (let i = 0; i < frameCount; i++) {
        positions.push({
          x: padding,
          y: padding + i * photoHeight,
          width: photoWidth,
          height: photoHeight,
          borderRadius: 8,
          rotation: 0,
        });
      }
    } else if (layout === 'horizontal') {
      for (let i = 0; i < frameCount; i++) {
        positions.push({
          x: padding + i * photoWidth,
          y: padding,
          width: photoWidth,
          height: photoHeight,
          borderRadius: 8,
          rotation: 0,
        });
      }
    } else if (layout === 'grid') {
      // 2x2 or 3x2 grid layout
      const cols = frameCount === 4 ? 2 : 3;
      const rows = Math.ceil(frameCount / cols);
      const cellWidth = (frameWidth - padding * 2) / cols;
      const cellHeight = (frameHeight - padding * 2) / rows;

      for (let i = 0; i < frameCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        positions.push({
          x: padding + col * cellWidth,
          y: padding + row * cellHeight,
          width: cellWidth - padding / 2,
          height: cellHeight - padding / 2,
          borderRadius: 8,
          rotation: 0,
        });
      }
    }

    return positions;
  };

  // Generate layout positions based on ACTUAL frame dimensions
  const generateLayoutPositionsWithActualSize = (frameCount: number, layout: string, frameWidth: number, frameHeight: number) => {
    const positions = [];
    const padding = Math.max(20, frameWidth * 0.05); // 5% padding or minimum 20px
    const photoWidth = (frameWidth - padding * 2) / (layout === 'horizontal' ? frameCount : 1);
    const photoHeight = (frameHeight - padding * 2) / (layout === 'vertical' ? frameCount : 1);

    console.log(`📐 Generating layout for ${layout} with ${frameCount} photos. Frame: ${frameWidth}x${frameHeight}, padding: ${padding}, photoSize: ${photoWidth}x${photoHeight}`);

    if (layout === 'vertical') {
      for (let i = 0; i < frameCount; i++) {
        positions.push({
          x: padding,
          y: padding + i * photoHeight,
          width: photoWidth,
          height: photoHeight,
          borderRadius: 8,
          rotation: 0,
        });
      }
    } else if (layout === 'horizontal') {
      for (let i = 0; i < frameCount; i++) {
        positions.push({
          x: padding + i * photoWidth,
          y: padding,
          width: photoWidth,
          height: photoHeight,
          borderRadius: 8,
          rotation: 0,
        });
      }
    } else if (layout === 'grid') {
      // 2x2 or 3x2 grid layout
      const cols = frameCount === 4 ? 2 : 3;
      const rows = Math.ceil(frameCount / cols);
      const cellWidth = (frameWidth - padding * 2) / cols;
      const cellHeight = (frameHeight - padding * 2) / rows;

      console.log(`📊 Grid layout:
        - Photos: ${frameCount}
        - Grid: ${cols}x${rows}
        - Frame: ${frameWidth}x${frameHeight}
        - Padding: ${padding}
        - Available space: ${frameWidth - padding * 2}x${frameHeight - padding * 2}
        - Cell size: ${cellWidth.toFixed(1)}x${cellHeight.toFixed(1)}`);

      for (let i = 0; i < frameCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const position = {
          x: padding + col * cellWidth,
          y: padding + row * cellHeight,
          width: cellWidth,
          height: cellHeight,
          borderRadius: 8,
          rotation: 0,
        };
        positions.push(position);
        console.log(`  📌 Photo ${i + 1}: (${position.x.toFixed(0)}, ${position.y.toFixed(0)}) ${position.width.toFixed(0)}x${position.height.toFixed(0)}`);
      }
    }

    console.log('✅ Layout positions generated:', positions);
    
    // Validate positions don't overlap
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      console.log(`  Position ${i + 1}: x=${pos.x.toFixed(0)}, y=${pos.y.toFixed(0)}, w=${pos.width.toFixed(0)}, h=${pos.height.toFixed(0)}, bottomRight=(${(pos.x + pos.width).toFixed(0)}, ${(pos.y + pos.height).toFixed(0)})`);
    }
    
    return positions;
  };



  return (
    <div className="min-h-screen bg-[#0F0F0F] p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-[#C62828]" />
            <h1 className="text-4xl font-bold text-white">AI Template Creator</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Design custom photo frames using AI-powered assistance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {/* Chat Box */}
            <div className="bg-[#1A1A1A] border border-[#C62828]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#C62828] to-[#E53935] px-6 py-4 flex items-center gap-3 shadow-lg">
                <div className="bg-white/20 rounded-full p-2">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI Frame Assistant</h3>
                  <p className="text-white/80 text-xs">Online • Siap membantu Anda</p>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#0F0F0F]">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#C62828] to-[#E53935]">
                    <Bot className="w-5 h-5 text-white" />
                  </div>

                  {/* Single Message Bubble with Instructions */}
                  <div className="flex-1 flex flex-col">
                    <div className="rounded-2xl px-5 py-5 bg-[#2A2A2A] border border-gray-700 text-gray-200 rounded-tl-none">
                      <p className="text-sm font-semibold text-white mb-3">
                        Hai! 👋 Saya AI Assistant yang akan membantu Anda membuat frame foto custom.
                      </p>
                      
                      <div className="bg-[#1A1A1A] rounded-lg p-4 mb-4 border border-gray-600">
                        <p className="text-xs font-bold text-[#C62828] mb-2">📋 Persyaratan Prompt Generate Frame:</p>
                        <ul className="text-sm space-y-1.5 text-gray-300">
                          <li>1. <strong>Jumlah foto:</strong> 2 / 3 / 4 / 6</li>
                          <li>2. <strong>Layout:</strong> vertikal / horizontal / grid</li>
                          <li>3. <strong>Border:</strong> kuning / merah / biru / putih / hitam / (warna lainnya)</li>
                          <li>4. <strong>Color frame:</strong> (warna atau gradasi, contoh: biru gradasi, pink solid)</li>
                          <li>5. <strong>Style:</strong> vintage / modern / minimalist / elegant / (opsional)</li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-xs font-bold text-blue-300 mb-2">💡 Contoh Deskripsi:</p>
                        <p className="text-sm text-gray-200 italic leading-relaxed">
                          "Buat frame dengan <strong>3 foto</strong> dengan layout <strong>vertikal</strong>, border <strong>kuning tebal</strong>, dengan frame berwarna <strong>biru gradasi</strong> dengan style <strong>vintage</strong>"
                        </p>
                      </div>

                      {/* Description Input */}
                      <div className="mt-5 pt-4 border-t border-gray-600">
                        <label className="text-sm text-gray-300 mb-2 block font-medium">✍️ Tulis Deskripsi Frame Anda:</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Contoh: Buat frame dengan 4 foto layout horizontal, border merah, frame berwarna pink gradasi dengan style modern"
                          rows={4}
                          disabled={isGenerating}
                          className="w-full px-4 py-3 bg-[#1A1A1A] text-white rounded-lg border border-gray-600 focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/30 focus:outline-none transition-all placeholder:text-gray-500 resize-none text-sm leading-relaxed disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          ⚡ <strong className="text-[#C62828]">Tips:</strong> Ikuti format persyaratan di atas untuk hasil terbaik!
                        </p>
                      </div>

                      {/* Generate Button */}
                      <div className="mt-4">
                        <button
                          onClick={handleGenerateClick}
                          disabled={isGenerating || !description.trim()}
                          className="w-full bg-gradient-to-r from-[#C62828] to-[#E53935] text-white hover:from-[#E53935] hover:to-[#C62828] transform hover:scale-[1.02] px-8 py-3.5 text-base font-bold rounded-lg shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                              Sedang Membuat Frame...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2 inline" />
                              Generate Frame
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>


            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-[#1A1A1A] border-[#C62828]/30 sticky top-24">
              <CardHeader className="bg-[#0F0F0F]/50 border-b border-[#C62828]/20">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C62828]" />
                  Frame Preview
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {generatedImage ? (
                  <>
                    {/* Generated Visual Frame */}
                    <div className="border-2 border-[#C62828]/40 rounded-lg overflow-hidden bg-[#0F0F0F]">
                      <img 
                        src={generatedImage} 
                        alt="Generated Frame" 
                        className="w-full h-auto rounded-lg"
                      />
                      <p className="text-xs text-gray-400 mt-2 px-2">Your Photo Booth Frame</p>
                    </div>

                    {/* Download/Save Button */}
                    <Button
                      onClick={async () => {
                        try {
                          // For SVG images, convert to PNG properly
                          if (generatedImage.includes('svg+xml')) {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              // Set higher resolution for better quality
                              canvas.width = 800;
                              canvas.height = 1200;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                // Draw white background
                                ctx.fillStyle = '#FFFFFF';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                // Draw the image centered and scaled
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                
                                canvas.toBlob((blob) => {
                                  if (blob) {
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `frame-${frameSpec?.layout}-${frameSpec?.frameCount}foto-${Date.now()}.png`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                    
                                    toast({
                                      title: 'Success',
                                      description: 'Frame downloaded as PNG!',
                                    });
                                  }
                                }, 'image/png', 0.95);
                              }
                            };
                            img.onerror = () => {
                              toast({
                                title: 'Error',
                                description: 'Failed to load image for download',
                                variant: 'destructive',
                              });
                            };
                            img.src = generatedImage;
                          } else {
                            const link = document.createElement('a');
                            link.href = generatedImage;
                            link.download = `frame-${frameSpec?.layout}-${frameSpec?.frameCount}foto-${Date.now()}.png`;
                            link.click();
                            
                            toast({
                              title: 'Success',
                              description: 'Frame downloaded!',
                            });
                          }
                        } catch (error) {
                          console.error('Download error:', error);
                          toast({
                            title: 'Error',
                            description: 'Failed to download frame.',
                            variant: 'destructive',
                          });
                        }
                      }}
                      className="w-full bg-gradient-to-r from-[#27AE60] to-[#229954] hover:from-[#229954] hover:to-[#27AE60] text-white font-semibold shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Frame
                    </Button>

                    {/* Visibility Control */}
                    <div className="bg-[#0F0F0F] border border-[#C62828]/30 rounded-lg p-4 space-y-3">
                      <h4 className="text-gray-300 font-semibold text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#C62828]" />
                        Frame Settings
                      </h4>
                      
                      {/* Frame Name */}
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Frame Name:</label>
                        <input
                          type="text"
                          value={frameName}
                          onChange={(e) => setFrameName(e.target.value)}
                          placeholder="My Awesome Frame"
                          className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#C62828]/30 rounded text-white text-sm focus:outline-none focus:border-[#C62828]"
                        />
                      </div>

                      {/* Privacy Info */}
                      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#C62828]/10 border border-[#C62828]/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🔒</span>
                          <div>
                            <p className="text-gray-300 text-sm font-medium">Frame Pribadi</p>
                            <p className="text-gray-500 text-xs">Frame ini hanya bisa dilihat oleh Anda. User lain tidak dapat mengakses atau melihat frame pribadi Anda.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Frame Button */}
                    <Button
                      onClick={() => {
                        console.log('Save button clicked!', { 
                          frameName, 
                          hasImage: !!generatedImage,
                          isSaving 
                        });
                        handleSaveTemplate();
                      }}
                      disabled={isSaving || !frameName.trim() || !generatedImage}
                      className="w-full bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] hover:from-[#8E44AD] hover:to-[#9B59B6] text-white font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          💾 Save Frame
                        </>
                      )}
                    </Button>
                    
                    {/* Helper text untuk status button */}
                    {generatedImage && (
                      <div className="text-xs text-center">
                        {!frameName.trim() ? (
                          <p className="text-yellow-400">⚠️ Isi nama frame untuk menyimpan</p>
                        ) : (
                          <p className="text-green-400">✅ Siap disimpan</p>
                        )}
                      </div>
                    )}

                    {/* Use Frame Button - untuk ke booth editor */}
                    <Button
                      onClick={() => {
                        if (!frameSpec || !generatedImage) {
                          toast({
                            title: 'Error',
                            description: 'Frame data is missing.',
                            variant: 'destructive',
                          });
                          return;
                        }

                        // Pass frame spec via query parameter (smaller data)
                        const specParam = encodeURIComponent(JSON.stringify(frameSpec));
                        const imageBlobParam = encodeURIComponent(generatedImage);
                        
                        // Use sessionStorage for temporary storage (better than localStorage for large data)
                        sessionStorage.setItem('aiFrameSpec', JSON.stringify(frameSpec));
                        sessionStorage.setItem('aiFrameImage', generatedImage);
                        
                        toast({
                          title: '✨ Frame Siap Digunakan!',
                          description: 'Frame akan terbuka di Booth untuk foto Anda',
                        });
                        
                        // Redirect to booth with aiFrame indicator
                        setTimeout(() => {
                          navigate('/booth?aiFrame=true');
                        }, 500);
                      }}
                      className="w-full bg-gradient-to-r from-[#3498DB] to-[#2980B9] hover:from-[#2980B9] hover:to-[#3498DB] text-white font-semibold shadow-lg transition-all"
                    >
                      📸 Gunakan Frame untuk Foto
                    </Button>
                    
                    <div className="bg-gradient-to-r from-[#3498DB]/10 to-[#2980B9]/10 border border-[#3498DB]/30 rounded-lg p-3 text-sm">
                      <p className="text-gray-300 text-center">
                        <span className="font-semibold text-[#3498DB]">💡 Tip:</span> Klik tombol di atas untuk langsung menggunakan frame ini di Photo Booth!
                      </p>
                    </div>

                    {/* Frame Specifications */}
                    {frameSpec && (
                      <div className="bg-[#0F0F0F] border border-[#C62828]/30 rounded-lg p-3 text-sm">
                        <h4 className="text-gray-300 font-semibold mb-2">Frame Specs:</h4>
                        <ul className="space-y-1 text-gray-400 text-xs">
                          <li>📷 Count: {frameSpec.frameCount} photos</li>
                          <li>📐 Layout: {frameSpec.layout}</li>
                          <li>🎨 Background: {frameSpec.backgroundColor}</li>
                          <li>🖼️ Border: {frameSpec.borderColor}</li>
                          {frameSpec.gradientFrom && frameSpec.gradientTo && (
                            <li>🌈 Gradient: {frameSpec.gradientFrom} → {frameSpec.gradientTo}</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Reset Button */}
                    <Button
                      onClick={() => {
                        setGeneratedImage(null);
                        setFrameSpec(null);
                        setDescription('');
                        setFrameName('');
                        toast({
                          title: '🔄 Reset Berhasil',
                          description: 'Siap membuat frame baru!',
                        });
                      }}
                      className="w-full bg-[#7F8C8D] hover:bg-[#95A5A6] text-white font-semibold"
                    >
                      ↻ Buat Frame Baru
                    </Button>
                  </>
                ) : (
                  <>
                    {/* No Frame Yet */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center text-gray-500 py-8 px-4"
                    >
                      <div className="bg-[#2A2A2A] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-[#C62828] opacity-50" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Belum Ada Frame</h3>
                      <p className="text-sm leading-relaxed">Isi form di sebelah kiri, lalu klik "Buat Template AI" untuk generate frame!</p>
                    </motion.div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Premium Modal - REQUIRED upgrade */}
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={handleCloseModal}
        feature="AI Template Creator"
        requireUpgrade={true}
      />
    </div>
  );
};

export default AITemplateCreator;
