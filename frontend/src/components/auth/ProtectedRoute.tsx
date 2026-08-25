import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted location so we can potentially redirect back later
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
