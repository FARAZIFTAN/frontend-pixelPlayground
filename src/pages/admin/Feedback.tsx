import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Trash2, Check, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { feedbackAPI } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Feedback {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  updatedAt: string;
}

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'replied'>('all');

  // Load feedbacks
  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);
      const response = await feedbackAPI.getAll() as { success: boolean; data: { feedbacks: Feedback[] } };
      if (response.success) {
        setFeedbacks(response.data.feedbacks);
      } else {
        toast.error('Failed to load feedbacks');
      }
    } catch (error) {
      console.error('Load feedbacks error:', error);
      toast.error('Failed to load feedbacks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // Update feedback status
  const handleUpdateStatus = async (id: string, newStatus: 'unread' | 'read' | 'replied') => {
    try {
      const response = await feedbackAPI.updateStatus(id, newStatus) as { success: boolean };
      if (response.success) {
        setFeedbacks(feedbacks.map(f => 
          f._id === id ? { ...f, status: newStatus } : f
        ));
        if (selectedFeedback?._id === id) {
          setSelectedFeedback({ ...selectedFeedback, status: newStatus });
        }
        toast.success(`Feedback marked as ${newStatus}`);
      } else {
        toast.error('Failed to update feedback');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update feedback');
    }
  };

  // Delete feedback
  const handleDelete = async (id: string) => {
    try {
      const response = await feedbackAPI.delete(id) as { success: boolean };
      if (response.success) {
        setFeedbacks(feedbacks.filter(f => f._id !== id));
        setIsDetailsOpen(false);
        setSelectedFeedback(null);
        toast.success('Feedback deleted');
      } else {
        toast.error('Failed to delete feedback');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete feedback');
    }
  };

  // Filter feedbacks
  const filteredFeedbacks = filterStatus === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.status === filterStatus);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-500/20 text-red-700';
      case 'read':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'replied':
        return 'bg-green-500/20 text-green-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">User Feedback</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {feedbacks.length}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'unread', 'read', 'replied'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status as 'all' | 'unread' | 'read' | 'replied')}
              className="capitalize"
            >
              {status === 'all' ? 'All' : status}
              {status !== 'all' && (
                <span className="ml-2 text-xs">
                  ({feedbacks.filter(f => f.status === status).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Feedback List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No feedbacks found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFeedbacks.map((feedback, index) => (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Name and Email */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">{feedback.name}</h3>
                        <Badge 
                          variant="outline"
                          className={`capitalize ${getStatusColor(feedback.status)}`}
                        >
                          {feedback.status}
                        </Badge>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{feedback.email}</span>
                      </div>

                      {/* Message Preview */}
                      <p className="text-sm line-clamp-2 mb-3">
                        {feedback.message}
                      </p>

                      {/* Date */}
                      <p className="text-xs text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setIsDetailsOpen(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {feedback.status !== 'read' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateStatus(feedback._id, 'read')}
                          title="Mark as Read"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(feedback._id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Name</label>
                <p className="mt-1 text-lg">{selectedFeedback.name}</p>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Email</label>
                <p className="mt-1 text-base">{selectedFeedback.email}</p>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Status</label>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {(['unread', 'read', 'replied'] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedFeedback.status === status ? 'default' : 'outline'}
                      onClick={() => handleUpdateStatus(selectedFeedback._id, status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Message</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>
              </div>

              {/* Date */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Submitted: {new Date(selectedFeedback.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(selectedFeedback.updatedAt).toLocaleString()}</p>
              </div>

              {/* Delete Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedFeedback._id)}
                >
                  Delete Feedback
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackManagement;
