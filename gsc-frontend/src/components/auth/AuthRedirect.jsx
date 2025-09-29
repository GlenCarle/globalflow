import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CLIENT_ROUTES, AGENT_ROUTES, ADMIN_ROUTES } from '../../constants/routes';

/**
 * Component that handles redirecting authenticated users to their appropriate dashboard
 * based on their role when they visit the login page or home page.
 */
const AuthRedirect = () => {
  const { isAuthenticated, isAdmin, isAgent, isClient } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      if (isAdmin()) {
        navigate(ADMIN_ROUTES.DASHBOARD, { replace: true });
      } else if (isAgent()) {
        navigate(AGENT_ROUTES.DASHBOARD, { replace: true });
      } else if (isClient()) {
        navigate(CLIENT_ROUTES.DASHBOARD, { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isAgent, isClient, navigate]);

  return null;
};

export default AuthRedirect;
