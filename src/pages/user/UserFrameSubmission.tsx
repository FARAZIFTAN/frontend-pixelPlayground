import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import FrameCreatorForm from "@/components/FrameCreatorForm";
import { frameSubmissionAPI } from "@/services/frameSubmissionAPI";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Rectangle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const UserFrameSubmission = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [templateName, setTemplateName] = useState("");
  const [category, setCategory] = useState("Artistic");
  const [frameCount, setFrameCount] = useState(3);
  const [imageUrl, setImageUrl] = useState("");
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [selectedRect, setSelectedRect] = useState<number | null>(null);

  // Check if user is premium
  if (!user?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-black flex items-center justify-center px-4 pt-32">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-[#C62828] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">PRO Feature</h1>
          <p className="text-gray-300 mb-6">
            Only PRO users can submit custom frames for approval. Upgrade your account to unlock this feature.
          </p>
          <Button
            onClick={() => navigate("/upgrade-pro")}
            className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-lg"
          >
            Upgrade to PRO
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (data: {
    templateName: string;
    category: string;
    frameCount: number;
    isPremium: boolean;
    imageUrl: string;
    rectangles: Rectangle[];
  }) => {
    if (!user?.id) {
      toast.error("User information not available");
      return;
    }

    setIsSaving(true);

    try {
      const layoutPositions = data.rectangles.map((rect) => ({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        borderRadius: 0,
        rotation: 0,
      }));

      const frameData = {
        name: data.templateName,
        description: `A ${data.frameCount}-photo ${data.category} frame`,
        frameUrl: data.imageUrl,
        thumbnail: data.imageUrl,
        frameCount: data.frameCount,
        layout: data.frameCount <= 3 ? "vertical" : data.frameCount <= 6 ? "horizontal" : "grid",
        frameSpec: {
          category: data.category,
          userId: user.id,
        },
        layoutPositions,
      };

      console.log("Submitting frame:", frameData);

      const response = await frameSubmissionAPI.submit(frameData);

      if (response.success) {
        toast.success("Frame submitted successfully! Awaiting admin approval.");
        setTimeout(() => {
          navigate("/user/my-submissions");
        }, 1500);
      } else {
        toast.error(response.error || "Failed to submit frame");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit frame");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-black pt-32">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/user/my-submissions")}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white">Submit Custom Frame</h1>
            <p className="text-gray-400 mt-2">Create and submit a new frame for community approval</p>
          </div>
        </div>

        <div className="mb-8 p-5 bg-gradient-to-r from-[#C62828]/15 to-[#FF6B6B]/5 border border-[#C62828]/40 rounded-lg">
          <p className="text-sm text-[#FFB3B3] flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span><strong>Tip:</strong> After submission, your frame will be reviewed by our admin team. Once approved, it will be available as a public template for all users!</span>
          </p>
        </div>

        <FrameCreatorForm
          templateName={templateName}
          setTemplateName={setTemplateName}
          category={category}
          setCategory={setCategory}
          frameCount={frameCount}
          setFrameCount={setFrameCount}
          isPremium={false}
          setIsPremium={() => {}}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          rectangles={rectangles}
          setRectangles={setRectangles}
          selectedRect={selectedRect}
          setSelectedRect={setSelectedRect}
          onSave={handleSave}
          isSaving={isSaving}
          showPremiumToggle={false}
        />
      </div>
    </div>
  );
};

export default UserFrameSubmission;
