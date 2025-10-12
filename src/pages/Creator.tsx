import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const Creator = () => {
  const [templateName, setTemplateName] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    if (!uploadedImage) {
      toast.error("Please upload a template image");
      return;
    }
    // Here you would save to database/storage
    toast.success("Template saved successfully! 🎉");
    setTemplateName("");
    setUploadedImage(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
            Template Creator
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Design and upload your own custom photo booth templates
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-heading">Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Name */}
                <div className="space-y-2">
                  <Label htmlFor="templateName" className="text-base font-medium">
                    Template Name
                  </Label>
                  <Input
                    id="templateName"
                    placeholder="e.g., Birthday Party 2025"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="rounded-xl border-2 focus:border-primary transition-colors"
                  />
                </div>

                {/* Upload Area */}
                <div className="space-y-2">
                  <Label htmlFor="templateImage" className="text-base font-medium">
                    Upload Template Frame
                  </Label>
                  <div className="relative">
                    <input
                      id="templateImage"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="templateImage"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-accent/50 transition-all group"
                    >
                      {uploadedImage ? (
                        <div className="relative w-full h-full p-4">
                          <img
                            src={uploadedImage}
                            alt="Template preview"
                            className="w-full h-full object-contain rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
                          <p className="text-muted-foreground mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-muted-foreground">
                            PNG or JPG (Max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="bg-accent/50 rounded-xl p-4 space-y-2">
                  <p className="font-semibold text-sm">Template Guidelines:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Use PNG format with transparent background</li>
                    <li>Recommended size: 1920x1080 pixels</li>
                    <li>Leave space for photos in your design</li>
                    <li>Keep file size under 5MB</li>
                  </ul>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveTemplate}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-full shadow-soft hover:shadow-hover transition-all"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Template
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-heading flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-primary" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-secondary rounded-2xl flex items-center justify-center overflow-hidden">
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Template preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-24 h-24 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        Upload an image to see preview
                      </p>
                    </div>
                  )}
                </div>

                {templateName && (
                  <div className="mt-6 p-4 bg-accent/50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Template Name:</p>
                    <p className="font-semibold text-lg">{templateName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Creator;
