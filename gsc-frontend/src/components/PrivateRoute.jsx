import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../lib/auth.service';
import ROUTES from '../constants/routes';

/**
 * PrivateRoute component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 *
 * @param {Object} props - Component props
 * @param {string} props.requiredRole - Role required to access the route (optional)
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} - Protected route or redirect
 */
const PrivateRoute = ({ requiredRole, children }) => {
  const { user, refreshToken } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Vérifier si l'utilisateur est authentifié
      const isUserAuthenticated = authService.isAuthenticated();
      
      if (!isUserAuthenticated) {
        // Si le token est expiré mais qu'il y a un token de rafraîchissement, essayer de rafraîchir
        const tokens = authService.getTokens();
        if (tokens && tokens.refresh) {
          try {
            const { success } = await refreshToken();
            setIsAuthorized(success);
          } catch (error) {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(true);
      }
      
      setIsChecking(false);
    };
    
    checkAuth();
  }, [refreshToken]);

  // Afficher un indicateur de chargement pendant la vérification
  if (isChecking) {
    return <div className="flex h-screen items-center justify-center">Vérification de l'authentification...</div>;
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthorized) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }

  // Si un rôle spécifique est requis, vérifier si l'utilisateur a ce rôle
  if (requiredRole && user?.role !== requiredRole) {
    // Rediriger vers le tableau de bord approprié en fonction du rôle de l'utilisateur
    switch (user?.role) {
      case 'admin':
        return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
      case 'agent':
        return <Navigate to={ROUTES.AGENT.DASHBOARD} replace />;
      default:
        return <Navigate to={ROUTES.CLIENT.DASHBOARD} replace />;
    }
  }

  // L'utilisateur est authentifié et a le rôle requis (si spécifié)
  return children;
};

export default PrivateRoute;