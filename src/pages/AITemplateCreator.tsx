import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Copy, Check, AlertCircle, Sparkles, ImagePlus, Download, Zap, Layout, Grid3x3, Layers, User, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { aiAPI } from '@/services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FrameSpec {
  frameCount: number;
  layoutType: string;
  width: number;
  height: number;
  backgroundColor: string;
  borderStyle: string;
  borderColor: string;
  borderThickness: number;
  description: string;
  photoPositions: Array<{
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius: number;
    rotation: number;
  }>;
  designElements: {
    pattern: string;
    shadow: string;
    decorations: string;
  };
}

interface AIResponse {
  message: string;
}

interface AIFrameSpec {
  frameCount: number;
  layout: 'vertical' | 'horizontal' | 'grid';
  backgroundColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
}

interface ChatAIResponse {
  message: string;
  frameSpec?: AIFrameSpec;
}

const QUICK_PROMPTS = [
  { icon: Layers, text: '3-photo vertical frame with gradient', prompt: 'Create a 3-photo vertical frame with blue to purple gradient background' },
  { icon: Grid3x3, text: '4-photo grid layout', prompt: 'Design a 4-photo grid frame with modern style and soft colors' },
  { icon: Layout, text: '2-photo horizontal frame', prompt: 'Make a 2-photo horizontal frame with elegant border and pastel colors' },
];

const AITemplateCreator = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Welcome to AI Template Creator!

I'm here to help you design custom photo frames using AI. Just describe the frame you want, and I'll generate the specifications and visual frame for you.

**What you can ask for:**
- "Create a 3-photo vertical frame with a blue gradient background"
- "Design a 2-photo frame with rounded borders and a modern look"
- "Make a 4-photo grid frame with a trendy color scheme"

