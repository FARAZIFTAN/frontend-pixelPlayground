import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Menu, X, User, LogOut, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

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

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                <Link to="/booth">
                  <Button className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-full px-6 shadow-soft hover:shadow-glow transition-all">
                    Start Booth
                  </Button>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <User className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{user.name}</span>
                  </button>
                  
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-[#0F0F0F] border border-[#C62828]/30 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-white font-medium truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/my-account"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        to="/my-gallery"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>My Gallery</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-white hover:bg-[#C62828] transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-[#FF6B6B] hover:bg-white/5 font-medium">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-full px-6 shadow-soft hover:shadow-glow transition-all">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

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
              
              {isAuthenticated && user ? (
                <>
                  <div className="pt-2 pb-2 px-4 border-t border-white/10">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-white font-medium truncate">{user.email}</p>
                  </div>
                  <Link to="/booth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-full shadow-soft">
                      Start Booth
                    </Button>
                  </Link>
                  <Link to="/my-account" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full mt-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg flex items-center justify-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>My Account</span>
                    </Button>
                  </Link>
                  <Link to="/my-gallery" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full mt-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg flex items-center justify-center space-x-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>My Gallery</span>
                    </Button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg text-white hover:bg-[#C62828] transition-all flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="pt-2 space-y-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#C62828] hover:bg-[#E53935] text-white font-semibold rounded-full shadow-soft">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
