import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

/**
 * Role-based route guard component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if access is allowed
 * @param {string|string[]} [props.allowedRoles] - Single role or array of roles that are allowed to access the route
 * @param {string} [props.redirectTo] - Path to redirect to if access is denied (defaults to '/unauthorized')
 * @returns {JSX.Element} - Rendered component or redirect
 */
const RoleGuard = ({ 
  children, 
  allowedRoles, 
  redirectTo = ROUTES.UNAUTHORIZED 
}) => {
  const { isAuthenticated, hasRole, initialized } = useAuth();
  const location = useLocation();

  // Wait for auth to initialize
  if (!initialized) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  // If no roles are specified, allow access to any authenticated user
  if (!allowedRoles) {
    return isAuthenticated() ? children : <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Convert single role to array for easier handling
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // Check if user has any of the allowed roles
  const hasRequiredRole = rolesArray.some(role => hasRole(role));

  if (!isAuthenticated()) {
    // Not authenticated, redirect to login with the return URL
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!hasRequiredRole) {
    // Authenticated but not authorized, redirect to unauthorized page
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Authorized, render the children
  return children;
};

export default RoleGuard;
