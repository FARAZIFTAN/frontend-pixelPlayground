import { Camera, Instagram, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] border-t border-[#333333] mt-20">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Camera className="w-6 h-6 text-[#C62828]" />
              <span className="text-xl font-heading font-bold text-white">
                KaryaKlik
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              A web-based digital photo booth platform built in Indonesia — helping everyone create beautiful memories easily.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#C62828] transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-400 hover:text-[#C62828] transition-colors text-sm">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/booth" className="text-gray-400 hover:text-[#C62828] transition-colors text-sm">
                  Booth
                </Link>
              </li>
              <li>
                <Link to="/creator" className="text-gray-400 hover:text-[#C62828] transition-colors text-sm">
                  Creator
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold mb-4 text-white">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://instagram.com/pixel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#C62828] flex items-center justify-center text-white hover:bg-[#E53935] transition-all shadow-soft"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#C62828] flex items-center justify-center text-white hover:bg-[#E53935] transition-all shadow-soft"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@pixel.com"
                className="w-10 h-10 rounded-full bg-[#C62828] flex items-center justify-center text-white hover:bg-[#E53935] transition-all shadow-soft"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              hello@pixel.com
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#333333] text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} pixel. Made with ❤️ in Indonesia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
