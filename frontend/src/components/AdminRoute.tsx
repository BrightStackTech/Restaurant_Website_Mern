import { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
  children: JSX.Element;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { state } = useAuth();
  const location = useLocation();

  // If a token exists but user isn't loaded yet, show a loading indicator
  if (state.token && !state.user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If no user or if the user is not an admin, redirect
  if (!state.user || !state.user.isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;