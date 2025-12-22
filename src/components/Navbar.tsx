import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Menu, X, User, LogOut, Image as ImageIcon, Sparkles, ChevronDown, Upload } from "lucide-react";
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
        const userItems = ['my-account', 'logout'];
        
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setUserFocusIndex(prev => (prev + 1) % userItems.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setUserFocusIndex(prev => prev <= 0 ? userItems.length - 1 : prev - 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const item = userItems[userFocusIndex];
          if (item === 'my-account') {
            setShowUserMenu(false);
            setUserFocusIndex(-1);
            navigate('/my-account');
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
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                    aria-expanded={showUserMenu}
                    aria-haspopup="menu"
                    aria-label="User menu"
                    aria-activedescendant={showUserMenu && userFocusIndex >= 0 ? `user-item-${userFocusIndex}` : undefined}
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
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full animate-pulse"></div>
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
                  
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-4 md:right-0 mt-2 w-72 md:w-48 bg-[#0F0F0F] border border-[#C62828]/30 rounded-lg shadow-xl overflow-hidden z-[9999]"
                        role="menu"
                        aria-labelledby="user-button"
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
                      <div className="border-t border-white/10">
                        <Link
                          to="/my-account"
                          onClick={() => setShowUserMenu(false)}
                          className={`w-full px-4 py-4 md:py-3 text-left text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center space-x-2 min-h-[48px] ${
                            userFocusIndex === 0 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                          }`}
                          role="menuitem"
                          id="user-item-0"
                        >
                          <User className="w-4 h-4" />
                          <span>My Account</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className={`w-full px-4 py-4 md:py-3 text-left text-white hover:bg-[#C62828] active:bg-[#B71C1C] transition-colors flex items-center space-x-2 min-h-[48px] ${
                            userFocusIndex === 1 ? 'bg-white/10 ring-2 ring-[#C62828]' : ''
                          }`}
                          role="menuitem"
                          id="user-item-1"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-[#FF6B6B] hover:bg-white/5 font-medium">
                    Sign in
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
                        <div className="relative">
                          <img 
                            src={user.profilePicture.startsWith('http') 
                              ? `${user.profilePicture}?t=${profilePicVersion}` 
                              : `http://localhost:3001${user.profilePicture}?t=${profilePicVersion}`
                            } 
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
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
                      Sign in
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
