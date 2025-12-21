import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { frameSubmissionAPI } from "@/services/frameSubmissionAPI";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, ArrowRight, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";

interface FrameSubmission {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  frameCount: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

const UserFrameSubmissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<FrameSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const filterValue = filter === "all" ? undefined : filter;
      const response = await frameSubmissionAPI.getMySubmissions(filterValue);

      if (response.success && Array.isArray(response.data)) {
        setSubmissions(response.data);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Load submissions error:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    setDeleting(id);
    try {
      const response = await frameSubmissionAPI.delete(id);

      if (response.success) {
        toast.success("Submission deleted");
        setSubmissions(submissions.filter((s) => s._id !== id));
      } else {
        toast.error(response.error || "Failed to delete submission");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete submission");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string, rejectionReason?: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-200">Pending Review</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-200">Approved</span>
          </div>
        );
      case "rejected":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full w-fit">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-200">Rejected</span>
            </div>
            {rejectionReason && (
              <p className="text-xs text-gray-400">
                <strong>Reason:</strong> {rejectionReason}
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!user?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-black flex items-center justify-center px-4 pt-32">
        <div className="text-center max-w-md">
          <Upload className="w-16 h-16 text-[#C62828] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">PRO Feature</h1>
          <p className="text-gray-300 mb-6">
            Only PRO users can submit custom frames. Upgrade your account to start contributing frames!
          </p>
          <Button
            onClick={() => navigate("/pricing")}
            className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-lg"
          >
            Upgrade to PRO
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-black">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8 pt-16">
          <div>
            <h1 className="text-4xl font-bold text-white">My Frame Submissions</h1>
            <p className="text-gray-400 mt-2">View and manage your submitted frames</p>
          </div>
          <Button
            onClick={() => navigate("/user/frame-submission")}
            className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit New Frame
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === status
                  ? "bg-[#C62828] text-white"
                  : "bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-400">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-12 text-center">
              <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No submissions found</p>
              <p className="text-sm text-gray-600 mt-1">
                {filter === "all"
                  ? "Start by submitting your first custom frame!"
                  : `You have no ${filter} submissions yet.`}
              </p>
              {filter === "all" && (
                <Button
                  onClick={() => navigate("/user/frame-submission")}
                  className="mt-4 bg-[#C62828] hover:bg-[#E53935] text-white"
                >
                  Submit Your First Frame
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <Card key={submission._id} className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10 overflow-hidden hover:border-white/20 transition-all">
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gray-800 overflow-hidden">
                    <img
                      src={submission.thumbnail}
                      alt={submission.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(submission.status, submission.rejectionReason)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-white truncate">{submission.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{submission.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span>📸 {submission.frameCount} photos</span>
                      <span>
                        {new Date(submission.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {submission.status === "approved" && submission.approvedAt && (
                      <div className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                        ✓ Approved on{" "}
                        {new Date(submission.approvedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}

                    {submission.status === "rejected" && submission.rejectionReason && (
                      <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        {submission.rejectionReason}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <Button
                        onClick={() => navigate(`/user/submission/${submission._id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
                      >
                        View
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      {submission.status === "pending" && (
                        <Button
                          onClick={() => handleDelete(submission._id)}
                          disabled={deleting === submission._id}
                          size="sm"
                          variant="outline"
                          className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFrameSubmissions;
