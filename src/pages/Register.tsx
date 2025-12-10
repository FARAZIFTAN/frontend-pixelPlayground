import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff, CheckCircle2, Camera, User, Mail, Lock } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { authAPI } from "@/services/api";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (name.length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
      await register(name, email, password);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError("");

    try {
      // Send Google token to backend (same endpoint handles both login and register)
      const response = await authAPI.googleAuth(credentialResponse.credential!);
      
      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      console.log('✅ Google sign up successful:', response.user.email);
      
      // Show success and redirect
      setSuccess(true);
      setTimeout(() => {
        navigate("/", { replace: true });
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('❌ Google sign up error:', err);
      setError(err.message || "Google sign up failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Google sign up failed');
    setError("Google sign up failed. Please try again.");
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a0a0a] p-4">
        <div className="bg-[#1a1a1a] border border-[#3d2418] rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="text-[#E53935]" size={64} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#E53935]">Registration Successful!</h2>
          <p className="text-gray-300 mb-4">
            Your account has been created successfully. Please check your email to verify your account before logging in.
          </p>
          <Loader2 className="animate-spin mx-auto text-[#E53935]" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0e0e] via-[#2d1818] to-[#0F0F0F] p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0F0F0F]/90 backdrop-blur-xl border border-[#C62828]/30 rounded-2xl shadow-2xl p-6 w-full max-w-lg"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="bg-gradient-to-br from-[#C62828] to-[#E53935] p-2.5 rounded-full shadow-lg">
            <Camera className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">KaryaKlik</h2>
        </div>
        <p className="text-gray-400 text-center mb-5 text-sm">Create your account to get started</p>

        {error && (
          <div className="mb-3 p-2.5 bg-[#C62828]/20 border border-[#C62828]/50 text-red-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2.5 bg-[#1a1a1a] border border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder:text-gray-500 text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="email"
                className="w-full pl-9 pr-3 py-2.5 bg-[#1a1a1a] border border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder:text-gray-500 text-sm"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-9 pr-9 py-2.5 bg-[#1a1a1a] border border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder:text-gray-500 text-sm"
                placeholder="Min. 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full pl-9 pr-9 py-2.5 bg-[#1a1a1a] border border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder:text-gray-500 text-sm"
                placeholder="Re-enter"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#C62828] to-[#E53935] text-white py-2.5 rounded-lg font-semibold hover:from-[#E53935] hover:to-[#FF6B6B] transition-all shadow-lg shadow-[#C62828]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-[#FF6B6B] font-semibold hover:text-[#C62828] transition">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#C62828]/30"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[#0F0F0F]/90 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            text="signup_with"
            width="100%"
            logo_alignment="left"
          />
        </div>
      </form>
    </div>
  );
};

export default Register;