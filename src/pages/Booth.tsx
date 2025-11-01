import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Download, Share2, RotateCcw, Loader2, Sparkles, ArrowRight, ImageIcon } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { templates, Template } from "@/data/templates";

const Booth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load template from URL parameter
  useEffect(() => {
    const templateIdFromUrl = searchParams.get("template");
    if (templateIdFromUrl) {
      const template = templates.find(t => t.id === templateIdFromUrl);
      if (template) {
        setSelectedTemplate(template);
        toast.success(`✨ Template "${template.name}" loaded!`, {
          duration: 3000,
          icon: "🎨",
        });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      // Cleanup countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

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

  const capturePhoto = () => {
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
        
        // Draw template overlay if selected
        if (selectedTemplate) {
          const templateImg = new Image();
          templateImg.crossOrigin = "anonymous"; // For CORS
          templateImg.src = selectedTemplate.frameUrl;
          
          templateImg.onload = () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
            ctx.globalAlpha = 0.8; // Semi-transparent overlay
            ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0; // Reset alpha
            
            const imageData = canvas.toDataURL("image/png");
            setCapturedImage(imageData);
            toast.success("Photo captured with template! 📸");
          };
          
          templateImg.onerror = () => {
            // If template fails to load, save without template
            const imageData = canvas.toDataURL("image/png");
            setCapturedImage(imageData);
            toast.success("Photo captured! 📸");
          };
        } else {
          const imageData = canvas.toDataURL("image/png");
          setCapturedImage(imageData);
          toast.success("Photo captured! 📸");
        }
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCountdown(null);
  };

  // Add authentication check (replace with your actual auth logic)
  const isAuthenticated = false; // TODO: Replace with real auth state

  const handleDownload = () => {
    if (!isAuthenticated) {
      toast.error("Please login or register to download.");
      navigate("/login"); // or "/register"
      return;
    }
    if (capturedImage) {
      const link = document.createElement("a");
      link.href = capturedImage;
      link.download = `karyaklik-photo-${Date.now()}.png`;
      link.click();
      toast.success("Photo downloaded!");
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      toast.error("Please login or register to share.");
      navigate("/login"); // or "/register"
      return;
    }
    if (capturedImage) {
      try {
        const blob = await (await fetch(capturedImage)).blob();
        const file = new File([blob], "karyaklik-photo.png", { type: "image/png" });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My KaryaKlik Photo",
            text: "Check out my photo from KaryaKlik!",
          });
          toast.success("Shared successfully!");
        } else {
          // Fallback: Copy image data URL to clipboard
          await navigator.clipboard.writeText(capturedImage);
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
            <Card className="gradient-card border-0 shadow-soft border-dashed border-2 border-primary/30">
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

                {capturedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
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
                    {/* Template Overlay on Live Preview */}
                    {selectedTemplate && (
                      <div className="absolute inset-0 pointer-events-none">
                        <img
                          src={selectedTemplate.frameUrl}
                          alt="Template overlay"
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                    )}
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Controls */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {!capturedImage ? (
                  <Button
                    onClick={handleCapture}
                    disabled={!hasPermission || isLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-soft hover:shadow-hover transition-all"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Photo
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleRetake}
                      variant="outline"
                      className="px-6 py-6 rounded-full border-2 hover:bg-accent transition-all"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Retake
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
        {!capturedImage && hasPermission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center space-y-2"
          >
            <p className="text-muted-foreground">
              {selectedTemplate 
                ? `📸 Ready to go! Position yourself and click "Capture Photo"`
                : `📷 Position yourself in the camera frame and click "Capture Photo" (template optional)`
              }
            </p>
            {!selectedTemplate && (
              <Button
                variant="link"
                onClick={() => navigate('/gallery')}
                className="text-primary hover:text-primary/80"
              >
                Or browse templates first →
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Booth;
