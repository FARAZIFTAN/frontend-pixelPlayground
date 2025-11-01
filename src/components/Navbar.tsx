import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Gallery", path: "/gallery" },
    { name: "Booth", path: "/booth" },
    // { name: "Creator", path: "/creator" }, // Removed - Admin only
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#0F0F0F]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(198,40,40,0.3)] border-b border-[#C62828]/30" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Camera className="w-6 h-6 lg:w-8 lg:h-8 text-[#C62828] transition-transform group-hover:scale-110" />
            <span className="text-xl lg:text-2xl font-heading font-bold text-white">
              KaryaKlik
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(link.path)
                    ? "bg-[#C62828] text-white"
                    : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button - Desktop */}
          <Link to="/booth" className="hidden md:block">
            <Button className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-full px-6 shadow-soft hover:shadow-glow transition-all">
              Start Booth
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-[#FF6B6B] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 bg-[#0F0F0F]/95 backdrop-blur-md rounded-2xl mt-2 mb-4 border border-[#C62828]/20"
          >
            <div className="flex flex-col space-y-2 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-[#C62828] text-white"
                      : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/booth" onClick={() => setIsMobileMenuOpen(false)} className="pt-2">
                <Button className="w-full bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-full shadow-soft">
                  Start Booth
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
