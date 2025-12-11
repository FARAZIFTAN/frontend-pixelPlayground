import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { templateAPI } from '@/services/api';
import { toast } from 'sonner';

const InputMethodSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
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
        const response = await templateAPI.getTemplate(templateId) as { data: any };
        if (response.data) {
          setSelectedTemplate(response.data);
        } else {
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
  }, [templateId, navigate]);

  const handleSelectMethod = (method: 'camera' | 'upload') => {
    navigate(`/booth?template=${templateId}&method=${method}`);
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

  const photoCount = selectedTemplate.photoCount || 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-red-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <Card className="bg-white/10 backdrop-blur-md border-0 shadow-2xl">
          <CardContent className="p-12 lg:p-16">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
                Choose Your Input Method
              </h1>
              <p className="text-xl lg:text-2xl text-white/90">
                How would you like to add your {photoCount} photos?
              </p>
            </motion.div>

            {/* Template Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6"
            >
              <img
                src={selectedTemplate.thumbnail}
                alt={selectedTemplate.name}
                className="w-20 h-20 rounded-xl object-cover border-2 border-white/30 shadow-lg"
              />
              <div>
                <h3 className="text-2xl font-heading font-bold text-white">
                  {selectedTemplate.name}
                </h3>
                <p className="text-white/80 text-lg">
                  {selectedTemplate.category} Template • {photoCount} photos needed
                </p>
              </div>
            </motion.div>

            {/* Method Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Use Camera Card */}
              <motion.button
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMethod('camera')}
                className="group relative bg-white/95 hover:bg-white rounded-3xl p-10 transition-all duration-300 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              >
                <div className="text-center">
                  {/* Icon Container */}
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Camera className="w-16 h-16 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                    Use Camera
                  </h3>
                  
                  {/* Description */}
                  <p className="text-lg text-gray-600 mb-6">
                    Take photos directly with your device camera
                  </p>

                  {/* Arrow Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-8 h-8 text-primary mx-auto" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>

              {/* Upload Pictures Card */}
              <motion.button
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMethod('upload')}
                className="group relative bg-white/95 hover:bg-white rounded-3xl p-10 transition-all duration-300 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
              >
                <div className="text-center">
                  {/* Icon Container */}
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Upload className="w-16 h-16 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                    Upload Pictures
                  </h3>
                  
                  {/* Description */}
                  <p className="text-lg text-gray-600 mb-6">
                    Choose existing photos from your device
                  </p>

                  {/* Arrow Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-8 h-8 text-green-500 mx-auto" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>
            </div>

            {/* Back Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-10"
            >
              <button
                onClick={() => navigate('/gallery')}
                className="text-white/80 hover:text-white text-lg font-medium transition-colors underline decoration-2 underline-offset-4"
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
