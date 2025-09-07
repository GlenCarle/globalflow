import axios from 'axios';
import { refreshToken, logout } from './auth';

// Instance axios pour l'API
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: { 'Content-Type': 'application/json' },
});

// Ajouter le token à chaque requête
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// Intercepteur de réponse pour gérer le token expiré
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (!error.response) {
      console.error('[API] Pas de réponse du serveur', error);
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshed = await refreshToken();
        if (refreshed) {
          const token = localStorage.getItem('access_token');
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        } else {
          logout();
        }
      } catch (refreshError) {
        console.error('[API] Erreur lors du refresh token', refreshError);
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
