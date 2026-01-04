import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Menu, X, User, LogOut, Image as ImageIcon, Sparkles, ChevronDown, Upload, Crown, Wand2 } from "lucide-react";
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

  // Refs for dropdowns and buttons
  const exploreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const exploreButtonRef = useRef<HTMLButtonElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management states
  const [exploreFocusIndex, setExploreFocusIndex] = useState(-1);
  const [userFocusIndex, setUserFocusIndex] = useState(-1);

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

  // Scroll detection for navbar styling
  // Memory leak prevention: Event listener is properly cleaned up in useEffect return function
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation support for accessibility
  // Memory leak prevention: Event listener is properly cleaned up in useEffect return function
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
  // Memory leak prevention: Event listener is properly cleaned up in useEffect return function
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

  // Click outside handler for dropdowns
  // Memory leak prevention: Event listener is properly cleaned up in useEffect return function
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreMenuRef.current && !exploreMenuRef.current.contains(event.target as Node)) {
        setShowExploreMenu(false);
        setExploreFocusIndex(-1);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
        setUserFocusIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus management: return focus to trigger after dropdown closes
  useEffect(() => {
    if (!showExploreMenu && exploreButtonRef.current) {
      exploreButtonRef.current.focus();
    }
  }, [showExploreMenu]);

  useEffect(() => {
    if (!showUserMenu && userButtonRef.current) {
      userButtonRef.current.focus();
    }
  }, [showUserMenu]);

  // Keyboard navigation inside dropdowns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showExploreMenu) {
        const exploreItems = user?.isPremium 
          ? ['gallery', 'my-gallery', 'ai-template-creator', 'my-submissions']
          : ['gallery', 'my-gallery', 'ai-template-creator'];
        
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setExploreFocusIndex(prev => (prev + 1) % exploreItems.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setExploreFocusIndex(prev => prev <= 0 ? exploreItems.length - 1 : prev - 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          // Trigger navigation based on focus index
          const item = exploreItems[exploreFocusIndex];
          if (item) {
            setShowExploreMenu(false);
            setExploreFocusIndex(-1);
            // Navigate to the selected item
            if (item === 'gallery') navigate('/gallery');
            else if (item === 'my-gallery') navigate('/my-gallery');
            else if (item === 'ai-template-creator') navigate('/ai-template-creator');
            else if (item === 'my-submissions') navigate('/user/my-submissions');
          }
        }
      } else if (showUserMenu) {
        const userItems = user?.isPremium 
          ? ['my-gallery', 'my-ai-frames', 'my-account', 'my-submissions', 'logout']
          : ['my-gallery', 'my-ai-frames', 'my-account', 'logout'];
        
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setUserFocusIndex(prev => (prev + 1) % userItems.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setUserFocusIndex(prev => prev <= 0 ? userItems.length - 1 : prev - 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const item = userItems[userFocusIndex];
          if (item === 'my-gallery') {
            setShowUserMenu(false);
            setUserFocusIndex(-1);
            navigate('/my-gallery');
          } else if (item === 'my-ai-frames') {
            setShowUserMenu(false);
            setUserFocusIndex(-1);
            navigate('/my-ai-frames');
          } else if (item === 'my-account') {
            setShowUserMenu(false);
            setUserFocusIndex(-1);
            navigate('/my-account');
          } else if (item === 'my-submissions') {
            setShowUserMenu(false);
            setUserFocusIndex(-1);
            navigate('/user/my-submissions');
          } else if (item === 'logout') {
            setShowUserMenu(false);
            setUserFocusIndex(-1);
            handleLogout();
          }
        }
      }
    };

    if (showExploreMenu || showUserMenu) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Memory leak prevention: Event listener is properly cleaned up in useEffect return function
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showExploreMenu, showUserMenu, exploreFocusIndex, userFocusIndex, user?.isPremium, navigate]);

  // Set initial focus when dropdown opens
  useEffect(() => {
    if (showExploreMenu) {
      setExploreFocusIndex(0);
    }
  }, [showExploreMenu]);

  useEffect(() => {
    if (showUserMenu) {
      setUserFocusIndex(0);
    }
  }, [showUserMenu]);

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
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group" aria-label="KaryaKlik homepage">
            <Camera className="w-5 h-5 lg:w-7 lg:h-7 text-[#C62828] transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(198,40,40,0.6)]" aria-hidden="true" />
            <span className="text-lg lg:text-xl font-heading font-bold text-white transition-all duration-300 group-hover:text-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              KaryaKlik
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Home Link */}
            <Link
              to="/"
              className={`text-sm px-4 lg:px-5 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C62828]/60 focus:ring-offset-2 focus:ring-offset-[#0F0F0F] ${
                isActive("/")
                  ? "bg-[#C62828] text-white shadow-lg"
                  : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
              }`}
              title="Back to homepage"
            >
              Home
            </Link>

            {/* Separator */}
            <div className="text-white/20 text-lg mx-0.5" aria-hidden="true">•</div>

            {/* Discover Frames - Direct link to Gallery */}
            <Link
              to="/gallery"
              className={`text-sm group flex items-center gap-1.5 px-4 lg:px-5 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C62828]/60 focus:ring-offset-2 focus:ring-offset-[#0F0F0F] ${
                isActive("/gallery")
                  ? "bg-[#C62828] text-white shadow-lg"
                  : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
              }`}
              title="Browse ready-to-use AI photo frames from our creative community"
            >
              <ImageIcon className="w-3.5 h-3.5 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(198,40,40,0.6)]" aria-hidden="true" />
              <span className="transition-all duration-200 group-hover:drop-shadow-[0_0_10px_rgba(198,40,40,0.4)]">Discover Frames</span>
            </Link>

            {/* Old Explore Dropdown - REMOVED */}
            {false && isAuthenticated && user && (
              <div className="relative" ref={exploreMenuRef}>
                <button
                  ref={exploreButtonRef}
                  id="explore-button"
                  onClick={() => setShowExploreMenu(!showExploreMenu)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowExploreMenu(!showExploreMenu);
                    } else if (e.key === 'Escape') {
                      setShowExploreMenu(false);
                      setExploreFocusIndex(-1);
                    }
                  }}
                  className={`flex items-center space-x-1 px-4 lg:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    isActive("/gallery") || isActive("/my-gallery") || isActive("/ai-template-creator")
                      ? "bg-[#C62828] text-white shadow-lg"
                      : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
                  }`}
                  aria-expanded={showExploreMenu}
                  aria-haspopup="menu"
                  aria-label="Explore menu"
                  aria-activedescendant={showExploreMenu && exploreFocusIndex >= 0 ? `explore-item-${exploreFocusIndex}` : undefined}
                >
                  <span>Explore</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showExploreMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showExploreMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 w-80 md:w-64 bg-[#0F0F0F] border border-[#C62828]/30 rounded-lg shadow-xl overflow-hidden z-[9999]"
                      role="menu"
                      aria-labelledby="explore-button"
                    >
                    <div className="py-2">
                      <Link
                        to="/gallery"
                        onClick={() => setShowExploreMenu(false)}
                        className={`w-full px-4 py-4 md:py-3 text-left text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center space-x-3 group min-h-[48px] ${
                          exploreFocusIndex === 0 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                        }`}
                        role="menuitem"
                        id="explore-item-0"
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
                        className={`w-full px-4 py-4 md:py-3 text-left text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center space-x-3 group min-h-[48px] ${
                          exploreFocusIndex === 1 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                        }`}
                        role="menuitem"
                        id="explore-item-1"
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
                        className={`w-full px-4 py-4 md:py-3 text-left text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center space-x-3 group min-h-[48px] ${
                          exploreFocusIndex === 2 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                        }`}
                        role="menuitem"
                        id="explore-item-2"
                      >
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <div>
                          <div className="font-medium">AI Template Creator</div>
                          <div className="text-xs text-gray-400">Create with AI assistance</div>
                        </div>
                      </Link>
                      {user && user.isPremium && (
                        <Link
                          to="/user/my-submissions"
                          onClick={() => setShowExploreMenu(false)}
                        className={`w-full px-4 py-4 md:py-3 text-left text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center space-x-3 group min-h-[48px] ${
                          exploreFocusIndex === 3 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                        }`}
                        role="menuitem"
                        id="explore-item-3"
                        >
                          <Upload className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                          <div>
                            <div className="font-medium">My Frame Submissions</div>
                            <div className="text-xs text-gray-400">View your submissions</div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Separator */}
            <div className="text-white/20 text-lg mx-0.5" aria-hidden="true">•</div>

            {/* Contact / Support Link */}
            <Link
              to="/contact"
              className={`text-sm px-4 lg:px-5 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C62828]/60 focus:ring-offset-2 focus:ring-offset-[#0F0F0F] ${
                isActive("/contact")
                  ? "bg-[#C62828] text-white shadow-lg"
                  : "text-white hover:text-[#FF6B6B] hover:bg-white/5"
              }`}
              title="Need help? Contact our support team"
            >
              Contact / Support
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                {/* PRIMARY CTA - Create AI Photo Frame */}
                <Link to="/ai-template-creator" className="mr-2.5">
                  <Button 
                    className="text-sm lg:text-[15px] bg-gradient-to-r from-[#C62828] to-[#E91E63] hover:from-[#E53935] hover:to-[#F06292] text-white font-bold px-5 py-2 rounded-full shadow-lg hover:shadow-[0_0_24px_rgba(198,40,40,0.6)] hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/60 focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                    title="Generate beautiful frames in seconds with AI"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Create AI Photo Frame
                  </Button>
                </Link>

                <div className="relative" ref={userMenuRef}>
                  <button
                    ref={userButtonRef}
                    id="user-button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowUserMenu(!showUserMenu);
                      } else if (e.key === 'Escape') {
                        setShowUserMenu(false);
                        setUserFocusIndex(-1);
                      }
                    }}
                    className="flex items-center space-x-3 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C62828]/60 focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                    aria-expanded={showUserMenu}
                    aria-haspopup="menu"
                    aria-label="User menu"
                    aria-activedescendant={showUserMenu && userFocusIndex >= 0 ? `user-item-${userFocusIndex}` : undefined}
                    title={user.isPremium ? "Pro Creator Account · Unlimited creation · Premium access" : "My Account"}
                  >
                    {user.profilePicture ? (
                      <div className="relative">
                        <img
                          src={user.profilePicture.startsWith('http')
                            ? `${user.profilePicture}?t=${profilePicVersion}`
                            : `http://localhost:3001${user.profilePicture}?t=${profilePicVersion}`
                          }
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                          loading="lazy"
                          onLoad={() => setIsProfileLoading(false)}
                          onError={(e) => {
                            console.error('Navbar profile pic load error');
                            setIsProfileLoading(false);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {isProfileLoading && (
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-white font-medium text-sm leading-tight">
                        {user.name.length > 15 ? `${user.name.substring(0, 15)}...` : user.name}
                      </span>
                      {user.isPremium && (
                        <span 
                          className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[11px] font-bold rounded-full mt-0.5"
                          title="Unlimited creation · Premium access"
                        >
                          PRO CREATOR
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-4 md:right-0 mt-2 w-72 md:w-48 bg-[#0F0F0F]/98 backdrop-blur-md border border-[#C62828]/30 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden z-[9999]"
                        role="menu"
                        aria-labelledby="user-button"
                      >
                      <div className="px-3.5 py-2.5 border-b border-white/10">
                        <p className="text-[11px] text-gray-400 mb-1">Signed in as</p>
                        <p className="text-white font-medium truncate text-[13px]">{user.email}</p>
                        {user.isPremium && (
                          <span 
                            className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold rounded-full"
                            title="Unlimited creation · Premium access"
                          >
                            <Crown className="w-2.5 h-2.5" />
                            PRO CREATOR
                          </span>
                        )}
                      </div>
                      <div className="py-1.5">
                        <Link
                          to="/my-gallery"
                          onClick={() => setShowUserMenu(false)}
                          className={`w-full px-3.5 py-2.5 text-sm leading-relaxed text-left text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 flex items-center space-x-2.5 ${
                            userFocusIndex === 0 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                          }`}
                          role="menuitem"
                          id="user-item-0"
                          title="View and manage your created frames"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>My Creations</span>
                        </Link>
                        <Link
                          to="/my-ai-frames"
                          onClick={() => setShowUserMenu(false)}
                          className={`w-full px-3.5 py-2.5 text-sm leading-relaxed text-left text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 flex items-center space-x-2.5 ${
                            userFocusIndex === 1 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                          }`}
                          role="menuitem"
                          id="user-item-1"
                          title="View your AI-generated frames workspace"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>My AI Frames</span>
                        </Link>
                        <Link
                          to="/my-account"
                          onClick={() => setShowUserMenu(false)}
                          className={`w-full px-3.5 py-2.5 text-sm leading-relaxed text-left text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 flex items-center space-x-2.5 ${
                            userFocusIndex === 2 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                          }`}
                          role="menuitem"
                          id="user-item-2"
                          title="Manage your profile and preferences"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Account Settings</span>
                        </Link>
                        {user.isPremium && (
                          <Link
                            to="/user/my-submissions"
                            onClick={() => setShowUserMenu(false)}
                            className={`w-full px-3.5 py-2.5 text-sm leading-relaxed text-left text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 flex items-center justify-between ${
                              userFocusIndex === 3 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                            }`}
                            role="menuitem"
                            id="user-item-3"
                            title="Submit your frames to the community gallery (Pro only)"
                          >
                            <div className="flex items-center space-x-2.5">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Submit Frames</span>
                            </div>
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                          </Link>
                        )}
                      </div>
                      {!user.isPremium && (
                        <div className="px-1.5 py-1.5 border-t border-white/10">
                          <Link
                            to="/upgrade-pro"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full px-3.5 py-2.5 text-left bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:shadow-lg hover:border-amber-500/50 rounded-lg transition-all duration-200 flex items-center gap-2"
                            title="Upgrade to Pro Creator for unlimited features"
                          >
                            <Crown className="w-4 h-4 text-amber-400" />
                            <div className="flex-1">
                              <div className="font-semibold text-amber-400 text-sm leading-relaxed">Unlock Pro Features</div>
                              <div className="text-[11px] text-gray-400 leading-relaxed">Unlimited frames · Premium access</div>
                            </div>
                          </Link>
                        </div>
                      )}
                      <div className="border-t border-white/10">
                        <button
                          onClick={handleLogout}
                          className={`w-full px-3.5 py-2.5 text-sm leading-relaxed text-left text-white hover:bg-[#C62828] active:bg-[#B71C1C] transition-all duration-200 flex items-center space-x-2.5 ${
                            userFocusIndex === 4 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                          }`}
                          role="menuitem"
                          id="user-item-4"
                          title="Sign out from your account"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" state={{ returnUrl: '/ai-template-creator' }} className="mr-2.5">
                  <Button 
                    className="text-sm lg:text-[15px] bg-gradient-to-r from-[#C62828] to-[#E91E63] hover:from-[#E53935] hover:to-[#F06292] text-white font-bold px-5 py-2 rounded-full shadow-lg hover:shadow-[0_0_24px_rgba(198,40,40,0.6)] hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#C62828]/60 focus:ring-offset-2 focus:ring-offset-[#0F0F0F]" 
                    title="Sign in to create beautiful photo frames in seconds"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Create AI Photo Frame
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="text-sm text-white hover:text-[#FF6B6B] hover:bg-white/5 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C62828]/60 focus:ring-offset-2 focus:ring-offset-[#0F0F0F]">
                    Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 text-white hover:text-[#FF6B6B] transition-all duration-200 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#C62828]/60 focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
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
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden py-3 bg-[#0F0F0F]/98 backdrop-blur-md rounded-2xl mt-2 mb-4 border border-[#C62828]/20 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="flex flex-col space-y-1.5 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
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
                  <div className="pt-2 pb-2 px-3 border-t border-white/10">
                    <div className="flex items-center space-x-2.5 mb-1.5">
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
                              console.error('Mobile menu profile pic load error');
                              setIsProfileLoading(false);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {isProfileLoading && (
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      ) : (
                        <User className="w-9 h-9 text-white/70" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-[13px] truncate">
                          {user.name.length > 20 ? `${user.name.substring(0, 20)}...` : user.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                        {user.isPremium && (
                          <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold rounded-full">
                            PRO CREATOR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions - Prioritized dengan wording baru */}
                  <div className="px-3 space-y-2">
                    <Link to="/ai-template-creator" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="relative">
                        <Button className="w-full min-h-[48px] text-[15px] bg-gradient-to-r from-[#C62828] to-[#E91E63] hover:from-[#E53935] hover:to-[#F06292] text-white font-bold rounded-xl flex flex-col items-center justify-center py-2 shadow-lg hover:shadow-[0_0_24px_rgba(198,40,40,0.5)] active:scale-[0.98] transition-all duration-200">
                          <div className="flex items-center space-x-1.5">
                            <Sparkles className="w-4 h-4" />
                            <span>CREATE AI PHOTO FRAME</span>
                          </div>
                          <span className="text-[9px] text-white/70 mt-0.5 font-normal">Generate in seconds</span>
                        </Button>
                      </div>
                    </Link>
                    <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full min-h-[44px] text-sm bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all duration-200">
                        <ImageIcon className="w-3.5 h-3.5 text-[#C62828]" />
                        <span>Discover Frames</span>
                      </Button>
                    </Link>
                    <Link to="/my-ai-frames" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full min-h-[44px] text-sm bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all duration-200">
                        <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>My AI Frames</span>
                      </Button>
                    </Link>
                    <Link to="/my-gallery" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full min-h-[44px] text-sm bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all duration-200">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>My Creations</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Account Section dengan wording baru */}
                  <div className="px-3 pt-2 border-t border-white/10 space-y-2">
                    <Link to="/my-account" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full min-h-[44px] text-sm bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all duration-200">
                        <User className="w-3.5 h-3.5" />
                        <span>Account Settings</span>
                      </Button>
                    </Link>
                    {user.isPremium && (
                      <Link to="/user/my-submissions" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full min-h-[44px] text-sm bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-medium rounded-xl flex items-center justify-between px-3.5 transition-all duration-200">
                          <div className="flex items-center space-x-2">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Submit Frames</span>
                          </div>
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                        </Button>
                      </Link>
                    )}
                    {!user.isPremium && (
                      <Link to="/upgrade-pro" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full min-h-[48px] bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:shadow-lg hover:border-amber-500/50 active:scale-[0.98] text-white font-medium rounded-xl flex items-center gap-2 px-3.5 transition-all duration-200">
                          <Crown className="w-4 h-4 text-amber-400" />
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-amber-400 text-[13px] leading-tight">Unlock Pro Features</div>
                            <div className="text-[10px] text-gray-400 leading-tight mt-0.5">Unlimited frames · Premium access</div>
                          </div>
                        </Button>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full min-h-[44px] text-sm px-3.5 py-2.5 rounded-xl text-white hover:bg-[#C62828] active:bg-[#B71C1C] transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-1.5 px-3 space-y-2">
                  <Link to="/login" state={{ returnUrl: '/ai-template-creator' }} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="relative">
                      <Button className="w-full min-h-[48px] text-[15px] bg-gradient-to-r from-[#C62828] to-[#E91E63] hover:from-[#E53935] hover:to-[#F06292] text-white font-bold rounded-xl flex flex-col items-center justify-center py-2 shadow-lg hover:shadow-[0_0_24px_rgba(198,40,40,0.5)] active:scale-[0.98] transition-all duration-200">
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>CREATE AI PHOTO FRAME</span>
                        </div>
                        <span className="text-[9px] text-white/70 mt-0.5 font-normal">Generate in seconds</span>
                      </Button>
                    </div>
                  </Link>
                  <p className="text-[10px] text-center text-gray-400 py-0.5">Sign in to create beautiful frames instantly</p>
                  <Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full min-h-[44px] text-sm bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all duration-200">
                      <ImageIcon className="w-3.5 h-3.5 text-[#C62828]" />
                      <span>Discover Frames</span>
                    </Button>
                  </Link>
                  <div className="pt-2 border-t border-white/10">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full min-h-[44px] text-sm border-white/20 text-white hover:bg-white/10 active:bg-white/15 rounded-xl transition-all duration-200">
                        Sign in
                      </Button>
                    </Link>
                  </div>
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
