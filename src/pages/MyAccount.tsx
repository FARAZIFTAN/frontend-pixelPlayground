import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { userAPI } from "@/services/api";

const MyAccount = () => {
  const { user, checkAuth, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  type Profile = { name?: string; email?: string; bio?: string; avatarUrl?: string; avatar?: string };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load profile (prefer API fresh data)
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await userAPI.getProfile();
        if (!mounted) return;
  const wrapped = data as { data?: unknown };
  type Profile = { name?: string; email?: string; bio?: string; avatarUrl?: string; avatar?: string };
  const p = (wrapped.data ?? data) as Profile; // backend may wrap
  setProfile(p);
  setName(p.name ?? user?.name ?? "");
  setEmail(p.email ?? user?.email ?? "");
  setBio(p.bio ?? "");
  setAvatarPreview(p.avatarUrl ?? p.avatar ?? null);
      } catch (err: unknown) {
        // fallback to auth user
        setProfile(user);
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user]);

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
        await userAPI.uploadAvatar(avatarFile);
        // small delay to let backend process
      }

      // Update profile fields
      await userAPI.updateProfile({ name, email, bio });

      // Refresh auth/user data
      await checkAuth();

      toast({ title: "Profile updated", description: "Perubahan profil berhasil disimpan." });
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message || "Gagal menyimpan profil.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!ok) return;
    setLoading(true);
    try {
      await userAPI.deleteAccount();
      toast({ title: "Account deleted", description: "Your account has been removed." });
      logout();
      navigate("/");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message || "Failed to delete account.", variant: "destructive" });
    } finally {
      setLoading(false);
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
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white">My Account</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">Informasi profil akunmu. Kamu bisa menambahkan foto profil atau memperbarui data kontak di sini.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-secondary border border-border rounded-lg p-6 flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-4 overflow-hidden">
                {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-white/70" />
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>

            <h3 className="text-lg font-semibold text-white">{profile?.name ?? "-"}</h3>
            <p className="text-xs text-muted-foreground">{profile?.email ?? "-"}</p>

            <div className="mt-4 w-full">
              <div className="flex gap-2">
                <Button onClick={() => inputRef.current?.click()} className="flex-1 bg-[#C62828] hover:bg-[#E53935]">Change Photo</Button>
                <Button variant="outline" onClick={() => { setAvatarFile(null); setAvatarPreview(profile?.avatarUrl ?? null); }}>Reset</Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-secondary border border-border rounded-lg p-6">
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-1">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-white" />
            </div>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-white" />
            </div>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-1">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2 text-white" />
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="bg-[#C62828] hover:bg-[#E53935]" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
              <Button variant="outline" onClick={() => navigate('/change-password')}>Manage Password</Button>
              <Button variant="ghost" className="ml-auto text-red-400" onClick={handleDeleteAccount}>Delete Account</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
