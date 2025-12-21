import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Download, Share2, RotateCcw, Loader2, Sparkles, ArrowRight, ImageIcon, Save, X, Upload, Check, Smile, Shapes, RefreshCw, Palette, ZoomIn, ZoomOut, Search, Undo2, Redo2, Sliders, Heart, Star } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { sessionAPI, photoAPI, compositeAPI, templateAPI, userFrameAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

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

interface FilterSettings {
  name: string;
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  grayscale: number;
  hueRotate: number;
  blur?: number;
  invert?: number;
  opacity?: number;
}

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const FILTER_PRESETS: { [key: string]: FilterSettings } = {
  none: {
    name: "None",
    brightness: 100,
    contrast: 100,
    saturate: 100,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
  },
  grayscale: {
    name: "Grayscale",
    brightness: 105,
    contrast: 110,
    saturate: 0,
    sepia: 0,
    grayscale: 100,
    hueRotate: 0,
  },
  sepia: {
    name: "Sepia",
    brightness: 105,
    contrast: 115,
    saturate: 85,
    sepia: 100,
    grayscale: 0,
    hueRotate: 0,
  },
  vintage: {
    name: "Vintage",
    brightness: 108,
    contrast: 105,
    saturate: 85,
    sepia: 35,
    grayscale: 0,
    hueRotate: 8,
  },
  bright: {
    name: "Bright",
    brightness: 115,
    contrast: 110,
    saturate: 105,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
  },
  warm: {
    name: "Warm",
    brightness: 110,
    contrast: 105,
    saturate: 115,
    sepia: 15,
    grayscale: 0,
    hueRotate: 5,
  },
};

// Sticker collection
// Categorized Stickers
const STICKER_CATEGORIES = {
  emoji: ['😀', '😂', '😍', '🥰', '😎', '🤩', '😇', '🥳', '🤗', '😊', '😋', '😜', '🤪', '😝', '🥴', '😌'],
  hearts: ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💟', '❣️', '💞', '💌', '🧡', '💛', '💚', '💙', '💜'],
  stars: ['⭐', '🌟', '✨', '💫', '⚡', '☄️', '🌠', '🔆', '🌞', '🌝', '🌛', '🌜', '💥', '✴️', '🌈', '☀️'],
  objects: ['🎉', '🎊', '🎈', '🎁', '🎀', '🌹', '🌺', '🌸', '👑', '💎', '🔥', '💯', '✅', '🎯', '🏆', '🎓'],
};

const STICKER_EMOJIS = [
  ...STICKER_CATEGORIES.emoji,
  ...STICKER_CATEGORIES.hearts,
  ...STICKER_CATEGORIES.stars,
  ...STICKER_CATEGORIES.objects,
];

const STICKER_SHAPES = [
  { emoji: '⭐', label: 'Star' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '✨', label: 'Sparkle' },
  { emoji: '🎈', label: 'Balloon' },
];

// Helper function to generate layout positions from AI frame spec
const generateLayoutPositions = (
  frameCount: number,
  layout: string,
  frameWidth: number = 600,
  frameHeight: number = 900
): Array<{ x: number; y: number; width: number; height: number }> => {
  const padding = 20; // Space around frame border
  const positions: Array<{ x: number; y: number; width: number; height: number }> = [];

  if (layout === 'vertical') {
    // Stack photos vertically
    const photoHeight = (frameHeight - padding * (frameCount + 1)) / frameCount;
    const photoWidth = frameWidth - padding * 2;

    for (let i = 0; i < frameCount; i++) {
      const y = padding + i * (photoHeight + padding);
      positions.push({
        x: padding,
        y: y,
        width: photoWidth,
        height: photoHeight,
      });
    }
  } else if (layout === 'horizontal') {
    // Photos side by side
    const photoWidth = (frameWidth - padding * (frameCount + 1)) / frameCount;
    const photoHeight = frameHeight - padding * 2;

    for (let i = 0; i < frameCount; i++) {
      const x = padding + i * (photoWidth + padding);
      positions.push({
        x: x,
        y: padding,
        width: photoWidth,
        height: photoHeight,
      });
    }
  } else if (layout === 'grid') {
    // Grid layout
    const cols = frameCount === 4 ? 2 : frameCount === 6 ? 3 : 2;
    const rows = Math.ceil(frameCount / cols);
    const photoWidth = (frameWidth - padding * (cols + 1)) / cols;
    const photoHeight = (frameHeight - padding * (rows + 1)) / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const photoNum = row * cols + col;
        if (photoNum >= frameCount) break;

        const x = padding + col * (photoWidth + padding);
        const y = padding + row * (photoHeight + padding);

        positions.push({
          x: x,
          y: y,
          width: photoWidth,
          height: photoHeight,
        });
      }
    }
  }

  return positions;
};

