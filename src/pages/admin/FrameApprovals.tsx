import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { frameSubmissionAPI } from "@/services/frameSubmissionAPI";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, AlertCircle } from "lucide-react";

interface FrameSubmission {
  _id: string;
  name: string;
  description: string;
  frameUrl: string;
  thumbnail: string;
  frameCount: number;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

const FrameApprovals = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<FrameSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const submissionsRef = useRef<FrameSubmission[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    submissionsRef.current = submissions;
  }, [submissions]);

  // Check admin access
  useEffect(() => {
    if (user?.role !== "admin") {
      window.location.href = "/";
      return;
    }
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const loadSubmissions = async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const skip = append ? submissionsRef.current.length : 0;
      const response = await frameSubmissionAPI.getPendingSubmissions("pending", 50, skip);

      if (response.success && Array.isArray(response.data)) {
        if (append) {
          setSubmissions(prev => [...prev, ...response.data]);
        } else {
          setSubmissions(response.data);
        }
        setHasMore(response.hasMore || false);
      } else {
        if (!append) {
          setSubmissions([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Load submissions error:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleApprove = async (id: string, isPremium: boolean) => {
    setProcessing(id);
    try {
      const response = await frameSubmissionAPI.approve(id, isPremium);

      if (response.success) {
        toast.success("Frame approved successfully!");
        setSubmissions(submissions.filter((s) => s._id !== id));
      } else {
        toast.error(response.error || "Failed to approve frame");
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve frame");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectConfirm = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(id);
    try {
      const response = await frameSubmissionAPI.reject(id, rejectReason);

      if (response.success) {
        toast.success("Frame rejected");
        setSubmissions(submissions.filter((s) => s._id !== id));
        setShowRejectModal(null);
        setRejectReason("");
      } else {
        toast.error(response.error || "Failed to reject frame");
      }
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Failed to reject frame");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-gray-400">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Frame Approvals</h1>
          <p className="text-gray-300 mt-1">Review and approve/reject user-submitted frames</p>
        </div>

        {submissions.length === 0 ? (
          <Card className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No pending submissions</p>
              <p className="text-sm text-gray-600 mt-1">All frames have been reviewed!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {submissions.map((submission) => (
              <Card
                key={submission._id}
                className="shadow-xl bg-black/30 backdrop-blur-lg border border-white/10 overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Image Preview */}
                  <div className="relative h-64 bg-gray-800 overflow-hidden">
                    <img
                      src={submission.thumbnail}
                      alt={submission.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </div>

                  {/* Details */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{submission.name}</h3>
                      <p className="text-sm text-gray-400">{submission.description}</p>
                    </div>

                    {/* Submitter Info */}
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-gray-500 mb-1">SUBMITTED BY</p>
                      <p className="text-sm font-medium text-white">{submission.userId.username}</p>
                      <p className="text-xs text-gray-400">{submission.userId.email}</p>
                    </div>

                    {/* Frame Details */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <p className="text-xs text-gray-500">Photo Frames</p>
                        <p className="text-lg font-bold text-white">{submission.frameCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="text-sm text-gray-300">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {showRejectModal === submission._id ? (
                      <div className="space-y-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <label className="block text-sm font-medium text-gray-300">
                          Rejection Reason (required)
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Explain why this frame is being rejected..."
                          className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-600"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRejectConfirm(submission._id)}
                            disabled={!rejectReason.trim() || processing === submission._id}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            {processing === submission._id ? "Rejecting..." : "Confirm Reject"}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowRejectModal(null);
                              setRejectReason("");
                            }}
                            variant="outline"
                            className="bg-white/5 border-white/20 text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <Button
                          onClick={() => handleApprove(submission._id, false)}
                          disabled={processing === submission._id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {processing === submission._id ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          onClick={() => setShowRejectModal(submission._id)}
                          variant="outline"
                          className="flex-1 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 font-semibold"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Premium Option Note */}
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-200">
                      💡 Currently approving as <strong>free frame</strong>. You can upgrade to premium in frame settings
                      after approval.
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => loadSubmissions(true)}
              disabled={loadingMore}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FrameApprovals;
