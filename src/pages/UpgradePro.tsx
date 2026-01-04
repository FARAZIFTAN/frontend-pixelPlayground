import { motion } from "framer-motion";
import { ArrowLeft, Crown, Zap, Shield, Star, Upload, Check, CheckCircle, AlertCircle, Loader2, X, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProPaymentGuide from "@/components/ProPaymentGuide";
import { createPayment, uploadPaymentProof, getUserPayments, cancelPayment } from "@/services/paymentAPI";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

const UpgradePro = () => {
  const { user, checkAuth } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [userPayments, setUserPayments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's payments on mount
  useEffect(() => {
    if (user) {
      loadUserPayments();
    }
  }, [user]);

  // Auto-refresh user data when payment is approved
  useEffect(() => {
    if (currentPayment?.status === 'approved' && !user?.isPremium) {
      console.log('[UpgradePro] Payment approved but user not premium, refreshing auth...');
      checkAuth(true);
    }
  }, [currentPayment?.status, user?.isPremium, checkAuth]);

  const loadUserPayments = async () => {
    try {
      const data = await getUserPayments();
      setUserPayments(data.payments);
      
      // Find active pending payment
      const pending = data.payments.find(
        (p: any) => p.status === 'pending_payment' || p.status === 'pending_verification'
      );
      if (pending) {
        setCurrentPayment(pending);
        setSelectedPackage(pending.packageType);
      }
      
      // If we have an approved payment and user is not premium yet, refresh auth
      const approved = data.payments.find((p: any) => p.status === 'approved');
      if (approved && !user?.isPremium) {
        console.log('[UpgradePro] Found approved payment, refreshing user auth...');
        await checkAuth(false);
        window.location.reload(); // Force page reload to ensure UI updates
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  // Pro packages - Single package only
  const packages = [
    {
      name: "KaryaKlik Pro",
      price: "Rp 150.000",
      priceValue: 150000,
      duration: "/ bulan",
      durationMonths: 1,
      packageType: "pro",
      features: [
        "AI Template Creator (Unlimited)",
        "Upload Custom Frame (Unlimited)",
        "Unlimited Photo Booth Usage",
        "24/7 Priority Support",
        "Remove Watermark",
        "HD Quality Export (1080p)",
        "Custom Branding",
        "Analytics Dashboard",
        "Email Support",
        "Early Access to New Features",
      ],
      popular: true,
      color: "purple",
    },
  ];

  // Handle package selection
  const handleSelectPackage = async (pkg: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to upgrade your account",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPayment(true);
    try {
      const paymentData = {
        packageName: pkg.name,
        packageType: pkg.packageType,
        amount: pkg.priceValue,
        durationMonths: pkg.durationMonths,
      };

      const data = await createPayment(paymentData);
      setCurrentPayment(data.payment);
      setSelectedPackage(pkg.packageType);
      
      toast({
        title: "Payment Created",
        description: "Silakan lakukan transfer dan upload bukti pembayaran",
      });

      // Scroll to payment section
      setTimeout(() => {
        document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (error: any) {
      console.error('Payment creation error:', error);
      
      // If there's an existing pending payment, use it
      if (error.error?.includes('already have a pending payment')) {
        const existingPayment = error.payment;
        if (existingPayment) {
          // Check if it's old package type
          if (existingPayment.packageType && !['pro'].includes(existingPayment.packageType)) {
            // Old payment - try to delete it automatically
            try {
              await cancelPayment(existingPayment._id);
              
              toast({
                title: "Old Payment Removed",
                description: "Payment lama telah dihapus. Silakan klik Upgrade lagi.",
              });
              
              await loadUserPayments();
              return;
            } catch (cancelError) {
              console.error('Failed to auto-cancel old payment:', cancelError);
            }
          }
          
          setCurrentPayment(existingPayment);
          setSelectedPackage(existingPayment.packageType);
          
          toast({
            title: "Pending Payment Found",
            description: "Anda sudah memiliki pembayaran yang menunggu. Silakan selesaikan atau batalkan pembayaran tersebut.",
          });

          // Scroll to payment section
          setTimeout(() => {
            document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }
      } else {
        toast({
          title: "Error",
          description: error.error || error.details || "Failed to create payment",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreatingPayment(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG/PNG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file upload
  const handleUploadProof = async () => {
    if (!selectedFile || !currentPayment) return;

    setIsUploading(true);
    try {
      await uploadPaymentProof(currentPayment._id, selectedFile);
      
      toast({
        title: "Success",
        description: "Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.",
      });

      // Reload payments
      await loadUserPayments();
      
      // Reset file selection
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.error || "Failed to upload payment proof",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Clear file selection
  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cancel pending payment
  const handleCancelPayment = async () => {
    if (!currentPayment) return;

    if (!confirm('Apakah Anda yakin ingin membatalkan pembayaran ini?')) {
      return;
    }

    setIsCanceling(true);
    try {
      await cancelPayment(currentPayment._id);
      
      toast({
        title: "Payment Canceled",
        description: "Pembayaran berhasil dibatalkan. Anda bisa membuat pembayaran baru.",
      });

      // Clear current payment and reload
      setCurrentPayment(null);
      setSelectedPackage(null);
      await loadUserPayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.error || "Failed to cancel payment",
        variant: "destructive",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D0D] to-[#1A1A1A]">
      {/* Pro Status Banner - Show when user is already Pro */}
      {user?.isPremium && (
        <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border-b border-amber-500/30">
          <div className="container mx-auto px-4 lg:px-8 py-4">
            <div className="flex items-center justify-center gap-3 text-center">
              <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
              <div>
                <p className="text-amber-400 font-bold text-lg">
                  ✨ Akun Pro Aktif!
                </p>
                {user.premiumExpiresAt && (
                  <p className="text-sm text-gray-300">
                    Berlaku hingga: {new Date(user.premiumExpiresAt).toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header with Back Button */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Link to="/">
            <Button 
              variant="ghost" 
              className="mb-8 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Home
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6"
            >
              <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-sm font-medium text-amber-400">
                Upgrade to Pro
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-white">
              Tingkatkan Pengalaman Anda
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Dapatkan akses penuh ke semua fitur premium KaryaKlik. 
              Pilih paket yang sesuai dengan kebutuhan Anda.
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { icon: Zap, text: "AI Generation Lebih Banyak" },
                { icon: Shield, text: "Priority Support" },
                { icon: Star, text: "HD/4K Export Quality" },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm">
                    <benefit.icon className="w-4 h-4 mr-2" />
                    {benefit.text}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative"
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-6 py-1.5 text-sm">
                      Recommended
                    </Badge>
                  </div>
                )}
                <Card 
                  className="gradient-card border-0 shadow-soft ring-2 ring-purple-500/50"
                >
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-3xl font-bold text-white mb-3">
                        {pkg.name}
                      </h3>
                      <div className="flex items-baseline justify-center gap-2 mb-4">
                        <span className="text-5xl font-bold text-white">
                          {pkg.price}
                        </span>
                        <span className="text-gray-400 text-lg">{pkg.duration}</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Akses penuh ke semua fitur premium KaryaKlik
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                          <Star className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      size="lg"
                      onClick={() => handleSelectPackage(pkg)}
                      disabled={isCreatingPayment || (currentPayment && currentPayment.status === 'pending_verification')}
                    >
                      {isCreatingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : currentPayment?.packageType === pkg.packageType ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Paket Dipilih
                        </>
                      ) : (
                        'Upgrade Sekarang'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Upload Section - Show when payment is created */}
      {currentPayment && (
        <section id="payment-section" className="py-12 bg-[#1A1A1A]">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="gradient-card border-0 shadow-soft">
                <CardContent className="p-8">
                  {/* Payment Status Header */}
                  <div className="text-center mb-8">
                    <Badge 
                      className={`${
                        currentPayment.status === 'pending_payment' 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                          : currentPayment.status === 'pending_verification'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : currentPayment.status === 'approved'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      } px-4 py-2 text-sm mb-4`}
                    >
                      {currentPayment.status === 'pending_payment' && 'Menunggu Pembayaran'}
                      {currentPayment.status === 'pending_verification' && 'Menunggu Verifikasi'}
                      {currentPayment.status === 'approved' && 'Pembayaran Disetujui'}
                      {currentPayment.status === 'rejected' && 'Pembayaran Ditolak'}
                    </Badge>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {currentPayment.packageName}
                    </h3>
                    <p className="text-gray-400">
                      Total: <span className="text-white font-semibold">Rp {currentPayment.amount.toLocaleString('id-ID')}</span>
                    </p>
                  </div>

                  {/* Bank Transfer Details */}
                  <div className="bg-white/5 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Transfer ke Rekening:
                    </h4>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between">
                        <span>Bank:</span>
                        <span className="font-semibold text-white">{currentPayment.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>No. Rekening:</span>
                        <span className="font-mono text-white">{currentPayment.bankAccountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Atas Nama:</span>
                        <span className="font-semibold text-white">{currentPayment.bankAccountName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Upload Proof Section */}
                  {currentPayment.status === 'pending_payment' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-purple-400" />
                        Upload Bukti Pembayaran
                      </h4>

                      {/* File Input */}
                      <div className="relative">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="payment-proof"
                        />
                        <label
                          htmlFor="payment-proof"
                          className="block cursor-pointer"
                        >
                          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                            {previewUrl ? (
                              <div className="relative">
                                <img 
                                  src={previewUrl} 
                                  alt="Payment proof preview" 
                                  className="max-h-64 mx-auto rounded-lg"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleClearFile();
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                                <p className="text-gray-400">
                                  Klik untuk pilih gambar bukti transfer
                                </p>
                                <p className="text-sm text-gray-500">
                                  JPG, PNG (Max 5MB)
                                </p>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Upload Button */}
                      {selectedFile && (
                        <Button
                          onClick={handleUploadProof}
                          disabled={isUploading}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          size="lg"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 mr-2" />
                              Upload Bukti Pembayaran
                            </>
                          )}
                        </Button>
                      )}

                      {/* Cancel Payment Button */}
                      <Button
                        onClick={handleCancelPayment}
                        disabled={isCanceling}
                        variant="outline"
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        {isCanceling ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Batalkan Pembayaran
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Verification Pending Message */}
                  {currentPayment.status === 'pending_verification' && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-spin" />
                        <h4 className="text-lg font-semibold text-white mb-2">
                          Menunggu Verifikasi Admin
                        </h4>
                        <p className="text-gray-300">
                          Pembayaran Anda sedang diverifikasi oleh tim kami. 
                          Proses ini biasanya memakan waktu maksimal 1x24 jam.
                        </p>
                      </div>
                      {currentPayment.paymentProofUrl && (
                        <div className="mt-6">
                          <h5 className="text-sm font-semibold text-gray-300 mb-3 text-center">Bukti Pembayaran Anda:</h5>
                          <div className="bg-black/30 rounded-lg p-4">
                            <img 
                              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${currentPayment.paymentProofUrl}`}
                              alt="Payment proof"
                              className="max-h-64 w-full object-contain mx-auto rounded-lg border border-white/20 cursor-pointer hover:border-white/40 transition-colors"
                              onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${currentPayment.paymentProofUrl}`, '_blank')}
                            />
                            <p className="text-xs text-gray-400 text-center mt-2">Klik gambar untuk melihat ukuran penuh</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Approved Message */}
                  {currentPayment.status === 'approved' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                        <h4 className="text-2xl font-bold text-white mb-2">
                          🎉 Pembayaran Berhasil!
                        </h4>
                        <p className="text-gray-300 mb-2">
                          Akun Pro Anda telah aktif. Selamat menikmati semua fitur premium!
                        </p>
                        {user?.isPremium && user?.premiumExpiresAt && (
                          <p className="text-sm text-green-400">
                            Aktif hingga: {new Date(user.premiumExpiresAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        )}
                        {!user?.isPremium && (
                          <div className="mt-4">
                            <p className="text-xs text-amber-400 mb-2">Status Pro belum muncul? Refresh halaman:</p>
                            <Button
                              onClick={() => window.location.reload()}
                              className="bg-amber-600 hover:bg-amber-700"
                              size="sm"
                            >
                              Refresh Halaman
                            </Button>
                          </div>
                        )}
                      </div>
                      {currentPayment.paymentProofUrl && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-400 text-center mb-2">Bukti Pembayaran:</p>
                          <img 
                            src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${currentPayment.paymentProofUrl}`}
                            alt="Payment proof"
                            className="max-h-32 mx-auto rounded-lg border border-white/10 opacity-50"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejected Message */}
                  {currentPayment.status === 'rejected' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2">
                            Pembayaran Ditolak
                          </h4>
                          {currentPayment.rejectionReason && (
                            <p className="text-gray-300 mb-2">
                              <span className="font-semibold">Alasan:</span> {currentPayment.rejectionReason}
                            </p>
                          )}
                          <p className="text-gray-400 text-sm">
                            Silakan upload bukti pembayaran yang baru dengan informasi yang benar.
                          </p>
                        </div>
                      </div>

                      {/* Show rejected payment proof */}
                      {currentPayment.paymentProofUrl && (
                        <div className="mb-4 bg-black/30 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-2">Bukti Pembayaran yang Ditolak:</p>
                          <img 
                            src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${currentPayment.paymentProofUrl}`}
                            alt="Rejected payment proof"
                            className="max-h-32 mx-auto rounded-lg border border-red-500/20 opacity-60"
                          />
                        </div>
                      )}
                      
                      {/* Allow re-upload for rejected payments */}
                      <Button
                        onClick={() => {
                          setCurrentPayment({ ...currentPayment, status: 'pending_payment' });
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Bukti Baru
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Payment Guide Section */}
      <ProPaymentGuide />

      {/* FAQ Pro Features */}
      <section className="py-16 bg-[#1A1A1A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white">
              Pertanyaan Umum Akun Pro
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Bagaimana cara membatalkan langganan?",
                a: "Anda dapat membatalkan langganan kapan saja melalui halaman Settings. Akun Pro akan tetap aktif hingga akhir periode yang sudah dibayar.",
              },
              {
                q: "Apakah saya bisa upgrade/downgrade paket?",
                a: "Ya, Anda bisa upgrade atau downgrade paket kapan saja. Perbedaan harga akan dihitung secara proporsional.",
              },
              {
                q: "Apa yang terjadi jika pembayaran ditolak?",
                a: "Anda akan menerima notifikasi dengan alasan penolakan dan dapat mengunggah bukti pembayaran yang baru. Pastikan nominal dan rekening tujuan sudah benar.",
              },
              {
                q: "Berapa lama proses verifikasi pembayaran?",
                a: "Verifikasi dilakukan maksimal 1x24 jam setelah Anda mengunggah bukti pembayaran. Anda akan mendapat notifikasi setelah pembayaran diverifikasi.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="gradient-card border-0 shadow-soft">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-gray-300">{faq.a}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UpgradePro;
