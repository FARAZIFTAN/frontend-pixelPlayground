import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { authAPI } from "@/services/api";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      // Optionally validate token here
      setTokenValid(true);
    } else {
      setTokenValid(false);
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
      await authAPI.resetPassword(token, password);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a0a0a] p-4">
        <div className="bg-[#1a1a1a] border border-[#3d2418] rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <XCircle className="text-red-500" size={64} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-500">Invalid Reset Link</h2>
          <p className="text-gray-300 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="bg-[#C62828] hover:bg-[#E53935] text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a0a0a] p-4">
        <div className="bg-[#1a1a1a] border border-[#3d2418] rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="text-green-500" size={64} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-green-500">Password Reset Successful!</h2>
          <p className="text-gray-300 mb-4">
            Your password has been successfully reset. You can now login with your new password.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Redirecting to login page...
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
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
        </div>
        <p className="text-gray-400 text-center mb-6">
          Enter your new password below.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-[#2d1810] border border-[#C62828] text-[#E53935] rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-[#0f0f0f] border border-[#3d2418] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition px-4 py-3 pr-12 placeholder:text-gray-500"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C62828] transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              placeholder="Re-enter your password"
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
              Resetting Password...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;