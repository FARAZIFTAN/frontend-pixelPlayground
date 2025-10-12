import { useState } from 'react';
import { LogIn, UserPlus, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onAuthSuccess: () => void;
  onNavigate: (page: 'landing') => void;
}

export default function Auth({ onAuthSuccess, onNavigate }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }

      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-pink-300 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center space-x-2 mb-6 group"
          >
            <div className="bg-white p-3 rounded-full shadow-lg group-hover:shadow-xl transition-shadow">
              <Camera className="w-8 h-8 text-pink-500" />
            </div>
            <span className="text-3xl font-bold text-white drop-shadow-md">
              SnapNow
            </span>
          </button>

          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Selamat Datang Kembali!' : 'Daftar Sekarang'}
          </h2>
          <p className="text-pink-100">
            {isLogin
              ? 'Masuk untuk mengakses galeri fotomu'
              : 'Buat akun untuk menyimpan fotomu'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{loading ? 'Memproses...' : 'Masuk'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>{loading ? 'Memproses...' : 'Daftar'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              {isLogin
                ? 'Belum punya akun? Daftar di sini'
                : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('landing')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Kembali ke beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
