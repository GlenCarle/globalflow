import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../lib/auth.service';
import { ROUTES, CLIENT_ROUTES, AGENT_ROUTES, ADMIN_ROUTES } from '../../constants/routes';

/**
 * ProtectedRoute component that handles authentication and role-based access control
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if access is allowed
 * @param {string|string[]} [props.allowedRoles] - Single role or array of roles that are allowed to access the route
 * @param {string} [props.redirectTo=ROUTES.UNAUTHORIZED] - Path to redirect to if access is denied
 * @param {boolean} [props.requireAuth=true] - Whether authentication is required (default: true)
 * @returns {React.ReactNode} - Rendered component or redirect
 */
const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = ROUTES.UNAUTHORIZED,
  requireAuth = true,
}) => {
  const { isAuthenticated, hasRole, loading, user, refreshToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(false);

  // Check authentication from localStorage only (no server calls)
  useEffect(() => {
    if (!requireAuth) return;

    const tokens = authService.getTokens();
    const user = authService.getUser();

    // Check if user is authenticated based on localStorage
    const isAuthenticated = user && tokens && tokens.access && !authService.isTokenExpired(tokens.access);

    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      navigate(ROUTES.LOGIN, { state: { from: location }, replace: true });
    }
  }, [requireAuth, location, navigate]);

  // Show loading state while auth is initializing or checking
  if (loading || checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is not required, render the children
  if (!requireAuth) {
    return children;
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated()) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  // If no specific roles are required, allow access
  if (!allowedRoles) {
    return children;
  }

  // Convert single role to array for easier handling
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // Check if user has any of the allowed roles
  const hasRequiredRole = rolesArray.some(role => hasRole(role));

  // If user has required role, render children
  if (hasRequiredRole) {
    return children;
  }
  
  // If user doesn't have required role, redirect based on their actual role
  if (hasRole('admin')) {
    return <Navigate to={ADMIN_ROUTES.DASHBOARD} replace />;
  } else if (hasRole('agent')) {
    return <Navigate to={AGENT_ROUTES.DASHBOARD} replace />;
  } else if (hasRole('client')) {
    return <Navigate to={CLIENT_ROUTES.DASHBOARD} replace />;
  }

  // If user is authenticated but doesn't have the required role, redirect to unauthorized page
  return (
    <Navigate
      to={redirectTo}
      state={{ from: location }}
      replace
    />
  );
};

export default ProtectedRoute;
