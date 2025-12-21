import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('[PROTECTED ROUTE] isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user?.name);

  if (isLoading) {
    console.log('[PROTECTED ROUTE] Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          <Loader2 className="animate-spin text-white mx-auto mb-4" size={48} />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[PROTECTED ROUTE] Not authenticated, redirecting to login');
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('[PROTECTED ROUTE] Authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
