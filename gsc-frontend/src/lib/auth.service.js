import api from './axios';
import { jwtDecode } from 'jwt-decode';

/**
 * Service d'authentification centralisé
 * Gère tous les aspects liés aux tokens d'authentification
 */
class AuthService {
  /**
   * Stocke les tokens dans le localStorage
   * @param {Object} tokens - Les tokens d'authentification (access et refresh)
   */
  setTokens(tokens) {
    if (tokens && tokens.access) {
      localStorage.setItem('gsc-auth-tokens', JSON.stringify(tokens));
      this.setAuthHeader(tokens.access);
    }
  }

  /**
   * Récupère les tokens depuis le localStorage
   * @returns {Object|null} Les tokens d'authentification ou null
   */
  getTokens() {
    try {
      const tokensString = localStorage.getItem('gsc-auth-tokens');
      if (!tokensString) return null;
      
      return JSON.parse(tokensString);
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Supprime les tokens du localStorage
   */
  clearTokens() {
    localStorage.removeItem('gsc-auth-tokens');
    this.removeAuthHeader();
  }

  /**
   * Stocke les données utilisateur dans le localStorage
   * @param {Object} user - Les données utilisateur
   */
  setUser(user) {
    if (user) {
      localStorage.setItem('gsc-auth-user', JSON.stringify(user));
    }
  }

  /**
   * Récupère les données utilisateur depuis le localStorage
   * @returns {Object|null} Les données utilisateur ou null
   */
  getUser() {
    try {
      const userString = localStorage.getItem('gsc-auth-user');
      if (!userString) return null;
      
      return JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing auth user:', error);
      this.clearUser();
      return null;
    }
  }

  /**
   * Supprime les données utilisateur du localStorage
   */
  clearUser() {
    localStorage.removeItem('gsc-auth-user');
  }

  /**
   * Configure le header d'autorisation pour toutes les requêtes API
   * @param {string} token - Le token d'accès
   */
  setAuthHeader(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Supprime le header d'autorisation
   */
  removeAuthHeader() {
    delete api.defaults.headers.common['Authorization'];
  }

  /**
   * Vérifie si le token d'accès est expiré
   * @param {string} token - Le token d'accès
   * @returns {boolean} True si le token est expiré, false sinon
   */
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns {boolean} True si l'utilisateur est authentifié, false sinon
   */
  isAuthenticated() {
    const tokens = this.getTokens();
    return tokens && tokens.access && !this.isTokenExpired(tokens.access);
  }

  /**
   * Rafraîchit le token d'accès
   * @returns {Promise<Object>} Résultat de l'opération
   */
  async refreshToken() {
    const tokens = this.getTokens();
    
    if (!tokens || !tokens.refresh) {
      return { success: false };
    }
    
    try {
      const response = await api.post('/token/refresh/', {
        refresh: tokens.refresh,
      });
      
      const { access } = response.data;
      
      // Mettre à jour le token d'accès
      this.setTokens({
        ...tokens,
        access,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      this.clearUser();
      
      return { success: false };
    }
  }

  /**
   * Initialise le service d'authentification
   * @returns {Object} État initial de l'authentification
   */
  init() {
    const tokens = this.getTokens();
    const user = this.getUser();
    
    // Si les tokens existent, configurer le header d'autorisation
    if (tokens && tokens.access) {
      // Vérifier si le token est expiré
      if (this.isTokenExpired(tokens.access)) {
        // Si le token est expiré et qu'il y a un token de rafraîchissement, essayer de rafraîchir
        if (tokens.refresh) {
          this.refreshToken().catch(() => {
            this.clearTokens();
            this.clearUser();
          });
        } else {
          this.clearTokens();
          this.clearUser();
        }
      } else {
        // Si le token est valide, configurer le header
        this.setAuthHeader(tokens.access);
      }
    }
    
    return {
      tokens,
      user,
      isAuthenticated: this.isAuthenticated(),
    };
  }
}

// Exporter une instance unique du service
const authService = new AuthService();

export default authService;