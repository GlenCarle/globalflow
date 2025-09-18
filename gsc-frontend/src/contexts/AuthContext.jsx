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

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      // Utiliser le service d'authentification pour initialiser l'état
      const authState = authService.init();
      
      setUser(authState.user);
      setTokens(authState.tokens || { access: null, refresh: null });
      setInitialized(true);
    };
    
    initAuth();
  }, []);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

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
  const logout = () => {
    // Utiliser le service d'authentification pour effacer les tokens et l'utilisateur
    authService.clearTokens();
    authService.clearUser();
    
    // Clear user data and tokens in state
    setUser(null);
    setTokens({
      access: null,
      refresh: null,
    });
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Make API request to update profile endpoint
      const response = await api.put('/auth/profile/', userData);
      
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
    user,
    tokens,
    loading,
    error,
    initialized,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
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