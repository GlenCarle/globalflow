import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to handle role-based access control
 * @param {string|string[]} allowedRoles - Single role or array of roles that are allowed
 * @returns {{ hasAccess: boolean, isAllowed: boolean, loading: boolean }}
 */
const useRole = (allowedRoles) => {
  const { user, isAuthenticated, hasRole, initialized } = useAuth();
  
  // If no roles are specified, allow access to any authenticated user
  if (!allowedRoles) {
    return { 
      hasAccess: isAuthenticated, 
      isAllowed: isAuthenticated, 
      loading: !initialized 
    };
  }
  
  // Convert single role to array for easier handling
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // Check if user has any of the allowed roles
  const hasAccess = rolesArray.some(role => hasRole(role));
  
  return {
    hasAccess,
    isAllowed: isAuthenticated && hasAccess,
    loading: !initialized
  };
};

export default useRole;
