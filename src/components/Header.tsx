import { Camera, LogOut, User } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType | null;
  onNavigate: (page: 'landing' | 'photobooth' | 'gallery') => void;
  onLogout: () => void;
}

export default function Header({ user, onNavigate, onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-pink-400 to-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-2 group"
          >
            <div className="bg-white p-2 rounded-full shadow-lg group-hover:shadow-xl transition-shadow">
              <Camera className="w-6 h-6 text-pink-500" />
            </div>
            <span className="text-2xl font-bold text-white drop-shadow-md">
              SnapNow
            </span>
          </button>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate('photobooth')}
                  className="px-4 py-2 bg-white text-pink-500 rounded-full font-medium hover:bg-pink-50 transition-all hover:shadow-lg"
                >
                  Photobooth
                </button>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="px-4 py-2 bg-white text-pink-500 rounded-full font-medium hover:bg-pink-50 transition-all hover:shadow-lg"
                >
                  Gallery
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-all hover:shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('photobooth')}
                className="px-6 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-all hover:shadow-lg"
              >
                Mulai Sekarang
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
