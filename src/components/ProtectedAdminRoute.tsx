import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component for admin-only pages
 * Redirects to login if not authenticated
 * Redirects to home if authenticated but not admin
 */
const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated and admin
  return <>{children}</>;
};

export default ProtectedAdminRoute;
