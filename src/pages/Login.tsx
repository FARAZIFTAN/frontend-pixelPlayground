import React, { useState } from "react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://your-backend-url/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Simpan token, redirect, dll
        alert("Login berhasil!");
      } else {
        alert(data.message || "Login gagal");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://your-backend-url/api/auth/google"; // Ganti dengan endpoint Google OAuth Anda
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-primary text-center">Login</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="text" // ubah dari "password" ke "text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition"
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.9-6.9C35.44 2.34 29.97 0 24 0 14.64 0 6.4 5.48 2.44 13.44l8.06 6.27C12.7 13.02 17.91 9.5 24 9.5z"/><path fill="#34A853" d="M46.09 24.55c0-1.64-.15-3.22-.42-4.76H24v9.04h12.44c-.54 2.92-2.17 5.4-4.62 7.08l7.19 5.59C43.94 37.02 46.09 31.23 46.09 24.55z"/><path fill="#FBBC05" d="M10.5 28.71c-1.13-3.32-1.13-6.87 0-10.19l-8.06-6.27C.82 16.62 0 20.22 0 24c0 3.78.82 7.38 2.44 10.75l8.06-6.27z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.14 15.91-5.84l-7.19-5.59c-2.01 1.35-4.59 2.16-8.72 2.16-6.09 0-11.3-3.52-13.5-8.71l-8.06 6.27C6.4 42.52 14.64 48 24 48z"/></g></svg>
          Login dengan Google
        </button>
      </form>
    </div>
  );
};

export default Login;