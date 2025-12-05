import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Download, Share2, RotateCcw, Loader2, Sparkles, ArrowRight, ImageIcon, Save, X, Smile } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { sessionAPI, photoAPI, compositeAPI, templateAPI } from "@/services/api";
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
    brightness: 100,
    contrast: 100,
    saturate: 0,
    sepia: 0,
    grayscale: 100,
    hueRotate: 0,
  },
  sepia: {
    name: "Sepia",
    brightness: 100,
    contrast: 110,
    saturate: 80,
    sepia: 100,
    grayscale: 0,
    hueRotate: 0,
  },
  vintage: {
    name: "Vintage",
    brightness: 110,
    contrast: 90,
    saturate: 70,
    sepia: 40,
    grayscale: 0,
    hueRotate: 15,
  },
  bright: {
    name: "Bright",
    brightness: 120,
    contrast: 110,
    saturate: 110,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
  },
  cool: {
    name: "Cool",
    brightness: 100,
    contrast: 105,
    saturate: 110,
    sepia: 0,
    grayscale: 0,
    hueRotate: 180,
  },
  warm: {
    name: "Warm",
    brightness: 110,
    contrast: 100,
    saturate: 130,
    sepia: 20,
    grayscale: 0,
    hueRotate: 10,
  },
  dark: {
    name: "Dark",
    brightness: 80,
    contrast: 120,
    saturate: 100,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
  },
  vivid: {
    name: "Vivid",
    brightness: 105,
    contrast: 130,
    saturate: 150,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
  },
  soft: {
    name: "Soft",
    brightness: 110,
    contrast: 85,
    saturate: 90,
    sepia: 10,
    grayscale: 0,
    hueRotate: 0,
  },
  noir: {
    name: "Noir",
    brightness: 90,
    contrast: 140,
    saturate: 0,
    sepia: 0,
    grayscale: 100,
    hueRotate: 0,
  },
};

