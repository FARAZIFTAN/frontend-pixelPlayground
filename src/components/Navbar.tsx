import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Menu, X, User, LogOut, Image as ImageIcon, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const [profilePicVersion, setProfilePicVersion] = useState(Date.now());
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Update profile pic version when user changes
  useEffect(() => {
    if (user?.profilePicture) {
      setProfilePicVersion(Date.now());
    }
  }, [user?.profilePicture]);

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

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowExploreMenu(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowExploreMenu(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#0F0F0F]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b border-[#C62828]/20" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group" aria-label="KaryaKlik homepage">
            <Camera className="w-6 h-6 lg:w-8 lg:h-8 text-[#C62828] transition-transform group-hover:scale-110" aria-hidden="true" />
            <span className="text-xl lg:text-2xl font-heading font-bold text-white">
              KaryaKlik
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Home Link */}
            <Link
              to="/"
              className={`px-4 lg:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] ${
                isActive("/")
                  ? "bg-[#C62828] text-white shadow-lg"
                  : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
              }`}
            >
              Home
            </Link>

            {/* Separator */}
            <div className="text-white/30 text-lg">•</div>

            {/* Explore with Dropdown - Only for Authenticated Users */}
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setShowExploreMenu(!showExploreMenu)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowExploreMenu(!showExploreMenu);
                    } else if (e.key === 'Escape') {
                      setShowExploreMenu(false);
                    }
                  }}
                  className={`flex items-center space-x-1 px-4 lg:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/gallery") || isActive("/my-gallery") || isActive("/ai-template-creator")
                      ? "bg-[#C62828] text-white shadow-lg"
                      : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
                  }`}
                  aria-expanded={showExploreMenu}
                  aria-haspopup="true"
                  aria-label="Explore menu"
                >
                  <span>Explore</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showExploreMenu ? 'rotate-180' : ''}`} />
                </button>

                {showExploreMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 mt-2 w-64 bg-[#0F0F0F] border border-[#C62828]/30 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    <div className="py-2">
                      <Link
                        to="/gallery"
                        onClick={() => setShowExploreMenu(false)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition-colors flex items-center space-x-3 group"
                      >
                        <ImageIcon className="w-5 h-5 text-[#C62828] group-hover:text-[#FF6B6B]" />
                        <div>
                          <div className="font-medium">Public Gallery</div>
                          <div className="text-xs text-gray-400">Explore community creations</div>
                        </div>
                      </Link>
                      <Link
                        to="/my-gallery"
                        onClick={() => setShowExploreMenu(false)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition-colors flex items-center space-x-3 group"
                      >
                        <ImageIcon className="w-5 h-5 text-[#C62828] group-hover:text-[#FF6B6B]" />
                        <div>
                          <div className="font-medium">My Gallery</div>
                          <div className="text-xs text-gray-400">Your saved creations</div>
                        </div>
                      </Link>
                      <Link
                        to="/ai-template-creator"
                        onClick={() => setShowExploreMenu(false)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition-colors flex items-center space-x-3 group"
                      >
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="font-medium">AI Template Creator</div>
                          <div className="text-xs text-gray-400">Create with AI assistance</div>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Separator */}
            <div className="text-white/30 text-lg">•</div>

            {/* Explore Link for Guest Users */}
            {!isAuthenticated && (
              <Link
                to="/gallery"
                className={`px-4 lg:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/gallery")
                    ? "bg-[#C62828] text-white shadow-lg"
                    : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
                }`}
              >
                Explore
              </Link>
            )}

            {/* Separator */}
            {!isAuthenticated && <div className="text-white/30 text-lg">•</div>}

            {/* Contact Link */}
            <Link
              to="/contact"
              className={`px-4 lg:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive("/contact")
                  ? "bg-[#C62828] text-white shadow-lg"
                  : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowUserMenu(!showUserMenu);
                      } else if (e.key === 'Escape') {
                        setShowUserMenu(false);
                      }
                    }}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    {user.profilePicture ? (
                      <div className="relative">
                        <img
                          src={user.profilePicture.startsWith('http')
                            ? `${user.profilePicture}?t=${profilePicVersion}`
                            : `http://localhost:3001${user.profilePicture}?t=${profilePicVersion}`
                          }
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border-2 border-white/20"
                          loading="lazy"
                          onLoad={() => setIsProfileLoading(false)}
                          onError={(e) => {
                            console.error('Navbar profile pic load error');
                            setIsProfileLoading(false);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {isProfileLoading && (
                          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse flex items-center justify-center">
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-white font-medium text-sm leading-tight">
                        {user.name.length > 15 ? `${user.name.substring(0, 15)}...` : user.name}
                      </span>
                      {user.isPremium && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full mt-0.5">
                          PRO
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
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
                        {user.isPremium && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold rounded-full">
                            👑 Premium Member
                          </span>
                        )}
                      </div>
                      <div className="py-2">
                        <Link
                          to="/ai-template-creator"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/5 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                          <span>Create New</span>
                        </Link>
                        <Link
                          to="/my-gallery"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/5 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span>My Gallery</span>
                        </Link>
                      </div>
                      <div className="border-t border-white/10">
                        <Link
                          to="/my-account"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                        >
                          <User className="w-4 h-4" />
                          <span>My Account</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left text-white hover:bg-[#C62828] transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
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
            className="md:hidden p-3 text-white hover:text-[#FF6B6B] transition-colors rounded-lg hover:bg-white/5"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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
                  <div className="pt-3 pb-3 px-4 border-t border-white/10">
                    <div className="flex items-center space-x-3 mb-2">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture.startsWith('http') 
                            ? `${user.profilePicture}?t=${profilePicVersion}` 
                            : `http://localhost:3001${user.profilePicture}?t=${profilePicVersion}`
                          } 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                          loading="lazy"
                          onError={(e) => {
                            console.error('Mobile menu profile pic load error');
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <User className="w-10 h-10 text-white/70" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {user.name.length > 20 ? `${user.name.substring(0, 20)}...` : user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        {user.isPremium && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                            PRO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="px-4 space-y-2">
                    <Link to="/ai-template-creator" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full min-h-[48px] bg-gradient-to-r from-[#C62828] to-[#E53935] hover:from-[#E53935] hover:to-[#FF6B6B] text-white font-semibold rounded-lg flex items-center justify-center space-x-3 shadow-lg">
                        <Sparkles className="w-5 h-5" />
                        <span>Create New</span>
                      </Button>
                    </Link>
                    <Link to="/my-gallery" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full min-h-[48px] bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg flex items-center justify-center space-x-3">
                        <ImageIcon className="w-5 h-5" />
                        <span>My Gallery</span>
                      </Button>
                    </Link>
                    <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full min-h-[48px] bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg flex items-center justify-center space-x-3">
                        <ImageIcon className="w-5 h-5 text-[#C62828]" />
                        <span>Explore</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Account Section */}
                  <div className="px-4 pt-3 border-t border-white/10">
                    <Link to="/my-account" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full min-h-[48px] bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg flex items-center justify-center space-x-3 mb-2">
                        <User className="w-5 h-5" />
                        <span>My Account</span>
                      </Button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full min-h-[48px] px-4 py-3 rounded-lg text-white hover:bg-[#C62828] transition-all flex items-center justify-center space-x-3"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
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
