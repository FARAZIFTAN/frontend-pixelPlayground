import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authAPI } from "@/services/api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email) {
      setError("Please enter your email address");
      return false;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a0a0a] p-4">
        <div className="bg-[#1a1a1a] border border-[#3d2418] rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="text-[#E53935]" size={64} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#E53935]">Check Your Email!</h2>
          <p className="text-gray-300 mb-4">
            If an account with that email exists, we've sent you a password reset link.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[#E53935] font-semibold hover:text-[#C62828] transition"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
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
          <Mail className="text-[#E53935]" size={32} />
          <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
        </div>
        <p className="text-gray-400 text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-[#2d1810] border border-[#C62828] text-[#E53935] rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="w-full bg-[#0f0f0f] border border-[#3d2418] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition px-4 py-3 placeholder:text-gray-500"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#C62828] to-[#E53935] text-white py-3 rounded-lg font-semibold hover:from-[#B71C1C] hover:to-[#C62828] transition-all shadow-lg shadow-[#C62828]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Sending Reset Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[#E53935] font-semibold hover:text-[#C62828] transition"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;