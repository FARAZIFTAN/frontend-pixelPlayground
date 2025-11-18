import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff, User, Camera } from "lucide-react";
import analytics from "@/lib/analytics";

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
      
      console.log('Login successful, user role:', userData.role);
      
      // Give a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on user role
      if (userData.role === 'admin') {
        console.log('✅ Admin login successful! Redirecting to admin panel...');
        // Admin user -> redirect to admin dashboard
        navigate("/admin/dashboard", { replace: true });
      } else {
        console.log('✅ User login successful! Redirecting to home...');
        // Regular user -> redirect to home
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    alert("Google OAuth will be implemented soon!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0e0e] via-[#2d1818] to-[#0F0F0F] p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0F0F0F]/80 backdrop-blur-xl border border-[#C62828]/30 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-[#C62828] p-3 rounded-full">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-white text-center">Welcome Back!</h2>
        <p className="text-gray-400 text-center mb-6">Login to your KaryaKlik account</p>

        {error && (
          <div className="mb-4 p-3 bg-[#C62828]/20 border border-[#C62828]/50 text-red-300 rounded-lg text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder-gray-500"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 pr-10 bg-[#1a1a1a] border border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition placeholder-gray-500"
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
          className="w-full bg-gradient-to-r from-[#C62828] to-[#E53935] text-white py-3 rounded-lg font-semibold hover:from-[#E53935] hover:to-[#FF6B6B] transition-all shadow-lg shadow-[#C62828]/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Logging in...
            </>
          ) : (
            "Login to KaryaKlik"
          )}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#FF6B6B] font-semibold hover:text-[#C62828] transition">
              Register here
            </Link>
          </p>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#C62828]/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0F0F0F]/80 text-gray-400">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-[#1a1a1a] border-2 border-[#C62828]/30 text-white py-3 rounded-lg font-semibold hover:bg-[#252525] hover:border-[#C62828]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.9-6.9C35.44 2.34 29.97 0 24 0 14.64 0 6.4 5.48 2.44 13.44l8.06 6.27C12.7 13.02 17.91 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.09 24.55c0-1.64-.15-3.22-.42-4.76H24v9.04h12.44c-.54 2.92-2.17 5.4-4.62 7.08l7.19 5.59C43.94 37.02 46.09 31.23 46.09 24.55z"/>
              <path fill="#FBBC05" d="M10.5 28.71c-1.13-3.32-1.13-6.87 0-10.19l-8.06-6.27C.82 16.62 0 20.22 0 24c0 3.78.82 7.38 2.44 10.75l8.06-6.27z"/>
              <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.14 15.91-5.84l-7.19-5.59c-2.01 1.35-4.59 2.16-8.72 2.16-6.09 0-11.3-3.52-13.5-8.71l-8.06 6.27C6.4 42.52 14.64 48 24 48z"/>
            </g>
          </svg>
          Login with Google
        </button>
      </form>
    </div>
  );
};

export default Login;