import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CLIENT_ROUTES, AGENT_ROUTES, ADMIN_ROUTES, PUBLIC_ROUTES } from '../../constants/routes';

/**
 * Component that redirects users to their appropriate dashboard based on their role
 * after authentication or when accessing a protected route.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.fallbackPath] - Path to redirect to if user doesn't have access (defaults to '/unauthorized')
 * @param {string|string[]} [props.allowedRoles] - Roles that are allowed to access the route (optional)
 * @returns {null} - Renders nothing, only handles redirects
 */
const RoleBasedRedirect = ({ 
  fallbackPath = PUBLIC_ROUTES.UNAUTHORIZED,
  allowedRoles 
}) => {
  const { isAuthenticated, isAdmin, isAgent, isClient, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      // Not authenticated, redirect to login with return URL
      navigate(PUBLIC_ROUTES.LOGIN, { 
        state: { from: location },
        replace: true 
      });
      return;
    }

    // If no specific roles are required, allow access
    if (!allowedRoles) return;

    // Check if user has any of the allowed roles
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const hasRequiredRole = rolesArray.some(role => hasRole(role));

    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to fallback
      navigate(fallbackPath, { replace: true });
      return;
    }

    // User is authenticated and has required role, redirect to appropriate dashboard
    if (isAdmin) {
      navigate(ADMIN_ROUTES.DASHBOARD, { replace: true });
    } else if (isAgent) {
      navigate(AGENT_ROUTES.DASHBOARD, { replace: true });
    } else if (isClient) {
      navigate(CLIENT_ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, isAdmin, isAgent, isClient, hasRole, allowedRoles, navigate, location, fallbackPath]);

  return null;
};

export default RoleBasedRedirect;
