import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  console.log('ProtectedRoute mounted', { tokenPresent: !!localStorage.getItem('token'), user, loading });

  // While verifying authentication, show a loading placeholder
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log('ProtectedRoute: no user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // If role check fails, redirect to home
  if (roles && !roles.includes(user.role)) {
    console.log('ProtectedRoute: role not allowed, redirecting to /');
    return <Navigate to="/" replace />;
  }

  // Authenticated and authorized — render children
  return <>{children}</>;
}
