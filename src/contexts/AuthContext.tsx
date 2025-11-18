import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import analytics from '@/lib/analytics';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Check if token is valid and get user data
  const checkAuth = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        setToken(savedToken);
      } else {
        // Token invalid or expired
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
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
        
        // Save token to localStorage
        localStorage.setItem('token', newToken);
        
        // Update state
        setToken(newToken);
        setUser(userData);
        
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
      console.log('Attempting to register with:', { name, email });
      
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

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
    
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
