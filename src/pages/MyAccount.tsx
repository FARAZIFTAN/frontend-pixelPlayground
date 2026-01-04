import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, History, Shield, Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { userAPI } from "@/services/api";

const MyAccount = () => {
  const { user, checkAuth, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load profile
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await userAPI.getProfile();
        if (!mounted) return;
        const p = (data as any).data?.user || (data as any).user || data;
        console.log('Loaded profile data:', p);
        setProfile(p);
        setName(p.name || "");
        setEmail(p.email || "");
        setPhone(p.phone || "");
        // Add cache-busting timestamp to profile picture URL
        if (p.profilePicture) {
          const profilePicUrl = `${p.profilePicture}?t=${Date.now()}`;
          console.log('Setting avatar preview to:', profilePicUrl);
          setAvatarPreview(profilePicUrl);
        } else {
          console.log('No profile picture found');
          setAvatarPreview(null);
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Avatar selection
  const handleSelectAvatar = (file?: File) => {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleSelectAvatar(f);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // If avatar selected, upload first
      if (avatarFile) {
        const uploadResult = await userAPI.uploadAvatar(avatarFile);
        const newProfilePicUrl = (uploadResult as any)?.data?.profilePicture;
        
        // Update preview with cache-busting parameter
        if (newProfilePicUrl) {
          const timestamp = Date.now();
          setAvatarPreview(`${newProfilePicUrl}?t=${timestamp}`);
          // Update profile state as well
          setProfile((prev: any) => ({
            ...prev,
            profilePicture: newProfilePicUrl
          }));
        }
        
        toast({ title: "Success", description: "Profile picture updated successfully." });
        setAvatarFile(null); // Clear the file after successful upload
      }

      // Update profile fields
      if (name || email || phone) {
        await userAPI.updateProfile({ name, email, phone });
      }

      // Refresh auth/user data (silent mode to prevent logout on temporary errors)
      await checkAuth(true);

      // Reload profile data to get fresh info from server
      const freshData = await userAPI.getProfile();
      const freshProfile = (freshData as any).data?.user || (freshData as any).user || freshData;
      setProfile(freshProfile);
      
      // Update avatar preview with fresh URL
      if (freshProfile.profilePicture) {
        setAvatarPreview(`${freshProfile.profilePicture}?t=${Date.now()}`);
      }

      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (err: any) {
      // Check if it's an authentication error
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        // Don't navigate immediately, let user see the message
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: err.message || "Failed to update profile.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    try {
      await userAPI.deleteAvatar();
      setAvatarPreview(null);
      setAvatarFile(null);
      setProfile({ ...profile, profilePicture: null });
      await checkAuth(true);
      toast({ title: "Success", description: "Profile picture removed successfully." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to remove profile picture.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter your password to confirm.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await userAPI.deactivateAccount(password);
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated. You can contact support to reactivate."
      });
      logout();
      navigate("/");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to deactivate account.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowDeactivateModal(false);
      setPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter your password to confirm.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await userAPI.deleteAccount(password);
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted."
      });
      logout();
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete account.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <User className="w-8 h-8 text-[#C62828]" />
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white inline-flex items-center gap-2">
              My Account
              {profile?.isPremium && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-sm">
                  <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-amber-400 font-semibold">Pro</span>
                </span>
              )}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Manage your account settings and profile information.
          </p>
          
          {/* Pro Status Card */}
          {profile?.isPremium && profile?.premiumExpiresAt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mt-4 p-4 rounded-lg bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border border-amber-500/20"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-400">Status Akun Pro Aktif</p>
                  <p className="text-xs text-gray-400">
                    Berlaku hingga: {new Date(profile.premiumExpiresAt).toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Picture Section */}
          <div className="md:col-span-1 bg-secondary border border-border rounded-lg p-6 flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-4 overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview.startsWith('blob:') || avatarPreview.startsWith('http') 
                      ? avatarPreview 
                      : `http://localhost:3001${avatarPreview}`
                    } 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', avatarPreview);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Camera className="w-12 h-12 text-white/70" />
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>

            <h3 className="text-lg font-semibold text-white">{profile?.name || user?.name || "-"}</h3>
            <p className="text-xs text-muted-foreground">{profile?.email || user?.email || "-"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {profile?.isEmailVerified ? "✅ Email Verified" : "⚠️ Email Not Verified"}
            </p>

            <div className="mt-4 w-full space-y-2">
              <Button onClick={() => inputRef.current?.click()} className="w-full bg-[#C62828] hover:bg-[#E53935]" size="sm">
                Change Photo
              </Button>
              {avatarPreview && (
                <Button variant="outline" onClick={handleRemoveAvatar} className="w-full" size="sm" disabled={loading}>
                  Remove Photo
                </Button>
              )}
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="md:col-span-2 bg-secondary border border-border rounded-lg p-6">
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-1">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-white"
                placeholder="Enter your full name"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-white"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-1">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-white"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="bg-[#C62828] hover:bg-[#E53935]" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/change-password')}>
                Change Password
              </Button>
            </div>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="mt-8 bg-secondary border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Security
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-white"
              onClick={() => setShowDeactivateModal(true)}
            >
              Deactivate Account
            </Button>
            <Button
              variant="outline"
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Deactivate Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to deactivate your account? You can contact support to reactivate it later.
            </p>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-1">Enter your password to confirm</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-white"
                placeholder="Your password"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowDeactivateModal(false); setPassword(""); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleDeactivateAccount}
                disabled={loading}
              >
                {loading ? 'Deactivating...' : 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. Your account and all associated data will be permanently deleted after 30 days.
            </p>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-1">Enter your password to confirm</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-white"
                placeholder="Your password"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteModal(false); setPassword(""); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccount;
