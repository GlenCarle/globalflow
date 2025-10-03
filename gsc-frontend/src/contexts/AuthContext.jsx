import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import authService from '../lib/auth.service';

// Create auth context
const AuthContext = createContext();

/**
 * Authentication provider component
 * Manages user authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({
    access: null,
    refresh: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  /**
   * Check if the current user has a specific role
   * @param {string|string[]} role - Single role or array of roles to check against
   * @returns {boolean} - True if user has the role, false otherwise
   */
  const hasRole = (role) => {
    if (!user) return false;
    
    // Get the user's role from either user.role or user.profile.role
    const userRole = user.role || (user.profile && user.profile.role);
    if (!userRole) return false;
    
    // If role is an array, check if user has any of the roles
    if (Array.isArray(role)) {
      return role.some(r => r === userRole);
    }
    
    return userRole === role;
  };
  
  /**
   * Check if the current user is authenticated
   * @returns {boolean} - True if user is authenticated, false otherwise
   */
  const isAuthenticated = () => {
    return !!user && !!tokens.access;
  };
  
  /**
   * Check if the current user is an admin
   * @returns {boolean} - True if user is an admin, false otherwise
   */
  const isAdmin = () => hasRole('admin');
  
  /**
   * Check if the current user is an agent
   * @returns {boolean} - True if user is an agent, false otherwise
   */
  const isAgent = () => hasRole('agent');
  
  /**
   * Check if the current user is a client
   * @returns {boolean} - True if user is a client, false otherwise
   */
  const isClient = () => hasRole('client');
  
  /**
   * Check if the current user has any of the specified roles
   * @param {string[]} roles - Array of roles to check against
   * @returns {boolean} - True if user has any of the specified roles
   */
  const hasAnyRole = (roles) => {
    if (!Array.isArray(roles)) return false;
    return roles.some(role => hasRole(role));
  };
  
  /**
   * Get the current user's role
   * @returns {string|null} - The user's role or null if not available
   */
  const getUserRole = () => {
    if (!user) return null;
    return user.role || (user.profile && user.profile.role) || null;
  };

  // Initialize auth state on mount - only load from localStorage, don't refresh automatically
  useEffect(() => {
    const initAuth = () => {
      try {
        // Load user and tokens from localStorage without automatic refresh
        const user = authService.getUser();
        const tokens = authService.getTokens();

        // Set auth header if we have a valid access token
        if (tokens && tokens.access && !authService.isTokenExpired(tokens.access)) {
          authService.setAuthHeader(tokens.access);
        }

        setUser(user);
        setTokens(tokens || { access: null, refresh: null });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setTokens({ access: null, refresh: null });
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  // isAuthenticated is already defined above with the correct implementation

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Make API request to login endpoint
      const response = await api.post('/login/', {
        username: email,
        password,
      });
      
      // La réponse JWT standard contient 'access' et 'refresh' directement dans la racine
      const { access, refresh } = response.data;
      authService.setTokens({ access, refresh });

      // Récupérer les informations de l'utilisateur séparément
      const userResponse = await api.get('/users/me/');
      const userData = userResponse.data;
      
      // Mettre à jour l'état avec les données utilisateur et les tokens
      setUser(userData);
      setTokens({
        access,
        refresh,
      });
      
      // Utiliser le service d'authentification pour stocker les tokens et l'utilisateur
      authService.setTokens({ access, refresh });
      authService.setUser(userData);
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Email ou mot de passe incorrect';
      
      setError(errorMessage);
      setLoading(false);
      console.error('Login error:', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Make API request to register endpoint
      const response = await api.post('/register/', userData);
      
      const { user: newUser, access, refresh } = response.data;
      
      // Update state with user data and tokens
      setUser(newUser);
      setTokens({
        access,
        refresh,
      });
      
      // Utiliser le service d'authentification pour stocker les tokens et l'utilisateur
      authService.setTokens({ access, refresh });
      authService.setUser(newUser);
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription';
      
      setError(errorMessage);
      setLoading(false);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Récupérer le token de rafraîchissement avant de l'effacer
      const currentTokens = authService.getTokens();
      
      if (currentTokens && currentTokens.refresh) {
        // Appeler l'API pour blacklister le token
        await api.post('/logout/', {
          refresh: currentTokens.refresh
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Utiliser le service d'authentification pour effacer les tokens et l'utilisateur
      authService.clearTokens();
      authService.clearUser();
      
      // Clear user data and tokens in state
      setUser(null);
      setTokens({
        access: null,
        refresh: null,
      });
      
      // Rediriger vers la page de connexion
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Make API request to update profile endpoint
      const response = await api.put('/users/me/', userData);
      
      // Update state with updated user data
      setUser(response.data);
      
      // Utiliser le service d'authentification pour mettre à jour l'utilisateur
      authService.setUser(response.data);
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil';
      
      setError(errorMessage);
      setLoading(false);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Refresh access token
  const refreshToken = async () => {
    try {
      // Utiliser le service d'authentification pour rafraîchir le token
      const result = await authService.refreshToken();
      
      if (result.success) {
        // Mettre à jour l'état avec les nouveaux tokens
        const newTokens = authService.getTokens();
        setTokens(newTokens);
      } else {
        // Si le rafraîchissement a échoué, déconnecter l'utilisateur
        setUser(null);
        setTokens({
          access: null,
          refresh: null,
        });
      }
      
      return result;
    } catch (error) {
      // If refresh token is invalid, logout user
      logout();
      
      return { success: false };
    }
  };

  // Context value
  const value = {
    // User state
    user,
    setUser, // Expose setUser to allow components to update user state
    tokens,
    loading,
    error,
    initialized,

    // API instance
    api,

    // Authentication methods
    login,
    logout,
    register,
    refreshToken,
    updateProfile, // Make sure updateProfile is included

    // Role-based helpers
    hasRole,
    hasAnyRole,
    isAuthenticated,
    isAdmin,
    isAgent,
    isClient,
    getUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};