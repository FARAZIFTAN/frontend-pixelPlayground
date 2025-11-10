import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff, CheckCircle2, Camera, User, Mail, Lock } from "lucide-react";

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

  const handleGoogleRegister = () => {
    // TODO: Implement Google OAuth
    alert("Google OAuth will be implemented soon!");
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
            Your account has been created successfully. Redirecting to login...
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
        className="bg-[#1a1a1a] border border-[#3d2418] rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Camera className="text-[#E53935]" size={32} />
          <h2 className="text-3xl font-bold text-white">KaryaKlik</h2>
        </div>
        <p className="text-gray-400 text-center mb-6">Create your account to get started</p>

        {error && (
          <div className="mb-4 p-3 bg-[#2d1810] border border-[#C62828] text-[#E53935] rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f0f] border border-[#3d2418] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder:text-gray-500"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="email"
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f0f] border border-[#3d2418] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder:text-gray-500"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full pl-10 pr-12 py-2.5 bg-[#0f0f0f] border border-[#3d2418] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder:text-gray-500"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full pl-10 pr-12 py-2.5 bg-[#0f0f0f] border border-[#3d2418] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder:text-gray-500"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-[#E53935] font-semibold hover:underline hover:text-[#C62828] transition">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3d2418]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#1a1a1a] text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isLoading}
          className="w-full bg-[#0f0f0f] border border-[#3d2418] text-gray-300 py-2.5 rounded-lg font-semibold hover:bg-[#2d1810] hover:border-[#C62828]/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.9-6.9C35.44 2.34 29.97 0 24 0 14.64 0 6.4 5.48 2.44 13.44l8.06 6.27C12.7 13.02 17.91 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.09 24.55c0-1.64-.15-3.22-.42-4.76H24v9.04h12.44c-.54 2.92-2.17 5.4-4.62 7.08l7.19 5.59C43.94 37.02 46.09 31.23 46.09 24.55z"/>
              <path fill="#FBBC05" d="M10.5 28.71c-1.13-3.32-1.13-6.87 0-10.19l-8.06-6.27C.82 16.62 0 20.22 0 24c0 3.78.82 7.38 2.44 10.75l8.06-6.27z"/>
              <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.14 15.91-5.84l-7.19-5.59c-2.01 1.35-4.59 2.16-8.72 2.16-6.09 0-11.3-3.52-13.5-8.71l-8.06 6.27C6.4 42.52 14.64 48 24 48z"/>
            </g>
          </svg>
          Register with Google
        </button>
      </form>
    </div>
  );
};

export default Register;