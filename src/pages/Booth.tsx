import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Download, Share2, RotateCcw, Loader2, Sparkles, ArrowRight, ImageIcon, Save } from "lucide-react";
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownToast = useRef(false); // Track if toast has been shown

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
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasPermission(true);
      toast.success("Camera ready!");
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
        
        // Save the captured photo
        const imageData = canvas.toDataURL("image/png");
        const newCapturedImages = [...capturedImages, imageData];
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
            // Don't block user, just log the error
          }
        }
        
        const nextPhotoIndex = currentPhotoIndex + 1;
        
        // Check if we've captured all photos
        if (nextPhotoIndex >= photoCount) {
          // All photos captured, create composite
          toast.success("All photos captured! Creating your photo strip... 🎨", {
            duration: 2000,
          });
          createCompositeImage(newCapturedImages);
        } else {
          // More photos to capture
          setCurrentPhotoIndex(nextPhotoIndex);
          toast.success(`Photo ${nextPhotoIndex} of ${photoCount} captured! 📸`, {
            duration: 1500,
          });
        }
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
                  <div className="relative w-full h-full">
                    <img
                      src={finalCompositeImage}
                      alt="Final Photo Strip"
                      className="w-full h-full object-contain bg-white"
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
              </div>

              {/* Controls */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {!finalCompositeImage ? (
                  <Button
                    onClick={handleCapture}
                    disabled={!hasPermission || isLoading || !selectedTemplate}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-soft hover:shadow-hover transition-all"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {capturedImages.length === 0 ? "Start Photo Session" : `Capture Photo ${currentPhotoIndex + 1}`}
                  </Button>
                ) : (
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
                      onClick={handleSaveComposite}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-6 rounded-full shadow-soft hover:shadow-hover transition-all"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          View in Gallery
                        </>
                      )}
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
                )}
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
