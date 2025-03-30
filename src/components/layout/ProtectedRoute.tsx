import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children or Outlet for nested routes
  return children || <Outlet />;
}

export function useRedirectIfAuthenticated() {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const fromLocation = location.state?.from?.pathname || '/';

  // Show loading state while checking authentication
  if (isLoading) {
    return {
      isLoading: true,
      shouldRedirect: false,
      redirectTo: '',
    };
  }

  // Redirect authenticated users to the requested page or home
  if (user) {
    return {
      isLoading: false,
      shouldRedirect: true,
      redirectTo: fromLocation,
    };
  }

  return {
    isLoading: false,
    shouldRedirect: false,
    redirectTo: '',
  };
}
