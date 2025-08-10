import React from 'react';
import { useAuthStore } from '@/store/authStore';
import Login from './Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();

  // Show loading while checking authentication
  if (isLoading) {
    return null;
  }

  // If not authenticated or not admin, show login
  if (!isAuthenticated || !isAdmin) {
    return <Login />;
  }

  // If authenticated and admin, render children
  return <>{children}</>;
};

export default ProtectedRoute; 