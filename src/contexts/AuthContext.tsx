import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import analytics from '@/lib/analytics';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture?: string | null;
  createdAt: string;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: (silent?: boolean) => Promise<void>;
  upgradeToPremium: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token is valid and get user data
  const checkAuth = useCallback(async (silent = false) => {
    console.log('[AUTH] checkAuth called, silent:', silent);
    const savedToken = sessionStorage.getItem('token');
    console.log('[AUTH] Token found:', !!savedToken);
    if (!savedToken) {
      console.log('[AUTH] No token, setting loading to false');
      if (!silent) {
        setIsLoading(false);
      }
      return;
    }

    try {
      // Add cache-busting to ensure fresh data
      const timestamp = Date.now();
      const response = await fetch(`${API_BASE_URL}/auth/verify?t=${timestamp}`, {
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${savedToken}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Load premium status from sessionStorage and merge with user data
        const isPremiumFromStorage = sessionStorage.getItem('isPremium') === 'true';
        const userData = { ...data.data.user, isPremium: isPremiumFromStorage || data.data.user.isPremium };
        console.log('[AUTH] Verify successful, setting user:', userData.name, userData.role);
        setUser(userData);
        setToken(savedToken);
      } else {
        // Only logout if not silent mode (i.e., initial load or explicit check)
        if (!silent) {
          sessionStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } else {
          console.warn('Auth check failed but keeping user logged in (silent mode)');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // On silent mode, don't logout on network errors
      if (!silent) {
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } else {
        console.warn('Network error during silent auth check, keeping user logged in');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load token from sessionStorage on mount
  useEffect(() => {
    console.log('[AUTH] Initial mount effect');
    const savedToken = sessionStorage.getItem('token');
    if (savedToken) {
      console.log('[AUTH] Found saved token, checking auth');
      setToken(savedToken);
      checkAuth();
    } else {
      console.log('[AUTH] No saved token');
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data.token) {
        const { token: newToken, user: userData } = data.data;
        
        console.log('[AUTH] Login successful:', userData.name, userData.role);
        
        // Save token to sessionStorage
        sessionStorage.setItem('token', newToken);
        console.log('[AUTH] Token saved to sessionStorage');
        
        // Load premium status from sessionStorage and merge
        const isPremiumFromStorage = sessionStorage.getItem('isPremium') === 'true';
        const userWithPremium = { ...userData, isPremium: isPremiumFromStorage || userData.isPremium };
        
        // Update state
        setToken(newToken);
        setUser(userWithPremium);
        console.log('[AUTH] State updated, isAuthenticated:', !!(userWithPremium && newToken));
        setIsLoading(false);
        
        // Return user data (including role)
        return userData;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful, user needs to login
      // Don't auto-login, let them use the login form
    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      if (error instanceof Error && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 3001.');
      }
      
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Track logout before clearing data
    if (user?.id) {
      analytics.userLogout(user.id);
    }
    
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('isPremium');
    setToken(null);
    setUser(null);
  };

  // Upgrade to Premium (Dummy)
  const upgradeToPremium = () => {
    if (user) {
      const updatedUser = { ...user, isPremium: true };
      setUser(updatedUser);
      sessionStorage.setItem('isPremium', 'true');
      
      // Force re-render dengan mengupdate user object reference
      // Ini akan memicu useEffect di komponen yang depend pada isPremium
      setTimeout(() => {
        setUser({ ...updatedUser });
      }, 100);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isPremium: user?.isPremium || false,
    login,
    register,
    logout,
    checkAuth,
    upgradeToPremium,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export at the bottom for Fast Refresh compatibility
export { AuthProvider };
export default AuthProvider;
