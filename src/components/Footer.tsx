import { Heart, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-pink-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <span>© 2025 SnapNow. Made with</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>for everyone.</span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-pink-500 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-pink-500 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-pink-500 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <a href="#" className="hover:text-pink-500 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-pink-500 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
