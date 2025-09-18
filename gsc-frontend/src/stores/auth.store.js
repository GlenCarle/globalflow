import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

/**
 * Authentication store for managing user authentication state
 * Uses persist middleware to save auth tokens in localStorage
 */
export const useAuth = create(
  persist(
    (set, get) => ({
      // User data
      user: null,
      
      // Auth tokens
      tokens: {
        access: null,
        refresh: null,
      },
      
      // Loading state
      loading: false,
      
      // Error state
      error: null,
      
      // Check if user is authenticated
      isAuthenticated: () => {
        const { tokens } = get();
        return !!tokens.access;
      },
      
      // Login user
      login: async (email, password) => {
        set({ loading: true, error: null });
        
        try {
          // Make API request to login endpoint
          const response = await axios.post('/api/auth/login/', {
            email,
            password,
          });
          
          const { user, access, refresh } = response.data;
          
          // Update store with user data and tokens
          set({
            user,
            tokens: {
              access,
              refresh,
            },
            loading: false,
          });
          
          // Configure axios to use the token for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || 'Une erreur est survenue lors de la connexion',
          });
          
          return {
            success: false,
            error: error.response?.data?.message || 'Une erreur est survenue lors de la connexion',
          };
        }
      },
      
      // Register user
      register: async (userData) => {
        set({ loading: true, error: null });
        
        try {
          // Make API request to register endpoint
          const response = await axios.post('/api/auth/register/', userData);
          
          const { user, access, refresh } = response.data;
          
          // Update store with user data and tokens
          set({
            user,
            tokens: {
              access,
              refresh,
            },
            loading: false,
          });
          
          // Configure axios to use the token for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription',
          });
          
          return {
            success: false,
            error: error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription',
          };
        }
      },
      
      // Logout user
      logout: () => {
        // Remove token from axios headers
        delete axios.defaults.headers.common['Authorization'];
        
        // Clear user data and tokens
        set({
          user: null,
          tokens: {
            access: null,
            refresh: null,
          },
        });
      },
      
      // Update user profile
      updateProfile: async (userData) => {
        set({ loading: true, error: null });
        
        try {
          // Make API request to update profile endpoint
          const response = await axios.put('/api/auth/profile/', userData);
          
          // Update store with updated user data
          set({
            user: response.data,
            loading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil',
          });
          
          return {
            success: false,
            error: error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil',
          };
        }
      },
      
      // Refresh access token
      refreshToken: async () => {
        const { tokens } = get();
        
        if (!tokens.refresh) {
          return { success: false };
        }
        
        try {
          // Make API request to refresh token endpoint
          const response = await axios.post('/api/auth/refresh/', {
            refresh: tokens.refresh,
          });
          
          const { access } = response.data;
          
          // Update store with new access token
          set({
            tokens: {
              ...tokens,
              access,
            },
          });
          
          // Update axios headers with new token
          axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          return { success: true };
        } catch (error) {
          // If refresh token is invalid, logout user
          get().logout();
          
          return { success: false };
        }
      },
      
      // Initialize auth state
      initAuth: () => {
        const { tokens } = get();
        
        // If access token exists, set it in axios headers
        if (tokens.access) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        }
      },
    }),
    {
      name: 'gsc-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
);

// Initialize auth when this module is imported
if (typeof window !== 'undefined') {
  useAuth.getState().initAuth();
}