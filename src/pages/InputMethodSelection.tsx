import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, ArrowRight, Loader2, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { templateAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const InputMethodSelection = () => {
  const navigate = useNavigate();
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
        
        // Handle AI-generated frame (not from backend API)
        if (isAIFrame && templateId.startsWith('ai-generated-')) {
          // Get AI frame data from sessionStorage
          const aiFrameSpec = sessionStorage.getItem('aiFrameSpec');
          const aiFrameImage = sessionStorage.getItem('aiFrameImage');
          
          if (aiFrameSpec && aiFrameImage) {
            const spec = JSON.parse(aiFrameSpec);
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
          }
        }
        
        // Try to get from cache first
        const cachedTemplates = sessionStorage.getItem('templates_cache');
        if (cachedTemplates) {
          try {
            const templates = JSON.parse(cachedTemplates);
            const foundTemplate = templates.find((t: any) => t._id === templateId);
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
          } catch (e) {
            console.warn('Cache read error');
          }
        }
        
        // Load regular template from backend
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
        } else {
          console.error('❌ Template not found in response:', response);
          toast.error('Template not found');
          navigate('/gallery');
        }
      } catch (error) {
        console.error('Failed to load template:', error);
        toast.error('Failed to load template');
        navigate('/gallery');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, isAIFrame, navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-red-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-white/10 backdrop-blur-md border-0 shadow-2xl">
          <CardContent className="p-8 lg:p-10">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">
                Choose Your Input Method
              </h1>
              <p className="text-lg lg:text-xl text-white/90">
                How would you like to add your {photoCount} photos?
              </p>
            </motion.div>

            {/* Template Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 mb-8 bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <img
                src={selectedTemplate.thumbnail}
                alt={selectedTemplate.name}
                className="w-16 h-16 rounded-lg object-cover border-2 border-white/30 shadow-lg"
              />
              <div>
                <h3 className="text-xl font-heading font-bold text-white">
                  {selectedTemplate.name}
                </h3>
                <p className="text-white/80 text-base">
                  {selectedTemplate.category} Template • {photoCount} photos needed
                </p>
              </div>
            </motion.div>

            {/* Method Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Use Camera Card */}
              <motion.button
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMethod('camera')}
                onMouseEnter={handleCameraHover}
                className="group relative bg-white/95 hover:bg-white rounded-2xl p-8 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <div className="text-center">
                  {/* Icon Container */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Camera className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                    Use Camera
                  </h3>
                  
                  {/* Description */}
                  <p className="text-base text-gray-600 mb-4">
                    Take photos directly with your device camera
                  </p>

                  {/* Arrow Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-6 h-6 text-primary mx-auto" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-3 left-3 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>

              {/* Upload Pictures Card */}
              <motion.button
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMethod('upload')}
                className="group relative bg-white/95 hover:bg-white rounded-2xl p-8 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <div className="text-center">
                  {/* Icon Container */}
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Upload className="w-12 h-12 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                    Upload Pictures
                  </h3>
                  
                  {/* Description */}
                  <p className="text-base text-gray-600 mb-4">
                    Choose existing photos from your device
                  </p>

                  {/* Arrow Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-6 h-6 text-green-500 mx-auto" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-3 left-3 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>
            </div>

            {/* Back Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-6"
            >
              <button
                onClick={() => navigate('/gallery')}
                className="text-white/80 hover:text-white text-base font-medium transition-colors underline decoration-2 underline-offset-4"
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
