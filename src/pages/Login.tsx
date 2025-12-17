import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff, User, Camera } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import analytics from "@/lib/analytics";
import { authAPI } from "@/services/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Track page view
  useEffect(() => {
    analytics.pageView('Login', user?.id);
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const userData = await login(email, password);
      
      if (!userData) {
        throw new Error("Login failed - no user data received");
      }

      // Track successful login
      analytics.userLogin(userData.id, 'email');
      
      // Give a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        // Admin user -> redirect to admin dashboard
        navigate("/admin/dashboard", { replace: true });
      } else {
        // Regular user -> redirect to home
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError("");

    try {
      // Send Google token to backend
      const response = await authAPI.googleAuth(credentialResponse.credential!);
      
      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Update auth context
      const userData = response.user;
      
      // Track successful login
      analytics.userLogin(userData.id, 'google');
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      
      // Reload to update auth context
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Google login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0e0e] via-[#2d1818] to-[#0F0F0F] p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0F0F0F]/90 backdrop-blur-xl border border-[#C62828]/30 rounded-2xl shadow-2xl p-6 w-full max-w-md"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-[#C62828] to-[#E53935] p-3 rounded-full shadow-lg">
            <User className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-1 text-white text-center">Welcome Back!</h2>
        <p className="text-gray-400 text-center mb-5 text-sm">Login to your KaryaKlik account</p>

        {error && (
          <div className="mb-3 p-2.5 bg-[#C62828]/20 border border-[#C62828]/50 text-red-300 rounded-lg text-xs backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder-gray-500 text-sm"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2.5 pr-10 bg-[#1a1a1a] border border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder-gray-500 text-sm"
              placeholder="Enter your password"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#C62828] to-[#E53935] text-white py-2.5 rounded-lg font-semibold hover:from-[#E53935] hover:to-[#FF6B6B] transition-all shadow-lg shadow-[#C62828]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Logging in...
            </>
          ) : (
            "Login to KaryaKlik"
          )}
        </button>

        <div className="mt-3 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#FF6B6B] font-semibold hover:text-[#C62828] transition">
              Register here
            </Link>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            <Link to="/forgot-password" className="text-[#FF6B6B] font-semibold hover:text-[#C62828] transition">
              Forgot your password?
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
            text="signin_with"
            width="100%"
            logo_alignment="left"
          />
        </div>
      </form>
    </div>
  );
};

export default Login;