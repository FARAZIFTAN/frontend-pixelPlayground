import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Download, Share2, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

const Booth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
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
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
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
        // Flip horizontally for mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        setCapturedImage(imageData);
        toast.success("Photo captured! 📸");
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCountdown(null);
  };

  const handleDownload = () => {
    if (capturedImage) {
      const link = document.createElement("a");
      link.href = capturedImage;
      link.download = `jepreto-photo-${Date.now()}.png`;
      link.click();
      toast.success("Photo downloaded!");
    }
  };

  const handleShare = async () => {
    if (capturedImage) {
      try {
        const blob = await (await fetch(capturedImage)).blob();
        const file = new File([blob], "jepreto-photo.png", { type: "image/png" });
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: "My Jepreto Photo",
            text: "Check out my photo from Jepreto!",
          });
          toast.success("Shared successfully!");
        } else {
          // Fallback: copy to clipboard
          toast.success("Photo link copied to clipboard!");
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

        {/* Camera/Preview Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
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
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground">
              Position yourself in the camera frame and click "Capture Photo" when ready
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Booth;