// Sticker data
const STICKER_CATEGORIES = {
  emoji: {
    name: "Emoji",
    stickers: ["☁️", "😸", "🐸", "🐌", "🐰", "🌸", "😢", "🎨", "💕", "🎀", "💝", "👑"],
  },
  decorative: {
    name: "Decorative",
    stickers: ["✨", "⭐", "🌟", "💫", "✈️", "🎭", "🎪", "🎨", "🎯", "🎲", "🎰", "🎸"],
  },
  flowers: {
    name: "Flowers",
    stickers: ["🌹", "🌺", "🌻", "🌷", "🌸", "💐", "🌼", "🌾", "🍀", "🎋", "🎍", "🏵️"],
  },
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
  
  // Sticker state
  interface StickerElement {
    id: string;
    emoji: string;
    xPercent: number; // Position as percentage (0-100)
    yPercent: number; // Position as percentage (0-100)
    size: number;
  }
  const [compositeImageDimensions, setCompositeImageDimensions] = useState({ width: 800, height: 600 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownToast = useRef(false); // Track if toast has been shown
  const isRetakingPhotoRef = useRef(false); // Track if currently retaking a photo

  // Load template from URL parameter
  useEffect(() => {
    const templateIdFromUrl = searchParams.get("template");
    if (templateIdFromUrl && !hasLoadedTemplate) {
      const loadTemplate = async (templateId: string) => {
        try {
          const response = await templateAPI.getTemplate(templateId) as {
            success: boolean;
            data?: { template: Template };
          };
          
          if (response.success && response.data) {
            const template = response.data.template;
            setSelectedTemplate(template);
            setPhotoCount(template.frameCount);
            setHasLoadedTemplate(true);
            
            // Show toast after state update
            if (!hasShownToast.current) {
              hasShownToast.current = true;
              queueMicrotask(() => {
                toast.success(`✨ Template "${template.name}" loaded!`, {
                  duration: 3000,
                  icon: "🎨",
                });
              });
            }
          }
        } catch (error) {
          console.error('Load template error:', error);
          toast.error('Failed to load template');
        }
      };
      loadTemplate(templateIdFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    startCamera();
    // Create photo session when component mounts
    createPhotoSession();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      // Cleanup countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - only run once on mount



  // Create photo session on backend
  const createPhotoSession = async () => {
    try {
      const response = await sessionAPI.createSession({
        sessionName: `Photo Session ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`,
        templateId: selectedTemplate?._id,
        metadata: {
          photoCount,
          startedAt: new Date().toISOString(),
        }
      });
      
      // Extract session ID from response
      const data = response as { data?: { session?: { _id: string } }; session?: { _id: string } };
      const newSessionId = data.data?.session?._id || data.session?._id;
      
      if (newSessionId) {
        setSessionId(newSessionId);
        console.log('✅ Photo session created:', newSessionId);
      }
    } catch (error) {
      console.error('Failed to create photo session:', error);
      toast.error('Failed to create session. Photos will not be saved.');
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: false,
      });
      setStream(mediaStream);
      
      // Ensure video element gets the stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Camera stream loaded");
          videoRef.current?.play();
          
          // If in retake mode, auto-start capture
          if (isRetakingPhotoRef.current) {
            console.log("Retake mode detected, auto-starting capture...");
            setTimeout(() => {
              handleCapture();
              isRetakingPhotoRef.current = false; // Reset flag
            }, 300);
          }
        };
      }
      
      setHasPermission(true);
      console.log("Camera ready for photo", currentPhotoIndex + 1);
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Could not access camera. Please grant permission.");
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = () => {
    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          capturePhoto();
          return null;
        }
        return prev! - 1;
      });
    }, 1000);
  };

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
        
        // Create new captured images array - either replace or append based on currentPhotoIndex
        let newCapturedImages: string[];
        if (currentPhotoIndex < capturedImages.length) {
          // Replacing a photo (retake scenario)
          newCapturedImages = [...capturedImages];
          newCapturedImages[currentPhotoIndex] = imageData;
        } else {
          // Appending a new photo (normal capture scenario)
          newCapturedImages = [...capturedImages, imageData];
        }
        setCapturedImages(newCapturedImages);
        
        // Upload photo to backend
        if (sessionId) {
          try {
            const response = await photoAPI.uploadPhoto({
              sessionId,
              photoUrl: imageData,
              order: currentPhotoIndex,
              metadata: {
                capturedAt: new Date().toISOString(),
                photoNumber: currentPhotoIndex + 1,
              }
            });
            
            // Extract photo ID
            const data = response as { data?: { photo?: { _id: string } }; photo?: { _id: string } };
            const photoId = data.data?.photo?._id || data.photo?._id;
            if (photoId) {
              setUploadedPhotoIds(prev => [...prev, photoId]);
              console.log('✅ Photo uploaded:', photoId);
            }
          } catch (error) {
            console.error('Failed to upload photo:', error);
          }
        }
        
        const nextPhotoIndex = currentPhotoIndex + 1;
        
        // Check if we've captured all photos
        if (nextPhotoIndex >= photoCount) {
          // All photos captured, auto-create composite and show results
          setAllPhotosCaptured(true);
          toast.success("All photos captured! ✨ Creating preview...", {
            duration: 2000,
          });
          // Auto-create composite image after slight delay
          setTimeout(() => {
            createCompositeImage(newCapturedImages);
          }, 500);
        } else {
          // More photos to capture - auto trigger next countdown after 1 second
          setCurrentPhotoIndex(nextPhotoIndex);
          toast.success(`Photo ${nextPhotoIndex} of ${photoCount} captured! 📸`, {
            duration: 1500,
          });
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
            toast.success(`Photo ${nextPhotoIdx} of ${photoCount} captured! 📸`, {
              duration: 1500,
            });
            
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

    if (!selectedTemplate || !canvasRef.current) {
      toast.error("No template selected!");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      console.error('❌ Canvas context not found!');
      return;
    }

    // Load template image first
    const templateImg = new Image();
    templateImg.crossOrigin = "anonymous";
    templateImg.src = selectedTemplate.frameUrl;

    console.log('📦 Loading template from:', selectedTemplate.frameUrl);

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
            photos.forEach((_, i) => {
              const position = selectedTemplate.layoutPositions[i];
              if (position && photoImages[i]) {
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
              }
            });

            // STEP 3: Draw template overlay ON TOP of photos
            ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
            console.log('🖼️ Template overlay drawn on top');

            // Get final composite image
            const finalImage = canvas.toDataURL("image/png", 1.0);
            setFinalCompositeImage(finalImage);
            setCompositeImageDimensions({ width: canvas.width, height: canvas.height });
            console.log('🎉 Composite complete! Template:', canvas.width, 'x', canvas.height);
            
            // Auto-save composite to gallery
            autoSaveComposite(finalImage);
            
            toast.success("Your photo strip is ready! 🎉", {
              duration: 3000,
            });
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

  const handleRetake = () => {
    setCapturedImages([]);
    setFinalCompositeImage(null);
    setCurrentPhotoIndex(0);
    setCountdown(null);
    setUploadedPhotoIds([]);
    setAllPhotosCaptured(false);
    setGlobalFilter(FILTER_PRESETS.none);
    // Create new session for retake
    createPhotoSession();
  };

  // Auto-save composite to gallery after generation
  const autoSaveComposite = async (compositeImage: string) => {
    if (!sessionId) {
      console.warn('Session ID not available for auto-save');
      return;
    }

    try {
      await compositeAPI.createComposite({
        sessionId,
        compositeUrl: compositeImage,
        templateId: selectedTemplate?._id,
        isPublic: false,
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

      console.log('✅ Composite auto-saved to gallery');
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error toast for auto-save, user can still manually save
    }
  };



  // Retake a specific photo
  const handleRetakePhoto = (photoIndex: number) => {
    // Remove the photo at the specified index
    const updatedImages = capturedImages.filter((_, index) => index !== photoIndex);
    setCapturedImages(updatedImages);
    
    // Update uploaded photo IDs to remove the corresponding ID
    const updatedIds = uploadedPhotoIds.filter((_, index) => index !== photoIndex);
    setUploadedPhotoIds(updatedIds);
    
    // Go back to the photo that needs retaking
    setCurrentPhotoIndex(photoIndex);
    
    // Clear the composite and countdown
    setFinalCompositeImage(null);
    setCountdown(null);
    setAllPhotosCaptured(false);
    setShowEditPanel(false);
    setShowRetakeOptions(false);
    
    toast.success(`Retaking photo ${photoIndex + 1}... 📸`, {
      duration: 1500,
    });

    // Mark that we're retaking
    isRetakingPhotoRef.current = true;

    // Restart camera - stop current stream and start fresh
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
    
    // Give browser time to release stream, then restart camera
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

      toast.success('🎉 Photo strip saved successfully!');
      
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

  const handleDownload = () => {
    if (!user) {
      toast.error("Please login or register to download.");
      navigate("/login");
      return;
    }
    if (finalCompositeImage) {
      const link = document.createElement("a");
      link.href = finalCompositeImage;
      link.download = `pixelplayground-photo-strip-${Date.now()}.png`;
      link.click();
      toast.success("Photo strip downloaded!");
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast.error("Please login or register to share.");
      navigate("/login");
      return;
    }
    if (finalCompositeImage) {
      try {
        const blob = await (await fetch(finalCompositeImage)).blob();
        const file = new File([blob], "pixelplayground-photo-strip.png", { type: "image/png" });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My PixelPlayground Photo Strip",
            text: "Check out my photo strip from PixelPlayground!",
          });
          toast.success("Shared successfully!");
        } else {
          // Fallback: Copy image data URL to clipboard
          await navigator.clipboard.writeText(finalCompositeImage);
          toast.success("Image data copied to clipboard!");
        }
      } catch (error) {
        console.error("Share error:", error);
        toast.error("Could not share. Try downloading instead.");
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
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
                      <p className="font-heading font-semibold text-lg text-white flex items-center gap-2">
                        {selectedTemplate.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.category} Template
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/gallery')}
                    className="rounded-full"
                  >
                    Change Template
                  </Button>
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

        {/* Photo Count Selection */}
        {selectedTemplate && capturedImages.length === 0 && !finalCompositeImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-lg font-heading font-semibold text-white mb-4 text-center">
                  How many photos do you want to take?
                </h3>
                <div className="flex justify-center gap-4">
                  {[2, 3, 4].map((count) => {
                    const isAvailable = count <= selectedTemplate.frameCount;
                    return (
                      <Button
                        key={count}
                        onClick={() => isAvailable && setPhotoCount(count)}
                        disabled={!isAvailable}
                        variant={photoCount === count ? "default" : "outline"}
                        className={`px-8 py-6 rounded-full text-lg font-semibold transition-all ${
                          photoCount === count
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                            : isAvailable
                            ? "hover:border-primary"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {count} Photos
                      </Button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  This template supports up to {selectedTemplate.frameCount} photos
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Camera/Preview Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="gradient-card border-0 shadow-hover overflow-hidden">
            <CardContent className="p-6 lg:p-8">
              <div className="relative aspect-video bg-secondary rounded-2xl overflow-hidden">
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
                  <div className="relative w-full h-full overflow-hidden bg-white">
                    <img
                      src={finalCompositeImage}
                      alt="Final Photo Strip"
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Auto-saved indicator */}
                    <div className="absolute top-4 left-4 bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Auto-saved to Gallery
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
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

              {/* Edit Panel - Show when Edit Photos clicked and we have final composite */}
              {finalCompositeImage && showEditPanel && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="fixed right-6 top-32 w-96 bg-card rounded-2xl border-2 border-border p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowEditPanel(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Filters Section */}
                  <div>
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
                          onClick={() => {
                            setGlobalFilter(filter);
                            handleApplyGlobalFilter(filter);
                          }}
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

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-border">
                      <Button
                        onClick={() => setShowRetakeOptions(!showRetakeOptions)}
                        className="w-full bg-secondary hover:bg-accent text-foreground py-3 font-semibold flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {showRetakeOptions ? "Hide Retake Options" : "Retake Photo"}
                      </Button>

                      {/* Individual Photo Retake Options */}
                      {showRetakeOptions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 bg-secondary/50 p-3 rounded-lg"
                        >
                          <p className="text-sm text-muted-foreground font-semibold mb-3">Select photo to retake:</p>
                          <div className="space-y-2">
                            {capturedImages.map((_, idx) => (
                              <Button
                                key={idx}
                                onClick={() => {
                                  handleRetakePhoto(idx);
                                  setShowEditPanel(false);
                                  setShowRetakeOptions(false);
                                }}
                                className="w-full bg-primary/80 hover:bg-primary text-primary-foreground py-2 text-sm"
                              >
                                Retake Photo {idx + 1}
                              </Button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                </motion.div>
              )}

              {/* Controls - Show button only at start and final result */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {/* Only show START button when at initial state */}
                {capturedImages.length === 0 && !finalCompositeImage ? (
                  <Button
                    onClick={handleCapture}
                    disabled={!hasPermission || isLoading || !selectedTemplate}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-soft hover:shadow-hover transition-all"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Photo Session
                  </Button>
                ) : allPhotosCaptured && !finalCompositeImage ? (
                  <>
                    <Button
                      onClick={() => handleOpenEditModal()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-soft hover:shadow-hover transition-all"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Edit Photos
                    </Button>
                    <Button
                      onClick={() => createCompositeImage(capturedImages)}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-full shadow-soft hover:shadow-hover transition-all"
                    >
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Create Preview
                    </Button>
                  </>
                ) : finalCompositeImage ? (
                  <>
                    <Button
                      onClick={handleRetake}
                      variant="outline"
                      className="px-6 py-6 rounded-full border-2 hover:bg-accent transition-all"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Start Over
                    </Button>
                    <Button
                      onClick={() => handleOpenEditModal()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-full shadow-soft hover:shadow-hover transition-all"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Edit Photos
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-6 rounded-full shadow-soft hover:shadow-hover transition-all"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download 
                    </Button>
                    <Button
                      onClick={handleShare}
                      className="bg-accent hover:bg-accent/80 text-accent-foreground px-6 py-6 rounded-full shadow-soft hover:shadow-hover transition-all"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
        
      </div>
    </div>
  );
};

export default Booth;
