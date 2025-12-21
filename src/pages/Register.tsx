import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { authAPI } from "@/services/api";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleExpanded, setIsGoogleExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { register, checkAuth } = useAuth();
  const navigate = useNavigate();

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop;
        const scrollHeight = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
        const scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollY(scrollProgress);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Memory leak prevention: Event listener is properly cleaned up in useEffect return function
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (!agreeToTerms) {
      setError("You must agree to the Terms & Conditions");
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

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("Password must contain uppercase, lowercase, and numbers");
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
      // Add small delay to ensure token is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send Google token to backend
      const response = await authAPI.googleAuth(credentialResponse.credential!);

      // Store token and user data
      sessionStorage.setItem("token", (response as any).token);
      sessionStorage.setItem("user", JSON.stringify((response as any).user));

      // Update auth context
      await checkAuth();

      // Show success and redirect
      setSuccess(true);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error('Google auth error:', err);

      // Provide more specific error messages
      let errorMessage = "Google sign up failed. Please try again.";
      const errorMsg = err?.message || '';

      if (errorMsg.includes('Token used too early')) {
        errorMessage = "Authentication timing issue. Please wait a moment and try again.";
      } else if (errorMsg.includes('invalid_token')) {
        errorMessage = "Invalid authentication token. Please try again.";
      } else if (errorMsg) {
        errorMessage = errorMsg;
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth error');
    setError("Google authentication was cancelled or failed. Please try again.");
    setIsLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0e0e] via-[#2d1818] to-[#0F0F0F] px-4 py-4">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#1a1a1a]/50">
        <div
          className="h-full bg-gradient-to-r from-[#C62828] to-[#E53935] transition-all duration-300 ease-out"
          style={{ width: `${scrollY}%` }}
        ></div>
      </div>

      <div className="w-full max-w-5xl flex h-[90vh]">
        {/* Form - 50% width on desktop */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4">
          <div
            ref={scrollContainerRef}
            className="w-full max-w-sm h-full overflow-y-auto custom-scrollbar scroll-smooth"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#C62828 #1a1a1a',
            }}
          >
            <style dangerouslySetInnerHTML={{
              __html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #1a1a1a;
                  border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: linear-gradient(180deg, #C62828, #E53935);
                  border-radius: 10px;
                  border: 1px solid #1a1a1a;
                  transition: all 0.3s ease;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: linear-gradient(180deg, #E53935, #FF6B6B);
                  transform: scaleX(1.2);
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:active {
                  background: linear-gradient(180deg, #B71C1C, #C62828);
                }

                .custom-scrollbar::-webkit-scrollbar-corner {
                  background: #1a1a1a;
                }

                .scroll-smooth {
                  scroll-behavior: smooth;
                }
              `
            }} />
            <div className="bg-[#0F0F0F]/90 backdrop-blur-xl border border-[#C62828]/30 rounded-2xl shadow-2xl p-6">
              {/* Header Section */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">KaryaKlik</h1>
                <h2 className="text-xl font-semibold text-white">Create New Account</h2>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-[#C62828]/20 border border-[#C62828]/50 text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] transition placeholder-gray-500 text-base"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                    autoFocus
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] transition placeholder-gray-500 text-base"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    inputMode="email"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 bg-[#1a1a1a] border-2 border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] transition placeholder-gray-500 text-base"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      inputMode="text"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C62828] transition h-6 w-6 flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 bg-[#1a1a1a] border-2 border-[#C62828]/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828] transition placeholder-gray-500 text-base"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      inputMode="text"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C62828] transition h-6 w-6 flex items-center justify-center"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 mr-3 h-4 w-4 text-[#C62828] bg-[#1a1a1a] border-2 border-[#C62828]/30 rounded focus:ring-[#C62828] focus:ring-2"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-gray-400 leading-relaxed">
                      I agree to the <a href="#" className="text-[#FF6B6B] hover:text-[#C62828] underline">Terms & Conditions</a>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#C62828] to-[#E53935] text-white py-3 rounded-lg font-semibold hover:from-[#E53935] hover:to-[#FF6B6B] transition-all shadow-xl shadow-[#C62828]/70 hover:shadow-2xl hover:shadow-[#C62828]/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Creating account...
                    </>
                  ) : (
                    "CREATE ACCOUNT"
                  )}
                </button>

                {/* Sign In Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#FF6B6B] font-semibold hover:text-[#C62828] transition underline">
                      Sign in here
                    </Link>
                  </p>
                </div>

                {/* Google Login Accordion */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsGoogleExpanded(!isGoogleExpanded)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-[#C62828] transition py-2 border-t border-[#C62828]/20 pt-4"
                  >
                    Other signup options
                    {isGoogleExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                  {isGoogleExpanded && (
                    <>
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[#C62828]/30"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-[#0F0F0F]/90 text-gray-500">or</span>
                        </div>
                      </div>
                      <div className="w-full border border-gray-600 rounded-lg p-1">
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
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar - Decorative only - 50% width on desktop */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
          <div className="w-full h-full max-w-md max-h-md relative overflow-hidden rounded-2xl">
            {/* Geometric Pattern Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0e0e] via-[#2d1818] to-[#0F0F0F]">
              {/* Geometric Pattern Overlay */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="geometric-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <rect x="0" y="0" width="40" height="40" fill="none"/>
                      <circle cx="20" cy="20" r="2" fill="#C62828" opacity="0.6"/>
                      <rect x="10" y="10" width="20" height="20" fill="none" stroke="#C62828" strokeWidth="1" opacity="0.4"/>
                      <line x1="0" y1="20" x2="40" y2="20" stroke="#C62828" strokeWidth="1" opacity="0.3"/>
                      <line x1="20" y1="0" x2="20" y2="40" stroke="#C62828" strokeWidth="1" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#geometric-pattern)"/>
                </svg>
              </div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                  Join Creative Community
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-[#C62828] to-[#E53935] mx-auto rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;