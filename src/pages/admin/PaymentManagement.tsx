import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Loader2, 
  AlertCircle,
  DollarSign,
  User,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { getAdminPayments, approvePayment, rejectPayment, Payment } from '@/services/paymentAPI';
import { format } from 'date-fns';

const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending_verification' | 'approved' | 'rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load payments
  useEffect(() => {
    loadPayments();
  }, [activeTab]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const statusFilter = activeTab === 'all' ? undefined : activeTab;
      const data = await getAdminPayments(statusFilter);
      setPayments(data.payments);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.error || 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!selectedPayment) return;

    setIsProcessing(true);
    try {
      await approvePayment(selectedPayment._id, adminNotes);
      toast({
        title: 'Success',
        description: 'Payment approved successfully',
      });
      setIsApproveDialogOpen(false);
      setAdminNotes('');
      setSelectedPayment(null);
      loadPayments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.error || 'Failed to approve payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Rejection reason is required',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await rejectPayment(selectedPayment._id, rejectionReason, adminNotes);
      toast({
        title: 'Success',
        description: 'Payment rejected successfully',
      });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setAdminNotes('');
      setSelectedPayment(null);
      loadPayments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.error || 'Failed to reject payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Pembayaran
          </Badge>
        );
      case 'pending_verification':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Verifikasi
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Tab buttons
  const tabs = [
    { id: 'all', label: 'Semua', icon: DollarSign },
    { id: 'pending_verification', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D0D] to-[#1A1A1A] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Payment Management
          </h1>
          <p className="text-gray-400">
            Kelola pembayaran akun Pro dari pengguna
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'bg-primary' : ''}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Payments Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : payments.length === 0 ? (
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">No payments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {payments.map((payment) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="gradient-card border-0 shadow-soft hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-white flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          {payment.packageName}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <User className="w-4 h-4" />
                          <span>{(payment as any).userId?.name || 'Unknown User'}</span>
                          <span className="text-gray-600">•</span>
                          <span>{(payment as any).userId?.email || ''}</span>
                        </div>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Payment Details */}
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white font-semibold">
                            Rp {payment.amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Package Type:</span>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {payment.packageType.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white">
                            {payment.durationMonths} {payment.durationMonths > 1 ? 'months' : 'month'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created:</span>
                          <span className="text-white flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(payment.createdAt), 'dd MMM yyyy, HH:mm')}
                          </span>
                        </div>
                      </div>

                      {/* Bank Details & Actions */}
                      <div className="space-y-3">
                        <div className="bg-white/5 rounded-lg p-3 space-y-2">
                          <p className="text-xs text-gray-400">Transfer Details:</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Bank:</span>
                              <span className="text-white font-mono">{payment.bankName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Account:</span>
                              <span className="text-white font-mono">{payment.bankAccountNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Name:</span>
                              <span className="text-white">{payment.bankAccountName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {payment.paymentProofUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsProofDialogOpen(true);
                              }}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Proof
                            </Button>
                          )}

                          {payment.status === 'pending_verification' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsApproveDialogOpen(true);
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsRejectDialogOpen(true);
                                }}
                                className="flex-1"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Rejection Reason Display */}
                        {payment.status === 'rejected' && payment.rejectionReason && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-xs text-red-400 mb-1">Rejection Reason:</p>
                            <p className="text-sm text-gray-300">{payment.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Payment Proof Dialog */}
      <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
        <DialogContent className="max-w-4xl bg-[#1A1A1A] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Payment Proof</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedPayment?.packageName} - Rp {selectedPayment?.amount.toLocaleString('id-ID')}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment?.paymentProofUrl && (
            <div className="flex justify-center">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${selectedPayment.paymentProofUrl}`}
                alt="Payment Proof"
                className="max-h-[70vh] rounded-lg border border-white/10"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProofDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Approve Payment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Confirm approval for {selectedPayment?.packageName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-notes" className="text-white">
                Admin Notes (Optional)
              </Label>
              <Textarea
                id="approve-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                className="bg-white/5 border-gray-700 text-white"
              />
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                This will activate Pro account for the user immediately.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsApproveDialogOpen(false);
                setAdminNotes('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Payment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-white">
                Rejection Reason <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Nominal transfer tidak sesuai, bukti transfer tidak jelas, dll."
                className="bg-white/5 border-gray-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reject-notes" className="text-white">
                Admin Notes (Optional)
              </Label>
              <Textarea
                id="reject-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any internal notes..."
                className="bg-white/5 border-gray-700 text-white"
              />
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                User akan diminta untuk upload bukti pembayaran baru.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason('');
                setAdminNotes('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              variant="destructive"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
