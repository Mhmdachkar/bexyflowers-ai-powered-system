import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from '@/lib/navigation-compat';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that checks if admin is authenticated
 * Redirects to login page if not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('adminAuthenticated');
      const adminUsername = localStorage.getItem('adminUsername');
      
      // Both must exist for valid authentication
      const isValid = adminAuth === 'true' && adminUsername !== null;
      
      setIsAuthenticated(isValid);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  // Show simple spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL to redirect back after login
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
