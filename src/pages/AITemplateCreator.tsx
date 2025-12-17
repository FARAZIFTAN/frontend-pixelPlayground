import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Sparkles, ImagePlus, Download, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { aiAPI } from '@/services/api';
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

interface FrameImageResponse {
  success: boolean;
  data?: {
    frameImage: string;
  };
}

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

  // Check premium status on mount
  useEffect(() => {
    if (user && !isPremium) {
      setShowPremiumModal(true);
    }
  }, [user, isPremium]);

  // Handler untuk close modal - redirect jika belum premium
  const handleCloseModal = () => {
    if (!isPremium) {
      toast.error("Premium membership required to access AI Template Creator", {
        duration: 3000,
        icon: "🔒"
      });
      navigate("/");
    }
    setShowPremiumModal(false);
  };

  // Form states - 1x process
  const [frameCount, setFrameCount] = useState<2 | 3 | 4>(3);
  const [layout, setLayout] = useState<'vertical' | 'horizontal' | 'grid'>('vertical');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [frameSpec, setFrameSpec] = useState<AIFrameSpec | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [frameName, setFrameName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Generate template dalam 1x proses - langsung dari form ke gambar
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
      // Step 1: Generate frame spec via AI (bahasa Indonesia)
      const promptIndonesia = `Buatkan spesifikasi frame foto dengan ketentuan berikut:
- Jumlah foto: ${frameCount}
- Layout: ${layout}
- Deskripsi: ${description}

Buatkan desain yang menarik dan modern. Berikan warna yang cocok dan elemen dekoratif yang sesuai dengan deskripsi.`;

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

      // Step 2: Langsung generate visual frame
      const requestBody = {
        frameCount: spec.frameCount,
        layout: spec.layout,
        backgroundColor: spec.backgroundColor || '#FFFFFF',
        borderColor: spec.borderColor || '#000000',
        gradientFrom: spec.gradientFrom || spec.backgroundColor || '#FFFFFF',
        gradientTo: spec.gradientTo || spec.backgroundColor || '#FFFFFF',
        borderThickness: 2,
        borderRadius: 8,
      };

      const imageResponse = await aiAPI.generateFrameImage(requestBody) as FrameImageResponse;

      if (imageResponse.success && imageResponse.data?.frameImage) {
        const base64Image = imageResponse.data.frameImage;
        setGeneratedImage(base64Image);
        
        toast({
          title: '✨ Template Berhasil Dibuat!',
          description: 'Template frame Anda sudah siap digunakan',
        });
      } else {
        throw new Error('Gagal generate gambar frame');
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

  // Fungsi handleGenerateVisualFrame dihapus - sudah digabung dalam handleGenerateTemplate

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: 'Copied',
      description: 'Frame specification copied to clipboard!',
    });
    setTimeout(() => setCopiedIndex(null), 2000);
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
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-[#1A1A1A] border-[#C62828]/30">
              <CardHeader className="border-b border-[#C62828]/20 bg-[#0F0F0F]/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C62828]" />
                  Buat Template AI
                </CardTitle>
              </CardHeader>

              {/* Form */}
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  {/* Jumlah Foto */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <ImagePlus className="w-4 h-4 text-[#C62828]" />
                      Jumlah Foto
                    </label>
                    <select
                      value={frameCount}
                      onChange={(e) => setFrameCount(Number(e.target.value) as 2 | 3 | 4)}
                      className="w-full px-4 py-3 bg-[#2A2A2A] text-white rounded-lg border border-[#C62828]/20 focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 focus:outline-none transition-all"
                      disabled={isGenerating}
                    >
                      <option value={2}>2 Foto</option>
                      <option value={3}>3 Foto</option>
                      <option value={4}>4 Foto</option>
                    </select>
                  </div>

                  {/* Layout */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-[#C62828]" />
                      Tata Letak
                    </label>
                    <select
                      value={layout}
                      onChange={(e) => setLayout(e.target.value as 'vertical' | 'horizontal' | 'grid')}
                      className="w-full px-4 py-3 bg-[#2A2A2A] text-white rounded-lg border border-[#C62828]/20 focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 focus:outline-none transition-all"
                      disabled={isGenerating}
                    >
                      <option value="vertical">Vertikal (Atas ke Bawah)</option>
                      <option value="horizontal">Horizontal (Kiri ke Kanan)</option>
                      <option value="grid">Grid (Kotak-kotak)</option>
                    </select>
                  </div>

                  {/* Deskripsi */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C62828]" />
                      Deskripsi Frame
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Contoh: Frame dengan background gradasi biru, border rounded, dan dekorasi bintang di sudut"
                      rows={5}
                      className="w-full px-4 py-3 bg-[#2A2A2A] text-white rounded-lg border border-[#C62828]/20 focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 focus:outline-none transition-all placeholder:text-gray-500 resize-none"
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-gray-500">
                      Jelaskan frame yang kamu inginkan: warna, style, dekorasi, dll.
                    </p>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateTemplate}
                    disabled={isGenerating || !description.trim()}
                    className="w-full bg-gradient-to-r from-[#C62828] to-[#E53935] hover:from-[#E53935] hover:to-[#C62828] text-white font-semibold py-6 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Membuat Template...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Buat Template AI
                      </>
                    )}
                  </Button>

                  {/* Info Box */}
                  <div className="bg-[#2A2A2A] border border-[#C62828]/20 rounded-lg p-4">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      <strong className="text-[#C62828]">Tips:</strong> Semakin detail deskripsi kamu, semakin bagus hasil frame yang dihasilkan AI. Jelaskan warna, style, dekorasi, dan elemen visual lainnya.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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

                      {/* Visibility Toggle */}
                      <div>
                        <label className="text-gray-400 text-xs mb-2 block">Visibility:</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFrameVisibility('public')}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                              frameVisibility === 'public'
                                ? 'bg-[#27AE60] text-white'
                                : 'bg-[#1A1A1A] text-gray-400 border border-[#C62828]/30 hover:border-[#27AE60]/50'
                            }`}
                          >
                            🌍 Public
                          </button>
                          <button
                            onClick={() => setFrameVisibility('private')}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                              frameVisibility === 'private'
                                ? 'bg-[#E74C3C] text-white'
                                : 'bg-[#1A1A1A] text-gray-400 border border-[#C62828]/30 hover:border-[#E74C3C]/50'
                            }`}
                          >
                            🔒 Private
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {frameVisibility === 'public' 
                            ? '✨ Semua user dapat melihat frame ini' 
                            : '🔒 Hanya Anda yang dapat melihat frame ini'}
                        </p>
                      </div>
                    </div>

                    {/* Save Frame Button */}
                    <Button
                      onClick={async () => {
                        if (!frameSpec || !generatedImage) {
                          toast({
                            title: 'Error',
                            description: 'Frame data is missing.',
                            variant: 'destructive',
                          });
                          return;
                        }

                        if (!frameName.trim()) {
                          toast({
                            title: 'Error',
                            description: 'Please enter a frame name.',
                            variant: 'destructive',
                          });
                          return;
                        }

                        setIsSaving(true);
                        try {
                          const response = await aiAPI.saveFrame({
                            name: frameName,
                            frameSpec,
                            frameDataUrl: generatedImage,
                            visibility: frameVisibility,
                            description: `AI-generated ${frameSpec.layout} frame with ${frameSpec.frameCount} photos`,
                            tags: ['AI', frameSpec.theme, frameSpec.layout],
                          });

                          toast({
                            title: '✅ Frame Saved!',
                            description: `Frame "${frameName}" saved as ${frameVisibility}`,
                          });
                        } catch (error) {
                          console.error('Save error:', error);
                          toast({
                            title: 'Error',
                            description: 'Failed to save frame. Please try again.',
                            variant: 'destructive',
                          });
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving || !frameName.trim()}
                      className="w-full bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] hover:from-[#8E44AD] hover:to-[#9B59B6] text-white font-semibold shadow-lg transition-all disabled:opacity-50"
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
                        setFrameCount(3);
                        setLayout('vertical');
                        toast({
                          title: 'Reset',
                          description: 'Ready to design a new frame!',
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
