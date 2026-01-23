import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, ArrowRight, Loader2, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { templateAPI, userFrameAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { safeSessionStorageGet, validateTemplateArray } from '@/lib/utils';

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

const InputMethodSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const isAIFrame = searchParams.get('aiFrame') === 'true';
  const { user, isPremium } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templateId) {
      toast.error('No template selected');
      navigate('/gallery');
      return;
    }

    const loadTemplate = async () => {
      try {
        setLoading(true);

        // 0. Check Navigation State (Instant Load)
        if (location.state?.template && location.state.template._id === templateId) {
          console.log('⚡ Using template from navigation state');
          setSelectedTemplate(location.state.template);
          setLoading(false);
          return;
        }

        // Handle AI-generated frame (not from backend API)
        if (isAIFrame && templateId.startsWith('ai-generated-')) {
          // Get AI frame data from sessionStorage
          const aiFrameSpec = sessionStorage.getItem('aiFrameSpec');
          const aiFrameImage = sessionStorage.getItem('aiFrameImage');

          if (aiFrameSpec && aiFrameImage) {
            try {
              const spec = JSON.parse(aiFrameSpec);
              // Basic validation for AI frame spec
              if (spec && typeof spec.frameCount === 'number' && typeof spec.layout === 'string') {
                const aiTemplate = {
                  _id: templateId,
                  name: `AI ${spec.frameCount}-Photo ${spec.layout} Frame`,
                  category: 'AI Generated',
                  thumbnail: aiFrameImage,
                  frameUrl: aiFrameImage,
                  frameCount: spec.frameCount,
                };
                setSelectedTemplate(aiTemplate);
                setLoading(false);
                return;
              } else {
                console.warn('Invalid AI frame spec structure');
              }
            } catch (error) {
              console.warn('Failed to parse AI frame spec:', error);
              // Clean up invalid cache
              sessionStorage.removeItem('aiFrameSpec');
            }
          }
        }

        // Try to get from cache first
        const cacheResult = safeSessionStorageGet<Template[]>('templates_cache', {
          maxAge: 5 * 60 * 1000, // 5 minutes
          validateStructure: validateTemplateArray
        });

        if (cacheResult.isValid && cacheResult.data) {
          const foundTemplate = cacheResult.data.find((t: any) => t._id === templateId);
          if (foundTemplate) {
            // Check if template is premium and user is not logged in or not premium
            if (foundTemplate.isPremium && !user) {
              toast.error('Login required untuk menggunakan frame premium', {
                duration: 4000,
                icon: "🔒"
              });
              setTimeout(() => {
                navigate('/login');
              }, 1500);
              return;
            }

            if (foundTemplate.isPremium && !isPremium) {
              toast.error('Upgrade ke Premium untuk menggunakan frame PRO', {
                duration: 3000,
                icon: "👑"
              });
              navigate('/gallery');
              return;
            }

            setSelectedTemplate(foundTemplate);
            setLoading(false);

            // Preload template image for instant display in Booth
            if (foundTemplate.frameUrl) {
              const img = document.createElement('img');
              img.src = foundTemplate.frameUrl;
              console.log('⚡ Preloading frame image:', foundTemplate.name);
            }

            return;
          }
        } else if (cacheResult.error) {
          console.warn('Template cache validation failed:', cacheResult.error);
        }

        // Try to load regular template from backend
        try {
          const response = await templateAPI.getTemplate(templateId) as {
            success: boolean;
            data?: { template: any };
          };

          console.log('📦 Template API response:', response);

          if (response.success && response.data?.template) {
            const template = response.data.template;

            // Check if template is premium and user is not logged in or not premium
            if (template.isPremium && !user) {
              toast.error('Login required untuk menggunakan frame premium', {
                duration: 4000,
                icon: "🔒"
              });
              setTimeout(() => {
                navigate('/login');
              }, 1500);
              return;
            }

            if (template.isPremium && !isPremium) {
              toast.error('Upgrade ke Premium untuk menggunakan frame PRO', {
                duration: 3000,
                icon: "👑"
              });
              navigate('/gallery');
              return;
            }

            setSelectedTemplate(template);

            // Preload template image immediately
            if (template.frameUrl) {
              const img = document.createElement('img');
              img.src = template.frameUrl;
              console.log('⚡ Preloading frame image from API');
            }
            return;
          }
        } catch (templateError) {
          console.log('⚠️ Public template not found, trying custom frames...');
        }

        // Template not found in public templates, try custom frames
        // Only try if user is logged in to avoid 401 errors
        if (user) {
          console.log('🔄 Checking custom frames...');
          try {
            const customFrameResponse = await userFrameAPI.getById(templateId);
            console.log('📦 Custom frame response:', customFrameResponse);

            // Response format: { success: true, data: frame }
            let customFrame = customFrameResponse?.data || customFrameResponse;

            if (customFrame && customFrame._id) {
              // Ensure custom frame has all required fields for Template interface
              customFrame = {
                ...customFrame,
                category: customFrame.category || 'User Generated',
                isPremium: false,
                thumbnail: customFrame.thumbnail || customFrame.frameUrl,
              };

              console.log('✅ Found custom frame:', customFrame.name);
              setSelectedTemplate(customFrame);

              // Preload custom frame image
              if (customFrame.frameUrl) {
                const img = document.createElement('img');
                img.src = customFrame.frameUrl;
                console.log('⚡ Preloading custom frame image');
              }
              return;
            }
          } catch (customError) {
            console.error('❌ Custom frame not found:', customError);
          }
        }

        console.error('❌ Frame not found in both public and custom');
        toast.error('Frame tidak ditemukan');
        navigate('/gallery');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, isAIFrame, navigate, location.state, user]);

  const handleSelectMethod = (method: 'camera' | 'upload') => {
    console.log('🎯 Navigating to Booth with method:', method);

    // Cache template data for instant load in Booth
    if (selectedTemplate) {
      sessionStorage.setItem('booth_template_cache', JSON.stringify({
        template: selectedTemplate,
        timestamp: Date.now()
      }));
      console.log('⚡ Template cached for instant Booth load');
    }

    // Navigate immediately - no delay
    const url = isAIFrame
      ? `/booth?template=${templateId}&method=${method}&aiFrame=true`
      : `/booth?template=${templateId}&method=${method}`;

    navigate(url, { replace: false });
  };

  // Preload camera permission when hovering over camera button
  const handleCameraHover = () => {
    if ('mediaDevices' in navigator) {
      // Trigger permission request early (will be cached by browser)
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          console.log('✅ Camera permission granted (preload)');
          // Don't use stream yet, just check permission
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {
          // Permission denied or no camera - will be handled in Booth
          console.log('⚠️ Camera permission check (preload)');
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-red-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!selectedTemplate) {
    return null;
  }

  const photoCount = selectedTemplate.frameCount || selectedTemplate.photoCount || 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-red-800 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-white/10 backdrop-blur-md border-0 shadow-2xl">
          <CardContent className="p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6 sm:mb-8"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mb-2 sm:mb-3">
                Choose Your Input Method
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/90">
                How would you like to add your {photoCount} photos?
              </p>
            </motion.div>

            {/* Template Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4"
            >
              <img
                src={selectedTemplate.thumbnail}
                alt={selectedTemplate.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-white/30 shadow-lg flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-white truncate">
                  {selectedTemplate.name}
                </h3>
                <p className="text-sm sm:text-base text-white/80">
                  <span className="hidden sm:inline">{selectedTemplate.category} Template • </span>
                  {photoCount} photos needed
                </p>
              </div>
            </motion.div>

            {/* Method Selection Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              {/* Use Camera Card */}
              <motion.button
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMethod('camera')}
                onMouseEnter={handleCameraHover}
                className="group relative bg-white/95 hover:bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300 shadow-xl hover:shadow-2xl text-left"
              >
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                  {/* Icon Container */}
                  <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white" strokeWidth={2.5} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full">
                    {/* Title */}
                    <h3 className="text-base sm:text-xl lg:text-2xl font-heading font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">
                      Use Camera
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-base text-gray-600 mb-0 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                      Take photos directly
                    </p>

                    {/* Arrow Indicator - Hidden on mobile, shown on larger screens */}
                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>

              {/* Upload Pictures Card */}
              <motion.button
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMethod('upload')}
                className="group relative bg-white/95 hover:bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300 shadow-xl hover:shadow-2xl text-left"
              >
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                  {/* Icon Container */}
                  <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-white" strokeWidth={2.5} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full">
                    {/* Title */}
                    <h3 className="text-base sm:text-xl lg:text-2xl font-heading font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">
                      Upload Photos
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-base text-gray-600 mb-0 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                      From your device
                    </p>

                    {/* Arrow Indicator - Hidden on mobile, shown on larger screens */}
                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>
            </div>

            {/* Back Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-4 sm:mt-6"
            >
              <button
                onClick={() => navigate('/gallery')}
                className="text-white/80 hover:text-white text-sm sm:text-base font-medium transition-colors underline decoration-2 underline-offset-4"
              >
                ← Back to Gallery
              </button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InputMethodSelection;
