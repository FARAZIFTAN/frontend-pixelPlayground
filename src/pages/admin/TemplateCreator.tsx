import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import FrameCreatorForm from "@/components/FrameCreatorForm";
import { templateAPI } from "@/services/api";

interface Rectangle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const TemplateCreator = () => {
  const navigate = useNavigate();
  
  // Template Info
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("Artistic");
  const [frameCount, setFrameCount] = useState(3);
  const [isPremium, setIsPremium] = useState(false);
  
  const [imageUrl, setImageUrl] = useState<string>("");
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [selectedRect, setSelectedRect] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const categories = ["Artistic", "Education", "Wedding", "Birthday", "Corporate", "Graduation"];

  const handleSave = async (data: {
    templateName: string;
    category: string;
    frameCount: number;
    isPremium: boolean;
    imageUrl: string;
    rectangles: Rectangle[];
  }) => {
    setIsSaving(true);

    try {
      const layoutPositions = data.rectangles.map((rect) => ({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      }));

      const templateData = {
        name: data.templateName,
        category: data.category,
        thumbnail: data.imageUrl,
        frameUrl: data.imageUrl,
        isPremium: data.isPremium,
        frameCount: data.frameCount,
        layoutPositions,
        isActive: true,
      };

      console.log("Saving template with data:", templateData);

      const response = await templateAPI.createTemplate(templateData);

      console.log("Template save response:", response);

      toast.success("Template saved successfully!");

      setTimeout(() => {
        navigate("/admin/templates");
      }, 1000);
    } catch (error) {
      console.error("Save template error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const updateCoordinate = (index: number, field: keyof Rectangle, value: number) => {
    const newRectangles = [...rectangles];
    newRectangles[index] = {
      ...newRectangles[index],
      [field]: Math.max(0, value),
    };
    setRectangles(newRectangles);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Template Creator</h1>
            <p className="text-gray-300 mt-1">Create a new photo booth template</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/templates")}
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>

        <FrameCreatorForm
          templateName={templateName}
          setTemplateName={setTemplateName}
          category={category}
          setCategory={setCategory}
          frameCount={frameCount}
          setFrameCount={setFrameCount}
          isPremium={isPremium}
          setIsPremium={setIsPremium}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          rectangles={rectangles}
          setRectangles={setRectangles}
          selectedRect={selectedRect}
          setSelectedRect={setSelectedRect}
          onSave={handleSave}
          isSaving={isSaving}
          showPremiumToggle={true}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default TemplateCreator;