**Frame constraints:**
- Frame Count: 2, 3, or 4 photos
- Layout Types: vertical, horizontal, grid, or mixed
- Dimensions: 800x600 to 1200x900 pixels
- Colors: Hex color codes (e.g., #FF5733)

Go ahead and describe your ideal frame! ✨`,
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<FrameSpec | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [frameSpec, setFrameSpec] = useState<AIFrameSpec | null>(null);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputValue.trim();
    if (!messageToSend) return;

    const userMessage = messageToSend;
    setInputValue('');
    setLastPrompt(userMessage);
    setShowQuickPrompts(false);

    // Add user message to chat
    const updatedMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await aiAPI.chatAI(updatedMessages);
      const chatResponse = response as ChatAIResponse;
      const assistantMessage = chatResponse.message;
      const spec = chatResponse.frameSpec;

      // Store frame spec if provided by AI
      if (spec) {
        setFrameSpec(spec);
        console.log('Received frame spec from AI:', spec);
      }

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantMessage },
      ]);

      toast({
        title: 'Frame Idea Received',
        description: spec ? 'Your frame is ready! Click "Generate Visual Frame" to create it.' : 'Click "Generate Visual Frame" to create the frame image!',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVisualFrame = async () => {
    if (!frameSpec) {
      toast({
        title: 'Error',
        description: 'No frame specification available. Please confirm your frame design in the chat first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      console.log('Generating frame with AI spec:', frameSpec);

      const requestBody = {
        frameCount: frameSpec.frameCount,
        layout: frameSpec.layout as 'vertical' | 'horizontal' | 'grid',
        backgroundColor: frameSpec.backgroundColor,
        borderColor: frameSpec.borderColor,
        gradientFrom: frameSpec.gradientFrom || frameSpec.backgroundColor,
        gradientTo: frameSpec.gradientTo || frameSpec.backgroundColor,
        borderThickness: frameSpec.borderThickness || 2,
        borderRadius: frameSpec.borderRadius || 8,
      };
      
      console.log('Request body:', requestBody);

      const response = await aiAPI.generateFrame(requestBody);

      if (response.success && response.image) {
        setGeneratedImage(`data:${response.contentType};base64,${response.image}`);
        toast({
          title: 'Success',
          description: `Visual frame generated! (${frameSpec.frameCount}-photo ${frameSpec.layout} frame)`,
        });
      } else {
        throw new Error(response.error || 'No image in response');
      }
    } catch (error) {
      console.error('Error generating frame:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      let displayMessage = 'Failed to generate visual frame. Please try again.';
      if (errorMessage.includes('timeout') || errorMessage.includes('504')) {
        displayMessage = 'Image generation timed out. Try with a simpler description.';
      } else if (errorMessage.includes('Cannot connect')) {
        displayMessage = 'Cannot connect to server. Make sure backend is running.';
      }

      toast({
        title: 'Error',
        description: displayMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

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
          {/* Chat Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="h-[600px] flex flex-col bg-[#1A1A1A] border-[#C62828]/30">
              <CardHeader className="border-b border-[#C62828]/20 bg-[#0F0F0F]/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C62828]" />
                  Chat with AI
                </CardTitle>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-[#C62828] rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-lg ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-[#C62828] to-[#E53935] text-white rounded-br-none'
                            : 'bg-[#2A2A2A] text-gray-100 rounded-bl-none border border-[#C62828]/20'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                      <span className={`text-xs text-gray-500 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#3498DB] to-[#2980B9] rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Quick Prompts */}
                <AnimatePresence>
                  {showQuickPrompts && messages.length === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col gap-2 py-4"
                    >
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Quick Suggestions:
                      </p>
                      {QUICK_PROMPTS.map((prompt, idx) => {
                        const Icon = prompt.icon;
                        return (
                          <Button
                            key={idx}
                            variant="outline"
                            onClick={() => handleSendMessage(prompt.prompt)}
                            className="w-full justify-start text-left bg-[#2A2A2A] hover:bg-[#C62828]/20 border-[#C62828]/30 text-gray-300 hover:text-white transition-all"
                          >
                            <Icon className="w-4 h-4 mr-2 text-[#C62828]" />
                            <span className="text-sm">{prompt.text}</span>
                          </Button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-[#C62828] rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col gap-2 bg-[#2A2A2A] px-4 py-3 rounded-lg rounded-bl-none border border-[#C62828]/20">
                      <div className="flex gap-2 items-center text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin text-[#C62828]" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                          className="w-2 h-2 bg-[#C62828] rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-2 h-2 bg-[#C62828] rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-2 h-2 bg-[#C62828] rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="border-t border-[#C62828]/20 p-4 bg-gradient-to-b from-[#0F0F0F]/50 to-[#1A1A1A]">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isLoading) {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Describe your ideal frame... (e.g., '3-photo vertical with blue gradient')"
                      className="w-full px-4 py-3 bg-[#2A2A2A] text-white rounded-lg border border-[#C62828]/20 focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 focus:outline-none transition-all placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-[#C62828] to-[#E53935] hover:from-[#E53935] hover:to-[#C62828] text-white px-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Press Enter to send or use quick suggestions above
                </p>
              </div>
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
                        setMessages([
                          {
                            role: 'assistant',
                            content: `👋 Welcome to AI Template Creator!\n\nI'm here to help you design custom photo frames using AI. Just describe the frame you want, and I'll generate the specifications and visual frame for you.\n\n**What you can ask for:**\n- "Create a 3-photo vertical frame with a blue gradient background"\n- "Design a 2-photo frame with rounded borders and a modern look"\n- "Make a 4-photo grid frame with a trendy color scheme"\n\n**Frame constraints:**\n- Frame Count: 2, 3, or 4 photos\n- Layout Types: vertical, horizontal, grid, or mixed\n- Dimensions: 800x600 to 1200x900 pixels\n- Colors: Hex color codes (e.g., #FF5733)\n\nGo ahead and describe your ideal frame! ✨`,
                          },
                        ]);
                        toast({
                          title: 'Reset',
                          description: 'Ready to design a new frame!',
                        });
                      }}
                      className="w-full bg-[#7F8C8D] hover:bg-[#95A5A6] text-white font-semibold"
                    >
                      ↻ Start New Frame
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Generate Visual Frame Button */}
                    <Button
                      onClick={handleGenerateVisualFrame}
                      disabled={isGeneratingImage || !frameSpec}
                      className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-semibold disabled:opacity-50"
                    >
                      {isGeneratingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Frame...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-4 h-4 mr-2" />
                          Generate Visual Frame
                        </>
                      )}
                    </Button>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center text-gray-500 py-8 px-4"
                    >
                      <div className="bg-[#2A2A2A] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-[#C62828] opacity-50" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">No Frame Yet</h3>
                      <p className="text-sm leading-relaxed">Chat with AI to design your frame, then click "Generate Visual Frame" to create it!</p>
                      {frameSpec && (
                        <Badge className="mt-3 bg-[#C62828]/20 text-[#C62828] border-[#C62828]/30">
                          Frame ready to generate!
                        </Badge>
                      )}
                    </motion.div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AITemplateCreator;