const Booth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]); // Array of captured photos
  const [finalCompositeImage, setFinalCompositeImage] = useState<string | null>(null); // Final result
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0); // Current photo being captured (0-based)
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [photoCount, setPhotoCount] = useState<number>(4); // Number of photos to take (2, 3, or 4)
  const [hasLoadedTemplate, setHasLoadedTemplate] = useState(false); // Track if template is loaded
  
  // Backend integration states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadedPhotoIds, setUploadedPhotoIds] = useState<string[]>([]);
  
  // Edit Photo states
  const [globalFilter, setGlobalFilter] = useState<FilterSettings>(FILTER_PRESETS.none);
  const [allPhotosCaptured, setAllPhotosCaptured] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false); // Show/hide edit panel
  const [showRetakeOptions, setShowRetakeOptions] = useState(false); // Show individual photo retake options
  const [editTab, setEditTab] = useState<'stickers' | 'filters' | 'frame' | 'adjust'>('stickers');
  const [previewZoom, setPreviewZoom] = useState(1);
  const [filterIntensity, setFilterIntensity] = useState(100);
  
  // Sticker states
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [stickerCategory, setStickerCategory] = useState<'all' | 'emoji' | 'hearts' | 'stars' | 'objects'>('all');
  const [stickerSearch, setStickerSearch] = useState('');
  
  // Undo/Redo states
  const [stickerHistory, setStickerHistory] = useState<Sticker[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // New UI states
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [fullscreenZoom, setFullscreenZoom] = useState(1);
  const [draggingSticker, setDraggingSticker] = useState<string | null>(null);
  
  // Frame change states
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [userCustomFrames, setUserCustomFrames] = useState<any[]>([]);
  
  // Input method selection states
  const [inputMethod, setInputMethod] = useState<'camera' | 'upload' | null>(null); // null = show selection screen
  
  const [compositeImageDimensions, setCompositeImageDimensions] = useState({ width: 800, height: 600 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
  const stickerContainerRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownToast = useRef(false); // Track if toast has been shown
  const isRetakingPhotoRef = useRef(false); // Track if currently retaking a photo
  const retakeIndexRef = useRef<number | null>(null); // Track which index to retake
  const isMountedRef = useRef(true); // Track component mounted state
  const isStartingCameraRef = useRef(false); // Prevent multiple camera starts

  // Warn if using premium template without logging in (but don't block)
  useEffect(() => {
    // Tip notification removed - not necessary
  }, [selectedTemplate, user]);

  // Reset custom frames when user logs out
  useEffect(() => {
    if (!user) {
      setUserCustomFrames([]);
    }
  }, [user]);

  // Define handleCapture as regular function (not useCallback to avoid dependency issues)
  const handleCapture = () => {
    // Clear any existing countdown first
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          capturePhoto();
          return null;
        }
        return prev! - 1;
      });
    }, 1000);
  };

  // Define callback functions before useEffects
  const startCamera = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isStartingCameraRef.current) {
      console.log('⏸️ Camera start already in progress, skipping...');
      return;
    }
    
    console.log('🎥 Starting camera...');
    isStartingCameraRef.current = true;
    
    try {
      // Cleanup existing stream first
      if (stream) {
        console.log('🧹 Cleaning up existing stream...');
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log(`🛑 Stopped track: ${track.kind}`);
        });
        setStream(null);
      }
      
      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (cleanupError) {
      console.warn('Cleanup error (non-critical):', cleanupError);
    }
    
    if (!isMountedRef.current) {
      console.log('⚠️ Component unmounted, aborting camera start');
      isStartingCameraRef.current = false;
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('📸 Requesting camera access...');
      // Request camera with optimal settings
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user", 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false,
      });
      
      if (!isMountedRef.current) {
        console.log('⚠️ Component unmounted during camera request, cleaning up...');
        mediaStream.getTracks().forEach(track => track.stop());
        isStartingCameraRef.current = false;
        return;
      }
      
      console.log('✅ Camera access granted, stream obtained');
      setStream(mediaStream);
      
      // Ensure video element gets the stream
      if (videoRef.current && isMountedRef.current) {
        console.log('📹 Setting video stream...');
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        // Wait for video to be ready and play
        try {
          // Check if video is already ready
          if (video.readyState >= 2) {
            console.log('📊 Video already ready');
          } else {
            // Wait for loadedmetadata event with shorter timeout
            await new Promise<void>((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                // Don't reject on timeout, just proceed
                console.warn('⚠️ Video load timeout, proceeding anyway');
                resolve();
              }, 2000);
              
              video.onloadedmetadata = () => {
                clearTimeout(timeoutId);
                console.log('📊 Video metadata loaded');
                resolve();
              };
              
              video.onerror = () => {
                clearTimeout(timeoutId);
                console.warn('Video load error, proceeding anyway');
                resolve();
              };
            });
          }
          
          // Play the video
          if (isMountedRef.current) {
            await video.play();
            console.log('▶️ Video playing successfully');
            
            if (isMountedRef.current) {
              setIsLoading(false);
              setHasPermission(true);
              
              // If in retake mode, auto-start capture immediately
              if (isRetakingPhotoRef.current) {
                handleCapture();
                isRetakingPhotoRef.current = false;
              }
            }
          }
        } catch (playError) {
          console.error('❌ Video play error:', playError);
          if (isMountedRef.current) {
            setIsLoading(false);
            setHasPermission(true); // Still set permission as camera is accessible
          }
        }
      } else {
        console.error('❌ Video ref is null or component unmounted');
        if (isMountedRef.current) {
          setIsLoading(false);
          setHasPermission(false);
        }
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      if (isMountedRef.current) {
        toast.error("Could not access camera. Please grant permission.");
        setHasPermission(false);
        setIsLoading(false);
      }
    } finally {
      isStartingCameraRef.current = false;
    }
  }, [stream]);

  const createPhotoSession = useCallback(async () => {
    if (!selectedTemplate) {
      console.warn('⚠️ Cannot create session: No template selected');
      return;
    }

    if (!user) {
      console.warn('⚠️ User not logged in, cannot create session');
      toast.error('Please login to save your photos', { duration: 3000 });
      return;
    }

    try {
      console.log('🔄 Creating photo session with template:', selectedTemplate.name);
      console.log('👤 User ID:', user.id);
      
      const response = await sessionAPI.createSession({
        sessionName: `Photo Session ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`,
        templateId: selectedTemplate._id,
        metadata: {
          photoCount,
          templateName: selectedTemplate.name,
          startedAt: new Date().toISOString(),
        }
      });
      
      console.log('📦 Session API Response:', response);
      
      const data = response as { 
        success?: boolean;
        data?: { _id?: string; session?: { _id: string } }; 
        session?: { _id: string };
        _id?: string;
      };
      
      const newSessionId = 
        data.data?._id || 
        data.data?.session?._id || 
        data.session?._id || 
        data._id;
      
      if (newSessionId) {
        setSessionId(newSessionId);
        console.log('✅ Photo session created successfully:', newSessionId);

      } else {
        console.error('❌ No session ID found in response:', data);
        throw new Error('No session ID in response');
      }
    } catch (error) {
      console.error('❌ Failed to create photo session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      
      if (errorMessage.includes('Unauthorized')) {
        toast.error('Please login to save your photos', { duration: 3000 });
      } else if (errorMessage.includes('Cannot connect')) {
        toast.error('Cannot connect to server. Backend may be offline.', { duration: 3000 });
      } else {
        toast.error('Failed to create session. Photos may not be saved.', { duration: 3000 });
      }
    }
  }, [selectedTemplate, user, photoCount]);

  // Load input method from URL parameter
  useEffect(() => {
    const methodFromUrl = searchParams.get("method");
    if (methodFromUrl && (methodFromUrl === 'camera' || methodFromUrl === 'upload')) {
      console.log('Setting input method from URL:', methodFromUrl);
      setInputMethod(methodFromUrl);
    }
  }, [searchParams]);

  // Load template from URL parameter or AI generated frame
  useEffect(() => {
    const templateIdFromUrl = searchParams.get("template");
    const aiFrameFromUrl = searchParams.get("aiFrame");
    const methodFromUrl = searchParams.get("method");
    
    console.log('Template loading effect:', { 
      templateIdFromUrl, 
      aiFrameFromUrl, 
      methodFromUrl,
      hasLoadedTemplate,
      inputMethod,
      selectedTemplate: selectedTemplate?.name
    });
    
    // Reset hasLoadedTemplate if we need to reload (e.g., when method changes)
    if (aiFrameFromUrl === "true" && methodFromUrl && !selectedTemplate) {
      console.log('Resetting hasLoadedTemplate to reload AI frame');
      setHasLoadedTemplate(false);
    }
    
    if (aiFrameFromUrl === "true" && !hasLoadedTemplate) {
      // Load AI generated frame from sessionStorage
      const aiFrameSpec = sessionStorage.getItem('aiFrameSpec');
      const aiFrameImage = sessionStorage.getItem('aiFrameImage');
      
      console.log('AI Frame data from sessionStorage:', { 
        hasSpec: !!aiFrameSpec, 
        hasImage: !!aiFrameImage 
      });
      
      if (aiFrameSpec && aiFrameImage) {
        try {
          const spec = JSON.parse(aiFrameSpec);
          
          // Generate layout positions based on frame spec
          const layoutPositions = generateLayoutPositions(
            spec.frameCount,
            spec.layout,
            600, // frame width (SVG default)
            900  // frame height (SVG default)
          );
          
          // Create a mock template object from AI frame spec
          const aiTemplate: Template = {
            _id: templateIdFromUrl || 'ai-generated-' + Date.now(),
            name: `AI ${spec.frameCount}-Photo ${spec.layout} Frame`,
            category: 'AI Generated',
            thumbnail: aiFrameImage,
            frameUrl: aiFrameImage,
            isPremium: false,
            frameCount: spec.frameCount,
            layoutPositions: layoutPositions,
          };
          
          console.log('⚡ AI Template created (instant):', aiTemplate);
          
          // Set template immediately
          setSelectedTemplate(aiTemplate);
          setPhotoCount(spec.frameCount);
          setHasLoadedTemplate(true);
          
          // Check if input method is already set from URL or state
          const currentInputMethod = inputMethod || methodFromUrl;
          
          // If no input method is selected, redirect to input method selection
          if (!currentInputMethod) {
            console.log('No input method, redirecting to input-method page');

            setTimeout(() => {
              navigate(`/input-method?template=${aiTemplate._id}&aiFrame=true`);
            }, 500);
            // Keep sessionStorage for InputMethodSelection page
            return;
          }
          
          console.log('Input method available, loading frame with method:', currentInputMethod);
          console.log('✅ AI template loaded, camera should be starting...');
          
          // Clean up sessionStorage immediately
          sessionStorage.removeItem('aiFrameSpec');
          sessionStorage.removeItem('aiFrameImage');
        } catch (error) {
          console.error('Load AI frame error:', error);
          toast.error('Failed to load AI frame');
        }
      } else {
        console.warn('AI Frame data not found in sessionStorage');
      }
      return;
    }
    
    if (templateIdFromUrl && !hasLoadedTemplate) {
      const loadTemplate = async (templateId: string) => {
        try {
          // Try to load from cache first for INSTANT display
          const cached = sessionStorage.getItem('booth_template_cache');
          if (cached) {
            try {
              const { template, timestamp } = JSON.parse(cached);
              // Use cache if less than 30 seconds old
              if (Date.now() - timestamp < 30000) {
                console.log('⚡ INSTANT template load from cache!');
                setSelectedTemplate(template);
                setPhotoCount(template.frameCount);
                setHasLoadedTemplate(true);
                // Clean cache after use
                sessionStorage.removeItem('booth_template_cache');
                return;
              }
            } catch (e) {
              console.warn('Cache parse error');
            }
          }
          
          // Fallback: Load from API
          console.log('📷 Loading template from API...');
          const response = await templateAPI.getTemplate(templateId) as {
            success: boolean;
            data?: { template: Template };
          };
          
          if (response.success && response.data) {
            const template = response.data.template;
            
            // Cegah load template premium jika belum login
            if (template.isPremium && !user) {
              toast.error("Login diperlukan untuk menggunakan frame premium!", { 
                duration: 4000,
                icon: "🔒"
              });
              setTimeout(() => {
                navigate("/login");
              }, 1500);
              return;
            }
            
            setSelectedTemplate(template);
            setPhotoCount(template.frameCount);
            setHasLoadedTemplate(true);
            
            console.log('✅ Template loaded:', template.name);
          }
        } catch (error) {
          console.error('Load template error:', error);
          toast.error('Failed to load template');
        }
      };
      // Load template without blocking
      loadTemplate(templateIdFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, inputMethod]); // Add inputMethod to dependencies

  // Handle page visibility (pause when tab inactive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stream) {
        console.log('👁️ Page hidden, pausing camera...');
        if (videoRef.current) {
          videoRef.current.pause();
        }
      } else if (!document.hidden && stream && videoRef.current) {
        console.log('👁️ Page visible, resuming camera...');
        videoRef.current.play().catch(err => {
          console.error('Resume play error:', err);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stream]);
  
  // Camera initialization effect - START IMMEDIATELY, don't wait for template
  useEffect(() => {
    // Start camera as soon as inputMethod is 'camera' - parallel with template loading
    if (inputMethod === 'camera') {
      console.log('🚀 Camera mode detected - starting camera IMMEDIATELY (parallel with template load)...');
      startCamera();
    }
    
    return () => {
      // Cleanup on unmount or when switching away from camera
      if (stream) {
        console.log('🧹 Cleaning up camera stream...');
        stream.getTracks().forEach((track) => track.stop());
      }
      // Cleanup countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [inputMethod, startCamera]);
  
  // Mount/unmount tracking
  useEffect(() => {
    isMountedRef.current = true;
    console.log('✅ Booth component mounted');
    
    return () => {
      isMountedRef.current = false;
      console.log('❌ Booth component unmounting...');
    };
  }, []);

  // Create session when template and input method are selected (non-blocking)
  useEffect(() => {
    if (selectedTemplate && inputMethod && !sessionId && user) {
      console.log('📋 Creating photo session in background...');
      // Don't await - let it run in background
      createPhotoSession().catch(err => {
        console.warn('Session creation failed (non-critical):', err);
      });
    }
  }, [selectedTemplate, inputMethod, sessionId, user, createPhotoSession]);

  // Apply filter to image using canvas
  const applyFilterToImage = (imageData: string, filter: FilterSettings): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (filterCanvasRef.current) {
          const canvas = filterCanvasRef.current;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            
            // Apply CSS filter using canvas filter property
            const filterString = `
              brightness(${filter.brightness}%)
              contrast(${filter.contrast}%)
              saturate(${filter.saturate}%)
              sepia(${filter.sepia}%)
              grayscale(${filter.grayscale}%)
              hue-rotate(${filter.hueRotate}deg)
              ${filter.blur ? `blur(${filter.blur}px)` : ""}
              ${filter.invert ? `invert(${filter.invert}%)` : ""}
            `;
            
            ctx.filter = filterString;
            ctx.drawImage(img, 0, 0);
            
            // Get filtered image data
            const filteredData = canvas.toDataURL("image/png");
            resolve(filteredData);
          }
        }
      };
      img.src = imageData;
    });
  };

  // Open edit modal
  const handleOpenEditModal = () => {
    setShowEditPanel(!showEditPanel);
  };

  // === STICKER FUNCTIONS ===
  const handleAddSticker = (emoji: string) => {
    // Random position near center to avoid stacking
    const randomOffset = () => Math.random() * 20 - 10; // -10 to +10
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}-${Math.random()}`,
      emoji,
      x: 50 + randomOffset(),
      y: 50 + randomOffset(),
      size: 48,
      rotation: 0,
    };
    setStickers([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleDeleteSticker = (id: string) => {
    setStickers(stickers.filter(s => s.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  const handleStickerDragStart = (id: string) => {
    setDraggingSticker(id);
    setSelectedStickerId(id);
  };

  const handleStickerDragEnd = () => {
    // Clear dragging state with delay to ensure all events processed
    setTimeout(() => {
      setDraggingSticker(null);
    }, 50);
  };

  const handleStickerDragMove = (id: string, event: MouseEvent | TouchEvent) => {
    if (!stickerContainerRef.current) return;
    
    const rect = stickerContainerRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // Skip if drag is at 0,0 (invalid drag event)
    if (clientX === 0 && clientY === 0) return;
    
    // Calculate position relative to container
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Skip if outside container
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;
    
    // Convert to percentage with bounds
    const percentX = Math.max(5, Math.min(95, (x / rect.width) * 100));
    const percentY = Math.max(5, Math.min(95, (y / rect.height) * 100));
    
    // Use requestAnimationFrame to prevent too many updates
    requestAnimationFrame(() => {
      setStickers(prev => prev.map(sticker => 
        sticker.id === id ? { ...sticker, x: percentX, y: percentY } : sticker
      ));
    });
  };

  const handleStickerResize = (id: string, delta: number) => {
    setStickers(prev => prev.map(sticker => {
      if (sticker.id === id) {
        const newSize = Math.max(24, Math.min(120, sticker.size + delta));
        return { ...sticker, size: newSize };
      }
      return sticker;
    }));
  };

  const handleStickerRotate = (id: string, delta: number) => {
    setStickers(prev => prev.map(sticker => {
      if (sticker.id === id) {
        let newRotation = (sticker.rotation + delta) % 360;
        if (newRotation < 0) newRotation += 360;
        return { ...sticker, rotation: newRotation };
      }
      return sticker;
    }));
  };

  // === FRAME CHANGE FUNCTIONS ===
  // Preload templates on mount for instant frame selector
  useEffect(() => {
    const preloadTemplates = async () => {
      if (availableTemplates.length === 0) {
        try {
          const response = await templateAPI.getTemplates({ limit: 50 }) as {
            success: boolean;
            data?: { templates: Template[] };
          };
          
          if (response.success && response.data) {
            setAvailableTemplates(response.data.templates);
            console.log('✅ Templates preloaded:', response.data.templates.length);
          }
        } catch (error) {
          console.error('Failed to preload templates:', error);
        }
      }
    };
    
    preloadTemplates();
  }, []);

  const handleOpenFrameSelector = async () => {
    setShowFrameSelector(true);
    
    // Load public templates if not already loaded
    if (availableTemplates.length === 0) {
      try {
        const response = await templateAPI.getTemplates({ limit: 50 }) as {
          success: boolean;
          data?: { templates: Template[] };
        };
        
        if (response.success && response.data) {
          setAvailableTemplates(response.data.templates);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
        toast.error('Gagal memuat template');
      }
    }

    // Load user's custom frames if logged in
    if (user) {
      try {
        const customFrames = await userFrameAPI.getAll();
        if (customFrames.success && customFrames.data) {
          // Normalize custom frames to match Template interface
          const normalizedFrames = customFrames.data.map((frame: any) => ({
            ...frame,
            category: frame.category || 'User Generated',
            isPremium: false,
            thumbnail: frame.thumbnail || frame.frameUrl,
          }));
          setUserCustomFrames(normalizedFrames);
        } else if (Array.isArray(customFrames)) {
          // If response is already array
          const normalizedFrames = customFrames.map((frame: any) => ({
            ...frame,
            category: frame.category || 'User Generated',
            isPremium: false,
            thumbnail: frame.thumbnail || frame.frameUrl,
          }));
          setUserCustomFrames(normalizedFrames);
        }
      } catch (error) {
        console.error('Failed to load custom frames:', error);
        // Don't show error toast for custom frames since it's optional
      }
    }
  };

  const handleChangeFrame = async (newTemplate: Template) => {
    if (!canvasRef.current || capturedImages.length === 0) {
      toast.error('Tidak ada foto untuk diganti framenya');
      return;
    }

    try {
      // Show loading
      setIsLoading(true);
      toast.loading('Mengganti frame...', { duration: 1000 });

      // Update selected template
      setSelectedTemplate(newTemplate);
      setPhotoCount(newTemplate.frameCount);
      
      // Re-generate composite with new frame
      await regenerateComposite(newTemplate, capturedImages);
      
      setShowFrameSelector(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to change frame:', error);
      setIsLoading(false);
      toast.error('Gagal mengganti frame. Silakan coba lagi.');
    }
  };

  const regenerateComposite = async (template: Template, images: string[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load template frame
    const templateImg = document.createElement('img');
    templateImg.crossOrigin = "anonymous";
    
    await new Promise<void>((resolve, reject) => {
      templateImg.onload = () => resolve();
      templateImg.onerror = () => reject(new Error('Failed to load template'));
      templateImg.src = template.frameUrl;
    });

    // Set canvas size
    canvas.width = templateImg.width;
    canvas.height = templateImg.height;
    setCompositeImageDimensions({ width: templateImg.width, height: templateImg.height });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each photo with filter and proper fitting
    for (let i = 0; i < Math.min(images.length, template.layoutPositions.length); i++) {
      const position = template.layoutPositions[i];
      const photoImg = document.createElement('img');
      
      // Apply filter to image first
      const filteredImageData = await applyFilterToImage(images[i], globalFilter);
      
      await new Promise<void>((resolve) => {
        photoImg.onload = () => {
          // Calculate aspect ratios
          const photoAspect = photoImg.width / photoImg.height;
          const targetAspect = position.width / position.height;
          
          let srcX = 0, srcY = 0, srcWidth = photoImg.width, srcHeight = photoImg.height;
          
          // Crop photo to fit target aspect ratio (cover behavior)
          if (photoAspect > targetAspect) {
            // Photo is wider - crop width
            srcWidth = photoImg.height * targetAspect;
            srcX = (photoImg.width - srcWidth) / 2;
          } else {
            // Photo is taller - crop height
            srcHeight = photoImg.width / targetAspect;
            srcY = (photoImg.height - srcHeight) / 2;
          }
          
          // Draw cropped and fitted photo
          ctx.drawImage(
            photoImg,
            srcX, srcY, srcWidth, srcHeight,  // Source crop
            position.x, position.y, position.width, position.height  // Destination
          );
          resolve();
        };
        photoImg.src = filteredImageData;
      });
    }

    // Draw frame on top
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

    // Get final composite
    const compositeData = canvas.toDataURL("image/png");
    setFinalCompositeImage(compositeData);
  };

  // Apply global filter to all captured images
  const handleApplyGlobalFilter = async (filter: FilterSettings) => {
    setGlobalFilter(filter);
    
    // Re-generate composite with filter applied to photos only
    if (finalCompositeImage && selectedTemplate && canvasRef.current && capturedImages.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return;

      // Load template image first
      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";
      templateImg.src = selectedTemplate.frameUrl;

      templateImg.onload = () => {
        // Set canvas size to EXACT template size
        canvas.width = templateImg.width;
        canvas.height = templateImg.height;

        let loadedPhotos = 0;
        const photoImages: HTMLImageElement[] = [];

        // Load all photos first
        capturedImages.forEach((photoDataUrl, index) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = photoDataUrl;
          
          img.onload = () => {
            photoImages[index] = img;
            loadedPhotos++;

            // When all photos are loaded, composite them with filter
            if (loadedPhotos === capturedImages.length) {
              // Clear canvas completely
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              // Draw WHITE background first
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Apply filter to each photo
              const filterString = `brightness(${filter.brightness}%) contrast(${filter.contrast}%) saturate(${filter.saturate}%) sepia(${filter.sepia}%) grayscale(${filter.grayscale}%) hue-rotate(${filter.hueRotate}deg)`;

              // Draw each photo in its position with filter
              capturedImages.forEach((_, i) => {
                const position = selectedTemplate.layoutPositions[i];
                if (position && photoImages[i]) {
                  const photo = photoImages[i];

                  // Calculate aspect ratio to fit photo in the frame (cover fit)
                  const photoAspect = photo.width / photo.height;
                  const frameAspect = position.width / position.height;

                  let drawWidth, drawHeight, offsetX, offsetY;

                  if (photoAspect > frameAspect) {
                    // Photo is wider - fit by height
                    drawHeight = position.height;
                    drawWidth = drawHeight * photoAspect;
                    offsetX = (drawWidth - position.width) / 2;
                    offsetY = 0;
                  } else {
                    // Photo is taller - fit by width
                    drawWidth = position.width;
                    drawHeight = drawWidth / photoAspect;
                    offsetX = 0;
                    offsetY = (drawHeight - position.height) / 2;
                  }

                  // Save context state
                  ctx.save();

                  // Apply filter to canvas context
                  ctx.filter = filterString;

                  // Create clipping region for the photo area
                  ctx.beginPath();
                  ctx.rect(position.x, position.y, position.width, position.height);
                  ctx.clip();

                  // Draw the photo (centered and covering the area)
                  ctx.drawImage(
                    photo,
                    position.x - offsetX,
                    position.y - offsetY,
                    drawWidth,
                    drawHeight
                  );

                  // Restore context state
                  ctx.restore();
                }
              });

              // Draw template overlay ON TOP of photos (NO FILTER on template)
              ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

              // Get final composite image with filter
              const finalImage = canvas.toDataURL("image/png", 1.0);
              setFinalCompositeImage(finalImage);
              setCompositeImageDimensions({ width: canvas.width, height: canvas.height });
            }
          };

          img.onerror = () => {
            console.error(`Failed to load photo ${index + 1}`);
          };
        });
      };

      templateImg.onerror = () => {
        console.error("Failed to load template for filter");
      };
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Draw video (flipped for mirror effect)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        
        // Save the captured photo (no filter yet)
        const imageData = canvas.toDataURL("image/png");
        
        // USE RETAKE INDEX FROM REF IF RETAKING, OTHERWISE USE CURRENT INDEX
        const targetIndex = retakeIndexRef.current !== null ? retakeIndexRef.current : currentPhotoIndex;
        const isRetaking = retakeIndexRef.current !== null;
        
        console.log(`📸 CAPTURE: Target index: ${targetIndex} (currentPhotoIndex: ${currentPhotoIndex}, retakeIndex: ${retakeIndexRef.current})`);
        console.log(`📊 CAPTURE: Current array:`, capturedImages.map((img, i) => `[${i}]: ${img ? 'HAS_PHOTO' : 'EMPTY'}`));
        
        if (isRetaking) {
          console.log(`🔄 CAPTURE: RETAKING photo at index ${targetIndex}`);
        } else {
          console.log(`➕ CAPTURE: Adding NEW photo at index ${targetIndex}`);
        }
        
        // Always update at the specific targetIndex - don't append
        const newCapturedImages = [...capturedImages];
        newCapturedImages[targetIndex] = imageData;
        setCapturedImages(newCapturedImages);
        console.log(`✅ CAPTURE: Photo stored at index ${targetIndex}`);
        
        // Upload photo to backend
        if (sessionId) {
          try {
            const response = await photoAPI.uploadPhoto({
              sessionId,
              photoUrl: imageData,
              order: targetIndex + 1, // 1-based for backend
              metadata: {
                capturedAt: new Date().toISOString(),
                photoNumber: targetIndex + 1,
                isRetake: isRetaking
              }
            });
            
            // Extract photo ID
            const data = response as { data?: { photo?: { _id: string } }; photo?: { _id: string } };
            const photoId = data.data?.photo?._id || data.photo?._id;
            if (photoId) {
              setUploadedPhotoIds(prev => {
                const newIds = [...prev];
                newIds[targetIndex] = photoId;
                return newIds;
              });
              console.log('✅ Photo uploaded:', photoId);
            }
          } catch (error) {
            console.error('Failed to upload photo:', error);
          }
        }
        
        // Clear retake refs after successful capture
        if (isRetaking) {
          retakeIndexRef.current = null;
          isRetakingPhotoRef.current = false;
          console.log('🧹 CAPTURE: Cleared retake refs');
        }
        
        // Calculate next index: if retaking, check for completion; otherwise increment
        let nextPhotoIndex: number;
        if (isRetaking) {
          // After retake, check if all photos are captured
          const allCaptured = newCapturedImages.every(img => img !== "");
          if (allCaptured) {
            nextPhotoIndex = photoCount; // All done
          } else {
            // Find next empty slot to continue
            const nextEmpty = newCapturedImages.findIndex((img, idx) => idx > targetIndex && img === "");
            nextPhotoIndex = nextEmpty !== -1 ? nextEmpty : photoCount;
          }
          console.log(`🔄 NEXT: After retake at ${targetIndex}, next index: ${nextPhotoIndex}`);
        } else {
          // Normal flow: increment to next
          nextPhotoIndex = targetIndex + 1;
          console.log(`➡️ NEXT: Normal flow from ${targetIndex}, next index: ${nextPhotoIndex}`);
        }
        
        // Check if we've captured all photos
        if (nextPhotoIndex >= photoCount) {
          // All photos captured, auto-create composite and show results
          setAllPhotosCaptured(true);

          // Auto-create composite image after slight delay
          setTimeout(() => {
            createCompositeImage(newCapturedImages);
          }, 500);
        } else {
          // More photos to capture - auto trigger next countdown after 1 second
          setCurrentPhotoIndex(nextPhotoIndex);

          // Auto trigger next capture countdown after 1.5 seconds
          setTimeout(() => {
            setCountdown(3);
            const interval = setInterval(() => {
              setCountdown((prev) => {
                if (prev === 1) {
                  clearInterval(interval);
                  // capturePhoto akan dipanggil recursively
                  capturePhotoAuto();
                  return null;
                }
                return prev! - 1;
              });
            }, 1000);
          }, 1500);
        }
      }
    }
  };

  // Helper function untuk auto-capture (recursive)
  const capturePhotoAuto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Draw video (flipped for mirror effect)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        
        // Save the captured photo
        const imageData = canvas.toDataURL("image/png");
        
        // Update state with callback to handle next step
        setCapturedImages((prevImages) => {
          let newCapturedImages: string[];
          const photoIdx = prevImages.length; // Use actual length instead of currentPhotoIndex
          
          if (photoIdx < prevImages.length) {
            newCapturedImages = [...prevImages];
            newCapturedImages[photoIdx] = imageData;
          } else {
            newCapturedImages = [...prevImages, imageData];
          }
          
          // Upload photo to backend
          if (sessionId) {
            photoAPI.uploadPhoto({
              sessionId,
              photoUrl: imageData,
              order: photoIdx,
              metadata: {
                capturedAt: new Date().toISOString(),
                photoNumber: photoIdx + 1,
              }
            }).catch((error) => {
              console.error('Failed to upload photo:', error);
            });
          }
          
          // Schedule next capture or finish
          const nextPhotoIdx = photoIdx + 1;
          if (nextPhotoIdx >= photoCount) {
            // All photos captured - directly create composite (skip intermediate state)
            setTimeout(() => {
              createCompositeImage(newCapturedImages);
            }, 500);
          } else {
            // Schedule next capture
            setCurrentPhotoIndex(nextPhotoIdx);

            
            setTimeout(() => {
              setCountdown(3);
              const interval = setInterval(() => {
                setCountdown((prev) => {
                  if (prev === 1) {
                    clearInterval(interval);
                    capturePhotoAuto();
                    return null;
                  }
                  return prev! - 1;
                });
              }, 1000);
            }, 1500);
          }
          
          return newCapturedImages;
        });
      }
    }
  };

  const createCompositeImage = (photos: string[]) => {
    console.log('🎯 Starting composite...');
    console.log('📸 Photos count:', photos.length);
    console.log('🖼️ Template:', selectedTemplate?.name);
    console.log('📋 Template category:', selectedTemplate?.category);
    console.log('🔍 LayoutPositions:', selectedTemplate?.layoutPositions);

    if (!selectedTemplate || !canvasRef.current) {
      toast.error("No template selected!");
      return;
    }

    // Validate layoutPositions
    if (!selectedTemplate.layoutPositions || selectedTemplate.layoutPositions.length === 0) {
      console.error('❌ Template has no layoutPositions!');
      toast.error("Template configuration error. Please choose another template.");
      return;
    }

    if (photos.length !== selectedTemplate.frameCount) {
      console.warn(`⚠️ Photo count mismatch: ${photos.length} photos but template expects ${selectedTemplate.frameCount}`);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      console.error('❌ Canvas context not found!');
      toast.error("Canvas error. Please try again.");
      return;
    }

    // Load template image first
    const templateImg = new Image();
    templateImg.crossOrigin = "anonymous";
    templateImg.src = selectedTemplate.frameUrl;

    console.log('📦 Loading template from:', selectedTemplate.frameUrl.substring(0, 100) + '...');

    templateImg.onerror = (error) => {
      console.error('❌ Failed to load template:', error);
      toast.error("Failed to load template. Please try another template.");
    };

    templateImg.onload = () => {
      console.log('✅ Template loaded!', templateImg.width, 'x', templateImg.height);
      
      // Set canvas size to EXACT template size
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;

      console.log('📐 Canvas size set to:', canvas.width, 'x', canvas.height);

      let loadedPhotos = 0;
      const photoImages: HTMLImageElement[] = [];

      // Load all photos first
      photos.forEach((photoDataUrl, index) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = photoDataUrl;
        
        img.onerror = (error) => {
          console.error(`❌ Failed to load photo ${index + 1}:`, error);
          toast.error(`Failed to load photo ${index + 1}`);
        };
        
        img.onload = () => {
          console.log(`✅ Photo ${index + 1} loaded:`, img.width, 'x', img.height);
          photoImages[index] = img;
          loadedPhotos++;

          // When all photos are loaded, composite them
          if (loadedPhotos === photos.length) {
            console.log('🎨 All photos loaded, starting composite...');

            // Clear canvas completely
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // STEP 1: Draw WHITE background first
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            console.log('⬜ White background drawn');

            // STEP 2: Draw each photo in its position (BEHIND template)
            console.log(`🎨 Drawing ${photos.length} photos using ${selectedTemplate.layoutPositions.length} positions`);
            
            photos.forEach((_, i) => {
              const position = selectedTemplate.layoutPositions[i];
              
              if (!position) {
                console.warn(`⚠️ No position data for photo ${i + 1}`);
                return;
              }
              
              if (!photoImages[i]) {
                console.warn(`⚠️ Photo ${i + 1} not loaded`);
                return;
              }
              
              const photo = photoImages[i];
              console.log(`📍 Drawing photo ${i + 1} at position:`, position);

              // Calculate aspect ratio to fit photo in the frame (cover fit)
              const photoAspect = photo.width / photo.height;
              const frameAspect = position.width / position.height;

              let drawWidth, drawHeight, offsetX, offsetY;

              if (photoAspect > frameAspect) {
                // Photo is wider - fit by height
                drawHeight = position.height;
                drawWidth = drawHeight * photoAspect;
                offsetX = (drawWidth - position.width) / 2;
                offsetY = 0;
              } else {
                // Photo is taller - fit by width
                drawWidth = position.width;
                drawHeight = drawWidth / photoAspect;
                offsetX = 0;
                offsetY = (drawHeight - position.height) / 2;
              }

              console.log(`📸 Photo ${i + 1} aspect: ${photoAspect.toFixed(2)}, frame aspect: ${frameAspect.toFixed(2)}, draw: ${drawWidth.toFixed(0)}x${drawHeight.toFixed(0)}, offset: (${offsetX.toFixed(0)}, ${offsetY.toFixed(0)})`);

              // Save context state
              ctx.save();

              // Create clipping region for the photo area
              ctx.beginPath();
              ctx.rect(position.x, position.y, position.width, position.height);
              ctx.clip();

              // Draw the photo (centered and covering the area)
              ctx.drawImage(
                photo,
                position.x - offsetX,
                position.y - offsetY,
                drawWidth,
                drawHeight
              );

              // Restore context state
              ctx.restore();

              console.log(`✅ Photo ${i + 1} drawn at x:${position.x}, y:${position.y}, w:${position.width}, h:${position.height}`);
            });

            // STEP 3: Draw template overlay ON TOP of photos
            let finalImage: string;
            try {
              ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
              console.log('🖼️ Template overlay drawn on top');

              // Get final composite image
              finalImage = canvas.toDataURL("image/png", 1.0);
              setFinalCompositeImage(finalImage);
              setCompositeImageDimensions({ width: canvas.width, height: canvas.height });
              console.log('🎉 Composite complete! Size:', canvas.width, 'x', canvas.height);
            } catch (error) {
              console.error('❌ Error creating composite:', error);
              toast.error("Failed to create photo strip. Please try again.");
              return;
            }
            
            // Auto-save to gallery if user is logged in
            if (user && sessionId) {
              console.log('💾 Auto-saving to gallery...');

              
              // Auto-save after short delay
              setTimeout(async () => {
                try {
                  setIsSaving(true);
                  
                  const response = await compositeAPI.uploadCompositeImage(
                    finalImage,
                    sessionId,
                    selectedTemplate?._id
                  );

                  console.log('✅ Auto-saved to gallery:', response);
                  setIsSaving(false);
                  

                } catch (error) {
                  console.error('❌ Auto-save failed:', error);
                  setIsSaving(false);
                  toast.error('Failed to auto-save. Use Download button to save to device.', {
                    duration: 4000,
                  });
                }
              }, 500);
            } else {
              // User not logged in - just show download option

            }
          }
        };

        img.onerror = () => {
          console.error(`❌ Failed to load photo ${index + 1}`);
          toast.error(`Failed to load photo ${index + 1}`);
        };
      });
    };

    templateImg.onerror = () => {
      console.error('❌ Failed to load template from:', selectedTemplate.frameUrl);
      toast.error("Failed to load template. Please try again.");
    };
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsLoading(true);
      const uploadedImages: string[] = [];

      // Calculate how many more photos we can accept
      const remainingSlots = photoCount - capturedImages.length;
      const filesToProcess = Math.min(files.length, remainingSlots);

      console.log(`📸 Uploading ${filesToProcess} files (${remainingSlots} slots remaining out of ${photoCount})`);
      console.log(`Current photos: ${capturedImages.length}, Will upload: ${filesToProcess}`);

      // Convert files to base64 for preview
      for (let i = 0; i < filesToProcess; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        // Read file as base64
        const reader = new FileReader();
        const imageData = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });

        uploadedImages.push(imageData);
        console.log(`✅ Processed image ${i + 1}/${filesToProcess}: ${file.name}`);
      }

      if (uploadedImages.length === 0) {
        toast.error('No valid images selected');
        setIsLoading(false);
        return;
      }

      console.log(`✅ Successfully processed ${uploadedImages.length} images`);

      // Append to captured images (not replace)
      const newCapturedImages = [...capturedImages, ...uploadedImages];
      setCapturedImages(newCapturedImages);
      setCurrentPhotoIndex(newCapturedImages.length);
      
      // Upload to backend
      if (sessionId) {
        const uploadPromises = uploadedImages.map(async (imageData, index) => {
          const response = await photoAPI.uploadPhoto({
            sessionId,
            photoUrl: imageData, // base64 string
            order: capturedImages.length + index + 1,
            metadata: {
              source: 'upload',
              uploadedAt: new Date().toISOString()
            }
          });
          // Type assertion for response
          const data = response as { data?: { _id?: string } };
          return data.data?._id || '';
        });

        const photoIds = await Promise.all(uploadPromises);
        setUploadedPhotoIds([...uploadedPhotoIds, ...photoIds]);
      }

      // Check if all photos are uploaded
      if (newCapturedImages.length >= photoCount) {
        setAllPhotosCaptured(true);
      } else {
        const remaining = photoCount - newCapturedImages.length;
      }

      // Warn if user selected more files than available slots
      if (files.length > remainingSlots) {
        toast(`⚠️ Only ${remainingSlots} slots available. ${files.length - remainingSlots} file(s) skipped.`, {
          duration: 4000,
          icon: '⚠️'
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRetake = () => {
    // Stop existing camera stream first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    
    setCapturedImages([]);
    setFinalCompositeImage(null);
    setCurrentPhotoIndex(0);
    setCountdown(null);
    setUploadedPhotoIds([]);
    setAllPhotosCaptured(false);
    setGlobalFilter(FILTER_PRESETS.none);
    setShowEditPanel(false);
    
    // Create new session for retake (only if template exists)
    if (selectedTemplate) {
      console.log('🔄 Retaking photos, creating new session...');
      createPhotoSession();
    }
    
    // Restart camera for camera mode
    if (inputMethod === 'camera') {
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  };

  // Manual save composite to gallery
  const handleSaveToGallery = async () => {
    if (!finalCompositeImage) {
      toast.error('No photo to save. Please create composite first.');
      return;
    }

    // Check if user is logged in first
    if (!user) {
      console.warn('⚠️ User not logged in, saving state for later...');
      
      // Save current state to sessionStorage sebelum login
      sessionStorage.setItem('booth_pending_save', JSON.stringify({
        finalCompositeImage,
        templateId: selectedTemplate?._id,
        capturedImages,
        timestamp: Date.now()
      }));
      
      toast.error('Please login to save photos to your gallery', {
        duration: 4000,
        icon: '🔒',
      });
      setTimeout(() => {
        navigate('/login', { state: { from: '/booth' } });
      }, 1500);
      return;
    }

    // If no session ID, try to create one as fallback
    if (!sessionId) {
      console.warn('⚠️ Session ID not available, trying to create session...');
      
      // Try to create session if we have a template
      if (selectedTemplate) {
        await createPhotoSession();
        // Wait a bit for session to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // If still no session after retry, show error
      if (!sessionId) {
        console.error('❌ Cannot create session for auto-save');
        toast.error('Cannot save to gallery - Not logged in. Use Download button to save to device.', {
          duration: 5000,
          icon: '⚠️',
        });
        return;
      }
    }

    try {
      console.log('💾 Saving composite to gallery...');
      console.log('📋 Session ID:', sessionId);
      console.log('🖼️ Template:', selectedTemplate?.name);
      
      setIsSaving(true);
      
      // Upload composite image as file (not base64 string)
      const response = await compositeAPI.uploadCompositeImage(
        finalCompositeImage,
        sessionId,
        selectedTemplate?._id
      );

      console.log('✅ Composite saved to gallery:', response);
      
      setIsSaving(false);
      
      // Clear pending save state
      sessionStorage.removeItem('booth_pending_save');
      
      // Show success notification

      
      // Navigate to gallery after short delay
      setTimeout(() => {
        navigate('/my-gallery');
      }, 1500);
    } catch (error) {
      console.error('❌ Save to gallery failed:', error);
      setIsSaving(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      
      // Show error notification but allow user to continue
      toast.error('Failed to save to gallery. Try again or download to device.', {
        duration: 5000,
        icon: '❌',
      });
    }
  };



  // Retake a specific photo
  const handleRetakePhoto = (photoIndex: number) => {
    console.log(`🔄 RETAKE: Starting retake for photo at index ${photoIndex}`);
    console.log(`📊 RETAKE: Current array before clear:`, capturedImages.map((img, i) => `[${i}]: ${img ? 'HAS_PHOTO' : 'EMPTY'}`));
    
    // Clear any existing countdown/intervals first
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    
    // Clear only that specific photo, maintaining array structure
    const updatedImages = [...capturedImages];
    updatedImages[photoIndex] = ""; // Mark as empty/to be retaken, don't remove
    setCapturedImages(updatedImages);
    console.log(`🗑️ RETAKE: Cleared photo at index ${photoIndex}`, updatedImages.map((img, i) => `[${i}]: ${img ? 'HAS_PHOTO' : 'EMPTY'}`));
    
    // Update uploaded photo IDs similarly - keep array structure
    const updatedIds = [...uploadedPhotoIds];
    updatedIds[photoIndex] = ""; // Mark as empty
    setUploadedPhotoIds(updatedIds.filter(id => id !== "")); // Only keep actual IDs
    
    // Clear the composite and UI state - HIDE IMMEDIATELY
    setFinalCompositeImage(null);
    setAllPhotosCaptured(false);
    setShowEditPanel(false);
    setShowRetakeOptions(false);
    
    // IMPORTANT: Set currentPhotoIndex to the photo we want to retake
    setCurrentPhotoIndex(photoIndex);
    
    // CRITICAL: Store in ref to ensure capturePhoto uses correct index immediately
    retakeIndexRef.current = photoIndex;
    isRetakingPhotoRef.current = true;
    
    console.log(`✅ RETAKE: Set retakeIndexRef to ${photoIndex}`);
    


    // Restart camera - stop current stream and start fresh
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
    
    // Give browser time to release stream, then restart camera
    // Don't manually call handleCapture - let startCamera do it
    setTimeout(() => {
      startCamera();
    }, 500);
  };

  // Save final composite to backend
  const handleSaveComposite = async () => {
    if (!finalCompositeImage || !sessionId) {
      toast.error('No photo to save or session not found');
      return;
    }

    setIsSaving(true);
    try {
      await compositeAPI.createComposite({
        sessionId,
        compositeUrl: finalCompositeImage,
        templateId: selectedTemplate?._id,
        isPublic: false, // Default to private, user can change later
        metadata: {
          photoCount,
          templateName: selectedTemplate?.name,
          createdAt: new Date().toISOString(),
        }
      });

      // Update session status to completed
      if (sessionId) {
        await sessionAPI.updateSession(sessionId, {
          status: 'completed',
          metadata: {
            completedAt: new Date().toISOString(),
            photosCount: uploadedPhotoIds.length,
          }
        });
      }

  
      
      // Redirect to PhotoSessions page after 1.5 seconds
      setTimeout(() => {
        navigate('/booth/sessions');
      }, 1500);
    } catch (error) {
      console.error('Failed to save composite:', error);
      toast.error('Failed to save photo strip. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStickersToCanvas = async (baseImage: string): Promise<string> => {
    if (stickers.length === 0) return baseImage;
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(baseImage);
        return;
      }

      const img = document.createElement('img');
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw base image
        ctx.drawImage(img, 0, 0);

        // Get container dimensions for consistent scaling
        const containerRect = stickerContainerRef.current?.getBoundingClientRect();
        const containerWidth = containerRect?.width || 800;
        const containerHeight = containerRect?.height || 600;
        
        // Draw stickers with EXACT same positioning as preview
        stickers.forEach(sticker => {
          // Use exact same percentage calculation
          const x = (sticker.x / 100) * canvas.width;
          const y = (sticker.y / 100) * canvas.height;
          
          // Calculate scale factor but use SQUARE ROOT to prevent oversizing
          // If canvas is 4x bigger (2400px vs 600px), sqrt(4) = 2x sticker size
          // This keeps visual proportions correct without making stickers too large
          const scaleRatio = Math.min(canvas.width / containerWidth, canvas.height / containerHeight);
          const adjustedScale = Math.sqrt(scaleRatio); // Square root for balanced scaling
          const fontSize = sticker.size * adjustedScale;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((sticker.rotation * Math.PI) / 180);
          
          // Better font rendering
          ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Add shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.fillText(sticker.emoji, 0, 0);
          ctx.restore();
        });

        resolve(canvas.toDataURL('image/png', 1.0));
      };
      img.onerror = () => {
        console.error('Failed to load image for sticker rendering');
        resolve(baseImage);
      };
      img.src = baseImage;
    });
  };

  const handleDownload = async () => {
    if (!finalCompositeImage) {
      toast.error("No photo to download. Please take photos first.");
      return;
    }

    // Check if template is premium and user not logged in
    if (selectedTemplate?.isPremium && !user) {
      toast.error("Please login to download premium frame photos", {
        duration: 4000,
        icon: '🔒',
      });
      sessionStorage.setItem('booth_pending_download', JSON.stringify({
        finalCompositeImage,
        templateId: selectedTemplate?._id,
        timestamp: Date.now()
      }));
      setTimeout(() => {
        navigate('/login', { state: { from: '/booth' } });
      }, 1500);
      return;
    }
    
    try {
      // Render stickers to image
      const imageWithStickers = stickers.length > 0 
        ? await renderStickersToCanvas(finalCompositeImage)
        : finalCompositeImage;

      const link = document.createElement("a");
      link.href = imageWithStickers;
      link.download = `pixelplayground-photo-strip-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      

      
      console.log('✅ Photo downloaded successfully');
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error("Failed to download. Please try again.", {
        duration: 3000,
      });
    }
  };

  const handleShare = async () => {
    if (!finalCompositeImage) {
      toast.error("No photo to share. Please take photos first.");
      return;
    }

    // Check if template is premium and user not logged in
    if (selectedTemplate?.isPremium && !user) {
      toast.error('Please login to share premium frame photos', {
        duration: 4000,
        icon: '🔒',
      });
      sessionStorage.setItem('booth_pending_share', JSON.stringify({
        finalCompositeImage,
        templateId: selectedTemplate?._id,
        timestamp: Date.now()
      }));
      setTimeout(() => {
        navigate('/login', { state: { from: '/booth' } });
      }, 1500);
      return;
    }
    
    try {
      const blob = await (await fetch(finalCompositeImage)).blob();
      const file = new File([blob], "pixelplayground-photo-strip.png", { type: "image/png" });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My PixelPlayground Photo Strip",
          text: "Check out my photo strip from PixelPlayground!",
        });

      } else {
        // Fallback: Copy image data URL to clipboard
        await navigator.clipboard.writeText(finalCompositeImage);

      }
    } catch (error) {
      console.error("❌ Share error:", error);
      toast.error("Could not share. Use Download button instead.", {
        duration: 3000,
      });
    }
  };

  const handleShareToWhatsApp = async () => {
    if (!finalCompositeImage) {
      toast.error("No photo to share. Please take photos first.");
      return;
    }
    
    try {
      // Render stickers to image first
      const imageWithStickers = stickers.length > 0 
        ? await renderStickersToCanvas(finalCompositeImage)
        : finalCompositeImage;

      const blob = await (await fetch(imageWithStickers)).blob();
      const file = new File([blob], "pixelplayground-photo-strip.png", { type: "image/png" });
      
      // Try native share API first (works best on mobile)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        console.log('📱 Using native Web Share API');
        await navigator.share({
          files: [file],
          title: "My PixelPlayground Photo Strip",
          text: "Check out my photo strip from PixelPlayground! 📸✨",
        });
        toast.success("Photo shared successfully!", { duration: 2000 });

      } else {
        // Fallback: Download & suggest WhatsApp
        console.log('📱 Using WhatsApp Web fallback');
        
        // Create download link for the image
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pixelplayground-photo-strip-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Open WhatsApp Web
        setTimeout(() => {
          window.open('https://web.whatsapp.com/', '_blank');
          toast.success("Image downloaded! Open WhatsApp to share it.", { duration: 3000 });
        }, 500);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("❌ WhatsApp share error:", error);
        toast.error("Could not share. Please try again.", {
          duration: 3000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
            Photo Booth
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Strike a pose and capture your perfect moment!
          </p>
        </motion.div>

        {/* Selected Template Info or Browse Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          {selectedTemplate ? (
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={selectedTemplate.thumbnail}
                        alt={selectedTemplate.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-primary/20"
                      />
                      {selectedTemplate.isPremium && (
                        <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0 bg-amber-500 text-white border-0 shadow-lg">
                          <Sparkles className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-lg text-white flex items-center gap-2">
                        {selectedTemplate.name}
                        {inputMethod && (
                          <Badge variant="secondary" className="text-xs">
                            {inputMethod === 'camera' ? (
                              <>
                                <Camera className="w-3 h-3 mr-1" />
                                Camera
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3 mr-1" />
                                Upload
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.category} Template • {photoCount} photos needed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Back Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (finalCompositeImage) {
                          // If photo is done, ask for confirmation
                          if (confirm('Go back? Your current photo will be lost if not saved.')) {
                            navigate(-1);
                          }
                        } else {
                          navigate(-1);
                        }
                      }}
                      className="rounded-full hover:bg-secondary"
                      title="Go back"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </Button>

                    {/* Unified Template/Mode Selector */}
                    <div className="relative group">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                      >
                        Change Settings
                        <ArrowRight className="w-3 h-3 ml-1 rotate-90 group-hover:translate-y-0.5 transition-transform" />
                      </Button>
                      
                      {/* Dropdown Menu */}
                      <div className="hidden group-hover:block absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-xl min-w-[200px] z-50">
                        <div className="py-2">
                          <button
                            onClick={() => navigate('/gallery')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                          >
                            <Shapes className="w-4 h-4" />
                            Change Template
                          </button>
                          {inputMethod && selectedTemplate && (
                            <button
                              onClick={() => navigate(`/input-method?template=${selectedTemplate._id}`)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                            >
                              <Camera className="w-4 h-4" />
                              Change Input Mode
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="gradient-card shadow-soft border-dashed border-2 border-primary/30">
              <CardContent className="p-8 text-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-heading font-semibold text-white mb-2">
                  No Template Selected
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Browse our beautiful template collection and choose one to add a professional touch to your photo
                </p>
                <Button
                  onClick={() => navigate('/gallery')}
                  className="bg-primary hover:bg-primary/90 rounded-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Browse Templates
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Or continue without a template for a plain photo
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* LAYOUT: 3-Column Grid (Result | Preview | Actions) - Only when photo is done */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={finalCompositeImage 
            ? "grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-6 items-start"
            : "max-w-5xl mx-auto"
          }
        >
          {/* LEFT SIDEBAR: Photo Result Info (only show when final composite exists) */}
          {finalCompositeImage && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block"
            >
              <Card className="gradient-card border-0 shadow-soft sticky top-24">
                <CardContent className="p-6 space-y-6">
                  {/* Result Preview */}
                  <div>
                    <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                      Final Result
                    </h3>
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-primary/50 shadow-lg">
                      <img
                        src={finalCompositeImage}
                        alt="Final Photo Strip"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-white text-xs px-2 py-1 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Ready
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  {selectedTemplate && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        Template
                      </h4>
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedTemplate.thumbnail}
                          alt={selectedTemplate.name}
                          className="w-12 h-12 rounded-lg object-cover border border-border"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{selectedTemplate.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedTemplate.category}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Session Info - Improved */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Session Info
                    </h4>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Template</span>
                        <span className="font-semibold text-foreground">{selectedTemplate?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Photos</span>
                        <span className="font-semibold text-foreground">{capturedImages.filter(img => img !== '').length} of {selectedTemplate?.frameCount} ✓</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Stickers</span>
                        <span className="font-semibold text-foreground">{stickers.length} {stickers.length === 1 ? 'item' : 'items'}</span>
                      </div>
                      {globalFilter.name !== 'None' && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Filter</span>
                          <span className="font-semibold text-foreground capitalize">{globalFilter.name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-semibold text-foreground">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Auto-saved indicator - Compact */}
                  {user && (
                    <div className="pt-3">
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1.5 rounded-md">
                        <Check className="w-3 h-3" />
                        <span className="font-medium">Saved</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* CENTER: Main Preview Area */}
          <Card className="gradient-card border-0 shadow-hover overflow-hidden">
            <CardContent className="p-6 lg:p-8">
              <div className={`relative bg-secondary rounded-2xl overflow-hidden ${
                finalCompositeImage ? 'aspect-[3/4] lg:aspect-[2/3]' : 'aspect-video'
              }`}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Initializing camera...</p>
                    </div>
                  </div>
                )}

                {countdown !== null && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20"
                  >
                    <motion.div
                      key={countdown}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="text-9xl font-heading font-bold text-primary"
                    >
                      {countdown}
                    </motion.div>
                  </motion.div>
                )}

                {finalCompositeImage ? (
                  <div className="relative w-full h-full overflow-hidden bg-white group cursor-pointer"
                    onClick={() => setShowFullscreenPreview(true)}
                    title="Click to view fullscreen"
                  >
                    {/* Fullscreen Overlay Hint */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 z-10 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-4 shadow-xl">
                        <ZoomIn className="w-8 h-8 text-gray-800" />
                      </div>
                    </div>

                    <img
                      src={finalCompositeImage}
                      alt="Final Photo Strip"
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Sticker Overlay - with proper ref */}
                    <div 
                      ref={stickerContainerRef}
                      className="absolute inset-0"
                      style={{ zIndex: 30, pointerEvents: 'none' }}
                      onClick={() => setSelectedStickerId(null)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggingSticker) {
                          handleStickerDragMove(draggingSticker, e.nativeEvent);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleStickerDragEnd();
                      }}
                    >
                      {stickers.map(sticker => (
                        <div
                          key={sticker.id}
                          style={{
                            position: 'absolute',
                            left: `${sticker.x}%`,
                            top: `${sticker.y}%`,
                            transform: `translate(-50%, -50%)`,
                            zIndex: selectedStickerId === sticker.id ? 100 : 50,
                            pointerEvents: 'auto',
                          }}
                        >
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', sticker.id);
                              handleStickerDragStart(sticker.id);
                              // Hide ghost image to prevent duplication visual
                              const ghost = document.createElement('div');
                              ghost.style.opacity = '0';
                              document.body.appendChild(ghost);
                              e.dataTransfer.setDragImage(ghost, 0, 0);
                              setTimeout(() => document.body.removeChild(ghost), 0);
                            }}
                            onDragEnd={(e) => {
                              e.preventDefault();
                              handleStickerDragEnd();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStickerId(sticker.id);
                            }}
                            style={{
                              fontSize: `${sticker.size}px`,
                              lineHeight: 1,
                              cursor: draggingSticker === sticker.id ? 'grabbing' : 'grab',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              transform: `rotate(${sticker.rotation}deg)`,
                              transition: draggingSticker === sticker.id ? 'none' : 'transform 0.2s ease',
                              filter: selectedStickerId === sticker.id ? 'drop-shadow(0 0 8px rgba(255,0,0,0.5))' : 'none',
                              padding: '8px',
                              display: 'inline-block',
                              pointerEvents: 'auto',
                            }}
                            className={selectedStickerId === sticker.id ? 'ring-2 ring-red-500 rounded-lg bg-white/10' : ''}
                          >
                            {sticker.emoji}
                          </div>
                          
                          {/* Control buttons - only show when selected */}
                          {selectedStickerId === sticker.id && (
                            <div 
                              className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-1 bg-black/90 rounded-full p-1.5 shadow-lg"
                              style={{ pointerEvents: 'auto' }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStickerResize(sticker.id, -8);
                                }}
                                className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full text-white text-sm font-bold transition-colors"
                                title="Smaller"
                              >
                                −
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStickerResize(sticker.id, 8);
                                }}
                                className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full text-white text-sm font-bold transition-colors"
                                title="Bigger"
                              >
                                +
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStickerRotate(sticker.id, -15);
                                }}
                                className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full text-white text-xs transition-colors"
                                title="Rotate Left"
                              >
                                ↺
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStickerRotate(sticker.id, 15);
                                }}
                                className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full text-white text-xs transition-colors"
                                title="Rotate Right"
                              >
                                ↻
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSticker(sticker.id);
                                }}
                                className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full text-white text-xs transition-colors"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Auto-saved indicator */}
                    <div className="absolute top-4 left-4 bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Auto-saved to Gallery
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                      style={{ minHeight: '400px' }}
                    />
                    {/* Photo Progress Indicator */}
                    {selectedTemplate && (
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-full px-6 py-3">
                        <span className="text-white font-semibold">
                          Photo {currentPhotoIndex + 1} of {photoCount}
                        </span>
                        <div className="flex gap-2">
                          {Array.from({ length: photoCount }).map((_, index) => (
                            <div
                              key={index}
                              className={`w-3 h-3 rounded-full transition-all ${
                                index < capturedImages.length
                                  ? "bg-green-500"
                                  : index === currentPhotoIndex
                                  ? "bg-primary animate-pulse"
                                  : "bg-gray-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
                <canvas ref={filterCanvasRef} className="hidden" />
              </div>

              {/* Uploaded Photos Preview - Show when some photos uploaded but not complete */}
              {capturedImages.length > 0 && !allPhotosCaptured && !finalCompositeImage && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      Uploaded Photos ({capturedImages.length}/{photoCount})
                    </h3>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {capturedImages.map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-secondary">
                        <img
                          src={image}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                    {/* Empty slots */}
                    {Array.from({ length: photoCount - capturedImages.length }).map((_, index) => (
                      <div key={`empty-${index}`} className="relative aspect-square rounded-lg border-2 border-dashed border-border bg-secondary/50 flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-muted-foreground/50 mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground/50">{capturedImages.length + index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT SIDEBAR: Action Buttons - Simple & Clean (Separate Column) */}
          {finalCompositeImage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="hidden lg:block"
                >
                  <Card className="gradient-card border-0 shadow-soft sticky top-24">
                    <CardContent className="p-6 space-y-3">
                      {/* Header */}
                      <div className="mb-4">
                        <h2 className="font-heading font-bold text-lg mb-1 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          Quick Actions
                        </h2>
                        <p className="text-xs text-muted-foreground">What would you like to do next?</p>
                      </div>

                      {/* PRIMARY ACTION - Download */}
                      <Button
                        onClick={handleDownload}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all py-7 text-base font-bold group"
                      >
                        <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Download Photo
                      </Button>

                      {/* SECONDARY ACTIONS */}
                      <Button
                        onClick={handleShareToWhatsApp}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all py-5 font-semibold"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Photo
                      </Button>

                      <Button
                        onClick={() => setShowEditPanel(true)}
                        variant="outline"
                        className="w-full border-2 border-primary/50 hover:bg-primary/10 hover:border-primary text-primary transition-all py-5 font-semibold"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Edit Photo
                      </Button>

                      <div className="border-t border-border my-4"></div>

                      {/* RETAKE ACTION */}
                      <Button
                        onClick={() => setShowStartOverConfirm(true)}
                        variant="outline"
                        className="w-full border-2 border-destructive/40 hover:bg-destructive/10 hover:border-destructive text-destructive transition-all py-4"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Start Over
                      </Button>

                      {/* Optional: View Gallery Link */}
                      {user && (
                        <button
                          onClick={() => navigate('/my-gallery')}
                          className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-2 flex items-center justify-center gap-1"
                        >
                          <ImageIcon className="w-3 h-3" />
                          View My Gallery
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
        </motion.div>

        {/* EDIT MODAL - Enhanced Split Screen with Dark Theme */}
        <AnimatePresence>
          {finalCompositeImage && showEditPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4"
              onClick={() => setShowEditPanel(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-[#1a1a1a] rounded-2xl border border-gray-800 max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header - Dark Theme */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-800 bg-[#202020] flex-shrink-0">
                  <div>
                    <h2 className="text-lg md:text-xl font-heading font-bold flex items-center gap-2 text-white">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      Photo Editor
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Live preview • All changes are instant</p>
                  </div>
                  <button
                    onClick={() => setShowEditPanel(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                    title="Close (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Split Screen Content */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  {/* LEFT: Live Preview Area (65%) */}
                  <div className="flex-1 md:w-[65%] p-3 md:p-6 bg-[#2d2d2d] flex flex-col items-center justify-center overflow-auto relative">
                    {/* Zoom Controls - Vertical Layout */}
                    <div className="absolute top-4 right-4 bg-[#1a1a1a] border border-gray-700 rounded-full px-2 py-2.5 shadow-2xl z-10">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => setPreviewZoom(prev => Math.min(2, prev + 0.1))}
                          className="p-1 hover:bg-gray-700 rounded-full text-white transition-colors"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={previewZoom * 100}
                          onChange={(e) => setPreviewZoom(Number(e.target.value) / 100)}
                          className="h-20 w-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 [writing-mode:vertical-lr] rotate-180"
                          title="Zoom Slider"
                        />
                        
                        <div className="text-[10px] text-gray-400 font-mono text-center">
                          {Math.round(previewZoom * 100)}%
                        </div>
                        
                        <button
                          onClick={() => setPreviewZoom(prev => Math.max(0.5, prev - 0.1))}
                          className="p-1 hover:bg-gray-700 rounded-full text-white transition-colors"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="h-px w-4 bg-gray-700"></div>
                        
                        <button
                          onClick={() => setPreviewZoom(1)}
                          className="px-1.5 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors text-[10px] font-bold"
                          title="Reset to 100%"
                        >
                          1:1
                        </button>
                      </div>
                    </div>

                    <div className="relative max-w-md w-full">
                      <div 
                        className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl bg-[#1a1a1a] transition-transform duration-200"
                        style={{ 
                          transform: `scale(${previewZoom})`,
                          transformOrigin: 'center center'
                        }}
                      >
                        <img
                          src={finalCompositeImage}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        
                        {/* Stickers Overlay on Preview - Interactive */}
                        <div 
                          ref={stickerContainerRef}
                          className="absolute inset-0"
                          style={{ pointerEvents: 'none' }}
                          onClick={() => setSelectedStickerId(null)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (draggingSticker) {
                              handleStickerDragMove(draggingSticker, e.nativeEvent);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleStickerDragEnd();
                          }}
                        >
                          {stickers.map(sticker => (
                            <div
                              key={sticker.id}
                              style={{
                                position: 'absolute',
                                left: `${sticker.x}%`,
                                top: `${sticker.y}%`,
                                transform: `translate(-50%, -50%)`,
                                zIndex: selectedStickerId === sticker.id ? 100 : 50,
                                pointerEvents: 'auto',
                              }}
                            >
                              <div
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = 'move';
                                  handleStickerDragStart(sticker.id);
                                  const ghost = document.createElement('div');
                                  ghost.style.opacity = '0';
                                  document.body.appendChild(ghost);
                                  e.dataTransfer.setDragImage(ghost, 0, 0);
                                  setTimeout(() => document.body.removeChild(ghost), 0);
                                }}
                                onDragEnd={(e) => {
                                  e.preventDefault();
                                  handleStickerDragEnd();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStickerId(sticker.id);
                                }}
                                style={{
                                  fontSize: `${sticker.size}px`,
                                  lineHeight: 1,
                                  cursor: draggingSticker === sticker.id ? 'grabbing' : 'grab',
                                  userSelect: 'none',
                                  WebkitUserSelect: 'none',
                                  transform: `rotate(${sticker.rotation}deg)`,
                                  transition: draggingSticker === sticker.id ? 'none' : 'transform 0.2s ease',
                                  filter: selectedStickerId === sticker.id ? 'drop-shadow(0 0 8px rgba(255,0,0,0.5))' : 'none',
                                  padding: '8px',
                                  display: 'inline-block',
                                  pointerEvents: 'auto',
                                }}
                                className={selectedStickerId === sticker.id ? 'ring-2 ring-red-500 rounded-lg bg-white/10' : ''}
                              >
                                {sticker.emoji}
                              </div>
                              
                              {selectedStickerId === sticker.id && (
                                <div 
                                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-1 bg-black/90 rounded-full p-1.5 shadow-lg"
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStickerResize(sticker.id, -8);
                                    }}
                                    className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full text-white text-sm font-bold transition-colors"
                                  >
                                    −
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStickerResize(sticker.id, 8);
                                    }}
                                    className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full text-white text-sm font-bold transition-colors"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStickerRotate(sticker.id, -15);
                                    }}
                                    className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full text-white text-xs transition-colors"
                                  >
                                    ↺
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStickerRotate(sticker.id, 15);
                                    }}
                                    className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full text-white text-xs transition-colors"
                                  >
                                    ↻
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSticker(sticker.id);
                                    }}
                                    className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full text-white text-xs transition-colors"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Preview Info */}
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500">
                          ✨ Live Preview • Drag stickers • Use zoom controls
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Edit Controls (35%) */}
                  <div className="w-full md:w-[35%] border-t md:border-t-0 md:border-l border-gray-800 bg-[#1a1a1a] flex flex-col overflow-hidden">
                    {/* Horizontal Tabs */}
                    <div className="flex border-b border-gray-800 bg-[#202020] flex-shrink-0">
                      <button
                        onClick={() => setEditTab('stickers')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          editTab === 'stickers'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-[#252525]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                      >
                        <Smile size={16} />
                        <span className="hidden sm:inline">Stickers</span>
                      </button>
                      <button
                        onClick={() => setEditTab('filters')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          editTab === 'filters'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-[#252525]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                      >
                        <Sparkles size={16} />
                        <span className="hidden sm:inline">Filters</span>
                      </button>
                      <button
                        onClick={() => setEditTab('frame')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          editTab === 'frame'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-[#252525]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                      >
                        <Shapes size={16} />
                        <span className="hidden sm:inline">Frame</span>
                      </button>
                      <button
                        onClick={() => setEditTab('adjust')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          editTab === 'adjust'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-[#252525]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                      >
                        <Sliders size={16} />
                        <span className="hidden sm:inline">Adjust</span>
                      </button>
                    </div>

                    {/* Tab Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4 space-y-4">
                      {/* STICKERS TAB */}
                      {editTab === 'stickers' && (
                        <div className="space-y-4">
                          {/* Search Bar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              type="text"
                              placeholder="Search stickers..."
                              value={stickerSearch}
                              onChange={(e) => setStickerSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-[#202020] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                            />
                          </div>

                          {/* Category Filters */}
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                              onClick={() => setStickerCategory('all')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                stickerCategory === 'all'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={() => setStickerCategory('emoji')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                                stickerCategory === 'emoji'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <Smile className="w-3 h-3" /> Emoji
                            </button>
                            <button
                              onClick={() => setStickerCategory('hearts')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                                stickerCategory === 'hearts'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <Heart className="w-3 h-3" /> Hearts
                            </button>
                            <button
                              onClick={() => setStickerCategory('stars')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                                stickerCategory === 'stars'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <Star className="w-3 h-3" /> Stars
                            </button>
                            <button
                              onClick={() => setStickerCategory('objects')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                stickerCategory === 'objects'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              🎁 Objects
                            </button>
                          </div>
                          
                          {/* Sticker Grid - 5 columns with better spacing */}
                          <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto pr-2">
                            {(() => {
                              let filteredStickers = stickerCategory === 'all' 
                                ? STICKER_EMOJIS 
                                : STICKER_CATEGORIES[stickerCategory];
                              
                              if (stickerSearch) {
                                filteredStickers = filteredStickers.filter(emoji => 
                                  emoji.includes(stickerSearch)
                                );
                              }
                              
                              return filteredStickers.map((emoji, index) => (
                                <button
                                  key={`${emoji}-${index}`}
                                  onClick={() => handleAddSticker(emoji)}
                                  className="text-3xl hover:scale-110 active:scale-95 transition-transform p-3 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500"
                                  title={`Add ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ));
                            })()}
                          </div>
                          
                          {/* Active Stickers List - Improved */}
                          <div className="mt-4 pt-4 border-t border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Stickers In Use ({stickers.length})
                              </h4>
                              {stickers.length > 0 && (
                                <button
                                  onClick={() => {
                                    if (confirm('Remove all stickers?')) {
                                      setStickers([]);
                                    }
                                  }}
                                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Clear All
                                </button>
                              )}
                            </div>
                            
                            {stickers.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {stickers.map(sticker => (
                                  <div 
                                    key={sticker.id} 
                                    className={`flex items-center justify-between bg-[#202020] rounded-lg p-2.5 border transition-all ${
                                      selectedStickerId === sticker.id
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">{sticker.emoji}</span>
                                      <div className="text-xs text-gray-400">
                                        <div>Size: {sticker.size}px</div>
                                        <div>Rotation: {sticker.rotation}°</div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => setSelectedStickerId(sticker.id)}
                                        className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                                          selectedStickerId === sticker.id 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                        title="Click to select and edit on preview"
                                      >
                                        {selectedStickerId === sticker.id ? '✓ Selected' : 'Select'}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSticker(sticker.id)}
                                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                        title="Remove sticker"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 bg-[#202020] rounded-lg border border-dashed border-gray-700">
                                <Smile className="w-8 h-8 mx-auto mb-2 opacity-30 text-gray-500" />
                                <p className="text-sm text-gray-500">No stickers added yet</p>
                                <p className="text-xs text-gray-600 mt-1">Click any sticker above to add it to your photo</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* FILTERS TAB */}
                      {editTab === 'filters' && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-400">Apply filters to enhance your photo</p>
                          
                          {/* Compact Filter Grid - 2 columns with mini preview */}
                          <div className="grid grid-cols-2 gap-2">
                            {Object.values(FILTER_PRESETS).map((filter) => (
                              <button
                                key={filter.name}
                                onClick={() => {
                                  setGlobalFilter(filter);
                                  handleApplyGlobalFilter(filter);
                                }}
                                className={`flex flex-col items-center p-3 rounded-lg font-medium text-sm transition-all border-2 ${
                                  globalFilter.name === filter.name
                                    ? "bg-blue-600/20 text-blue-400 border-blue-500 shadow-lg"
                                    : "bg-[#202020] hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600"
                                }`}
                              >
                                {/* Mini Preview Placeholder */}
                                <div className="w-full aspect-square mb-2 rounded bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                  <Palette className="w-6 h-6 opacity-50" />
                                </div>
                                <span className="text-xs">{filter.name}</span>
                              </button>
                            ))}
                          </div>

                          {/* Filter Intensity Slider */}
                          {globalFilter.name !== 'None' && (
                            <div className="mt-4 pt-4 border-t border-gray-800">
                              <label className="text-sm text-gray-400 flex items-center justify-between mb-2">
                                <span>Intensity</span>
                                <span className="text-blue-400 font-mono">{filterIntensity}%</span>
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={filterIntensity}
                                onChange={(e) => setFilterIntensity(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Light</span>
                                <span>Strong</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* FRAME TAB */}
                      {editTab === 'frame' && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-400">Change your photo frame template</p>
                          
                          <Button
                            onClick={handleOpenFrameSelector}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Shapes className="w-5 h-5" />
                            Browse Frame Templates
                          </Button>

                          {selectedTemplate && (
                            <div className="mt-4 p-4 bg-[#202020] rounded-lg border border-gray-700">
                              <p className="text-xs text-gray-400 mb-2">Current Frame</p>
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">🖼️</span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-white">{selectedTemplate.name}</div>
                                  <div className="text-xs text-gray-400">{selectedTemplate.frameCount} frames</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ADJUST TAB - Retake */}
                      {editTab === 'adjust' && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-400">Retake individual photos or start over</p>
                          
                          <div className="space-y-2">
                            {capturedImages
                              .map((image, idx) => ({ image, idx }))
                              .filter(({ image }) => image !== "")
                              .map(({ image, idx }) => {
                                const frameLabel = selectedTemplate?.frameCount === 2 
                                  ? (idx === 0 ? "Top Frame" : "Bottom Frame")
                                  : selectedTemplate?.frameCount === 3
                                  ? (idx === 0 ? "Top Frame" : idx === 1 ? "Middle Frame" : "Bottom Frame")
                                  : `Frame ${idx + 1}`;
                                
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      handleRetakePhoto(idx);
                                      setShowEditPanel(false);
                                    }}
                                    className="flex items-center gap-3 w-full p-3 rounded-lg border-2 border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-all group"
                                  >
                                    {image && (
                                      <div className="w-14 h-14 rounded-lg border border-gray-700 overflow-hidden flex-shrink-0">
                                        <img src={image} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                                      </div>
                                    )}
                                    <div className="flex-1 text-left">
                                      <div className="font-medium text-sm text-white">{frameLabel}</div>
                                      <div className="text-xs text-gray-400">Click to retake</div>
                                    </div>
                                    <RotateCcw className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                  </button>
                                );
                              })}
                          </div>

                          {capturedImages.filter(img => img !== "").length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <RotateCcw className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No photos to retake</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Fixed Bottom Action Bar - Enhanced */}
                    <div className="border-t border-gray-800 bg-[#1a1a1a] px-2.5 py-2 flex items-center justify-between flex-shrink-0">
                      {/* Left: Undo/Redo & Reset */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            // TODO: Implement undo
                            toast('Undo feature coming soon!', { icon: 'ℹ️' });
                          }}
                          disabled
                          className="p-1 bg-gray-700/50 text-gray-500 rounded text-sm transition-colors"
                          title="Undo (Ctrl+Z)"
                        >
                          <Undo2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement redo
                            toast('Redo feature coming soon!', { icon: 'ℹ️' });
                          }}
                          disabled
                          className="p-1 bg-gray-700/50 text-gray-500 rounded text-sm transition-colors"
                          title="Redo (Ctrl+Y)"
                        >
                          <Redo2 className="w-3 h-3" />
                        </button>
                        <div className="w-px bg-gray-700 mx-0.5"></div>
                        <button
                          onClick={() => {
                            if (confirm('Reset all changes? This will remove all stickers and filters.')) {
                              setStickers([]);
                              setGlobalFilter(FILTER_PRESETS.none);
                              setFilterIntensity(100);
                              setPreviewZoom(1);
                            }
                          }}
                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-[11px] transition-colors flex items-center gap-0.5"
                          title="Reset all edits"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span className="hidden sm:inline">Reset All</span>
                        </button>
                      </div>

                      {/* Center: Info */}
                      <div className="hidden md:flex flex-col items-center">
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          {stickers.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Smile className="w-2.5 h-2.5" />
                              {stickers.length} sticker{stickers.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {globalFilter.name !== 'None' && (
                            <span className="flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              Filter: {globalFilter.name}
                            </span>
                          )}
                          {stickers.length === 0 && globalFilter.name === 'None' && (
                            <span className="text-gray-500">No changes yet</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setShowEditPanel(false)}
                          className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-[11px] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowEditPanel(false);
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] transition-colors flex items-center gap-1 font-semibold shadow-lg"
                        >
                          <Check className="w-3 h-3" />
                          Apply Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONFIRMATION DIALOG - Start Over */}
        <AnimatePresence>
          {showStartOverConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowStartOverConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card rounded-2xl border-2 border-destructive/50 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 space-y-4">
                  {/* Icon & Title */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RotateCcw className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Start Over?</h3>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to start over? This will delete your current photos and all edits.
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <p className="text-xs text-destructive font-medium">
                      ⚠️ This action cannot be undone. Make sure you've downloaded your photo first!
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => setShowStartOverConfirm(false)}
                      variant="outline"
                      className="flex-1 py-5"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        handleRetake();
                        setShowStartOverConfirm(false);
                      }}
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground py-5"
                    >
                      Yes, Start Over
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FULLSCREEN PREVIEW MODAL */}
        <AnimatePresence>
          {showFullscreenPreview && finalCompositeImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center"
              onClick={() => setShowFullscreenPreview(false)}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowFullscreenPreview(false)}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Zoom Controls */}
              <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenZoom(prev => Math.min(3, prev + 0.2));
                  }}
                  className="p-2 hover:bg-white/20 rounded text-white transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="text-xs text-center text-white py-1 border-y border-white/20">
                  {Math.round(fullscreenZoom * 100)}%
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenZoom(prev => Math.max(0.5, prev - 0.2));
                  }}
                  className="p-2 hover:bg-white/20 rounded text-white transition-colors"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenZoom(1);
                  }}
                  className="p-2 hover:bg-white/20 rounded text-white transition-colors text-xs font-bold"
                >
                  1:1
                </button>
              </div>

              {/* Image with Zoom */}
              <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
                <img
                  src={finalCompositeImage}
                  alt="Fullscreen Preview"
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${fullscreenZoom})` }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Info */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <p className="text-xs text-white">Click anywhere to close • Use zoom controls to resize</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Mobile Controls (below grid) */}
      <div className={finalCompositeImage ? "mt-6 lg:hidden" : "mt-6"}>
                {finalCompositeImage ? (
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all py-6 text-base font-semibold"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Photo
                    </Button>
                    
                    <Button
                      onClick={handleShare}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg transition-all py-5 font-semibold"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    
                    {user && (
                      <Button
                        onClick={() => navigate('/my-gallery')}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-lg transition-all py-5"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        View My Gallery
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleRetake}
                      variant="outline"
                      className="w-full border-2 border-destructive/50 hover:bg-destructive/10 hover:border-destructive text-destructive transition-all py-5"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Start Over
                    </Button>
                    
                    {/* Edit Options Accordion for Mobile */}
                    <Button
                      onClick={() => setShowEditPanel(!showEditPanel)}
                      variant="outline"
                      className="w-full border-2 hover:bg-accent transition-all py-5"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      {showEditPanel ? 'Hide' : 'Show'} Edit Options
                    </Button>
                    
                    {/* Mobile Edit Panel */}
                    {showEditPanel && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 p-4 bg-card border-2 border-border rounded-xl"
                      >
                        {/* Stickers */}
                        <div>
                          <h3 className="font-semibold text-sm mb-2">Stickers</h3>
                          <Button
                            onClick={() => setShowStickerPanel(!showStickerPanel)}
                            variant="outline"
                            className="w-full"
                          >
                            {showStickerPanel ? 'Hide' : 'Add'} Stickers
                          </Button>
                          {showStickerPanel && (
                            <div className="mt-2 grid grid-cols-6 gap-2 p-2 bg-secondary/50 rounded-lg">
                              {STICKER_EMOJIS.map((emoji, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleAddSticker(emoji)}
                                  className="text-2xl hover:scale-110 transition-transform p-2"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Filters */}
                        <div>
                          <h3 className="font-semibold text-sm mb-2">Filters</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.values(FILTER_PRESETS).map((filter) => (
                              <button
                                key={filter.name}
                                onClick={() => {
                                  setGlobalFilter(filter);
                                  handleApplyGlobalFilter(filter);
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                  globalFilter.name === filter.name
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary hover:bg-accent"
                                }`}
                              >
                                {filter.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Frame Change */}
                        <Button
                          onClick={handleOpenFrameSelector}
                          variant="outline"
                          className="w-full"
                        >
                          <Shapes className="w-4 h-4 mr-2" />
                          Change Frame
                        </Button>
                      </motion.div>
                    )}
                  </div>
                ) : capturedImages.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    {inputMethod === 'camera' ? (
                      <Button
                        onClick={handleCapture}
                        disabled={!hasPermission || isLoading || !selectedTemplate}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Start Photo Session
                      </Button>
                    ) : inputMethod === 'upload' ? (
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || !selectedTemplate}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Photos ({photoCount} needed)
                      </Button>
                    ) : null}
                  </div>
                ) : capturedImages.length > 0 && !allPhotosCaptured ? (
                  <div className="flex flex-col gap-3">
                    {inputMethod === 'upload' && (
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || !selectedTemplate}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload More Photos ({capturedImages.length}/{photoCount})
                      </Button>
                    )}
                    {inputMethod === 'camera' && (
                      <Button
                        onClick={handleCapture}
                        disabled={!hasPermission || isLoading || !selectedTemplate}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Continue ({capturedImages.length}/{photoCount})
                      </Button>
                    )}
                    <Button
                      onClick={handleRetake}
                      variant="outline"
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  </div>
                ) : allPhotosCaptured && !finalCompositeImage ? (
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => createCompositeImage(capturedImages)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Create Photo Strip
                    </Button>
                  </div>
                ) : null}
              </div>
      </div>

      {/* Instructions */}
      {!finalCompositeImage && hasPermission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center space-y-2"
          >
            <p className="text-muted-foreground">
              {selectedTemplate 
                ? capturedImages.length === 0
                  ? `📸 Ready! You'll take ${photoCount} photos. Click "Start Photo Session" to begin.`
                  : `� Photo ${currentPhotoIndex + 1} of ${photoCount} - Get ready for the next shot!`
                : `⚠️ Please select a template first to start your photo session`
              }
            </p>
            {!selectedTemplate && (
              <Button
                variant="link"
                onClick={() => navigate('/gallery')}
                className="text-primary hover:text-primary/80"
              >
                Browse templates →
              </Button>
            )}
          </motion.div>
        )}

        {/* Frame Selector Modal */}
        <AnimatePresence>
        {showFrameSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFrameSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl border-2 border-border max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shapes className="w-6 h-6 text-primary" />
                  Choose New Frame
                </h2>
                <button
                  onClick={() => setShowFrameSelector(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Frame Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                {/* User's Custom Frames Section */}
                {userCustomFrames.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      My Custom Frames
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {userCustomFrames.map((customFrame) => (
                        <motion.button
                          key={customFrame._id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleChangeFrame(customFrame as Template)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                            selectedTemplate?._id === customFrame._id
                              ? 'border-primary ring-2 ring-primary ring-offset-2'
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          <img
                            src={customFrame.thumbnail}
                            alt={customFrame.name}
                            className="w-full aspect-[3/4] object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white text-sm font-semibold truncate">
                              {customFrame.name}
                            </p>
                            <p className="text-white/70 text-xs">
                              {customFrame.frameCount} photos
                            </p>
                          </div>
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-1">
                            <Heart className="w-4 h-4 fill-current" />
                          </div>
                          {selectedTemplate?._id === customFrame._id && (
                            <div className="absolute top-10 left-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                    <div className="border-b border-border mt-8 mb-8"></div>
                  </div>
                )}

                {/* Public Templates Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shapes className="w-5 h-5 text-primary" />
                    Available Templates
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableTemplates.map((template) => (
                      <motion.button
                        key={template._id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleChangeFrame(template)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                          selectedTemplate?._id === template._id
                            ? 'border-primary ring-2 ring-primary ring-offset-2'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full aspect-[3/4] object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-white text-sm font-semibold truncate">
                            {template.name}
                          </p>
                          <p className="text-white/70 text-xs">
                            {template.frameCount} photos
                          </p>
                        </div>
                        {template.isPremium && (
                          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                            PRO
                          </Badge>
                        )}
                        {selectedTemplate?._id === template._id && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {availableTemplates.length === 0 && userCustomFrames.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                    <p>Loading templates...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Booth;
