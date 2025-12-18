import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Check, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // "Gallery" atau "AI Template Creator"
  requireUpgrade?: boolean; // Jika true, user HARUS upgrade atau tidak bisa akses
}

const PremiumModal = ({ isOpen, onClose, feature = "this feature", requireUpgrade = false }: PremiumModalProps) => {
  const { upgradeToPremium, checkAuth } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan');

  const handleUpgrade = () => {
    setStep('payment');
  };

  const handleDummyPayment = async () => {
    setIsProcessing(true);
    
    // Simulasi loading payment
    setTimeout(async () => {
      setIsProcessing(false);
      setStep('success');
      
      // Update user to premium after 1 second
      setTimeout(async () => {
        // Update to premium
        upgradeToPremium();
        
        // Wait sedikit untuk state propagation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force refresh auth state untuk update semua komponen
        await checkAuth(true);
        
        // Wait lagi untuk memastikan semua komponen ter-update
        await new Promise(resolve => setTimeout(resolve, 200));
        
        toast.success("🎉 Welcome to Premium! You now have full access!", {
          duration: 4000,
          icon: "👑",
        });
        
        // Close modal after success dengan delay lebih lama untuk state propagation
        setTimeout(() => {
          onClose();
          setStep('plan'); // Reset for next time
        }, 1500);
      }, 1000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pt-24">
          {/* Backdrop - tidak menutupi navbar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={requireUpgrade ? undefined : onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            style={{ top: '80px' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md z-50"
          >
            <Card className="border-2 border-primary/50 shadow-2xl bg-gradient-to-br from-background via-background to-primary/5">
              <CardContent className="p-6">
                {/* Close Button - Hidden jika requireUpgrade */}
                {!requireUpgrade && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Step 1: Plan Selection */}
                {step === 'plan' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        className="inline-block mb-3"
                      >
                        <Crown className="w-12 h-12 text-primary" />
                      </motion.div>
                      <h2 className="text-2xl font-bold mb-1">Upgrade to Premium</h2>
                      <p className="text-sm text-muted-foreground">
                        Unlock {feature}
                      </p>
                    </div>

                    {/* Premium Features - Compact */}
                    <div className="space-y-2 bg-secondary/30 rounded-xl p-4">
                      <h3 className="font-semibold text-sm mb-2">Premium Benefits:</h3>
                      {[
                        "My Gallery Access",
                        "AI Template Creator",
                        "Premium Templates",
                        "Unlimited Sessions"
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-xs">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pricing - Compact */}
                    <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl p-4 text-center">
                      <div className="text-xs text-muted-foreground mb-1">One-time payment</div>
                      <div className="text-3xl font-bold mb-1">
                        <span className="text-primary">Rp 50.000</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Lifetime Access</div>
                    </div>

                    {/* CTA Button - Compact */}
                    <Button
                      onClick={handleUpgrade}
                      className="w-full py-4 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade Now
                      <Crown className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Dummy Payment */}
                {step === 'payment' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <CreditCard className="w-12 h-12 text-primary mx-auto mb-3" />
                      <h2 className="text-2xl font-bold mb-1">Payment Simulation</h2>
                      <p className="text-sm text-muted-foreground">
                        Dummy payment for demo
                      </p>
                    </div>

                    {/* Dummy Payment Details - Compact */}
                    <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Premium Plan</span>
                        <span className="font-semibold">Lifetime</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-semibold text-primary">Rp 50.000</span>
                      </div>
                      <div className="border-t border-border pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-primary">Rp 50.000</span>
                        </div>
                      </div>
                    </div>

                    {/* Dummy Card Info - Compact */}
                    <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl p-4">
                      <div className="text-xs text-muted-foreground mb-2">Payment Method (Dummy)</div>
                      <div className="flex items-center gap-3 text-sm">
                        <CreditCard className="w-6 h-6" />
                        <div>
                          <div className="font-mono text-sm">•••• •••• •••• 1234</div>
                          <div className="text-xs text-muted-foreground">Dummy Card</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Button - Compact */}
                    <Button
                      onClick={handleDummyPayment}
                      disabled={isProcessing}
                      className="w-full py-4 text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Complete Payment (Dummy)
                        </>
                      )}
                    </Button>

                    <button
                      onClick={() => setStep('plan')}
                      className="w-full text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      ← Back to plan
                    </button>
                  </motion.div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-4"
                    >
                      <Check className="w-12 h-12 text-green-500" />
                    </motion.div>

                    <div>
                      <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
                      <p className="text-muted-foreground">
                        Welcome to Premium! 🎉
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Crown className="w-6 h-6" />
                      <span className="font-semibold">You are now a Premium Member</span>
                      <Crown className="w-6 h-6" />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Redirecting you back...
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PremiumModal;
