import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { authAPI } from "@/services/api";

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage("Verification token is missing from the URL.");
        return;
      }

      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage("Your email has been successfully verified! You can now login to your account.");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || "Failed to verify email. The link may be invalid or expired.");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d1810] to-[#1a0a0a] p-4">
      <div className="bg-[#1a1a1a] border border-[#3d2418] rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mb-4 flex justify-center">
          {status === 'loading' && <Loader2 className="animate-spin text-[#E53935]" size={64} />}
          {status === 'success' && <CheckCircle2 className="text-green-500" size={64} />}
          {status === 'error' && <XCircle className="text-red-500" size={64} />}
        </div>

        <h2 className="text-2xl font-bold mb-2 text-white">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        <p className="text-gray-300 mb-6">
          {status === 'loading' && 'Please wait while we verify your email address.'}
          {status === 'success' && message}
          {status === 'error' && message}
        </p>

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#C62828] hover:bg-[#E53935] text-white py-3 rounded-lg font-semibold transition"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="w-full bg-transparent border border-[#3d2418] text-gray-300 py-3 rounded-lg font-semibold hover:bg-[#2d1810] transition"
            >
              Create New Account
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Redirecting to login page...
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#C62828] hover:bg-[#E53935] text-white py-3 rounded-lg font-semibold transition"
            >
              Continue to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;