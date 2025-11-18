import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/services/api";

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return false;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await userAPI.changePassword(currentPassword, newPassword);
      setSuccess(true);

      // Redirect to account page after 2 seconds
      setTimeout(() => {
        navigate("/my-account");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a0a0a] p-4">
        <div className="bg-[#1a1a1a] border border-[#3d2418] rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="text-green-500" size={64} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-green-500">Password Changed!</h2>
          <p className="text-gray-300 mb-4">
            Your password has been successfully updated.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Redirecting to your account...
          </p>
          <Loader2 className="animate-spin mx-auto text-[#E53935]" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a0a0a] p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] border border-[#3d2418] rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock className="text-[#E53935]" size={32} />
          <h2 className="text-3xl font-bold text-white">Change Password</h2>
        </div>
        <p className="text-gray-400 text-center mb-6">
          Update your account password for better security.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-[#2d1810] border border-[#C62828] text-[#E53935] rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              className="w-full bg-[#0f0f0f] border border-[#3d2418] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition px-4 py-3 pr-12 placeholder:text-gray-500"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C62828] transition"
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full bg-[#0f0f0f] border border-[#3d2418] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition px-4 py-3 pr-12 placeholder:text-gray-500"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C62828] transition"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full bg-[#0f0f0f] border border-[#3d2418] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition px-4 py-3 pr-12 placeholder:text-gray-500"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C62828] transition"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#C62828] to-[#E53935] text-white py-3 rounded-lg font-semibold hover:from-[#B71C1C] hover:to-[#C62828] transition-all shadow-lg shadow-[#C62828]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </button>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/my-account")}
            className="inline-flex items-center gap-2 text-[#E53935] font-semibold hover:text-[#C62828] transition"
          >
            <ArrowLeft size={16} />
            Back to Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;