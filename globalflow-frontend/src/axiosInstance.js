import axios from 'axios';
import { refreshToken, logout } from './auth';

// Instance Axios pour l'API
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: { 'Content-Type': 'application/json' },
});

// Ajouter le token à chaque requête
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse pour gérer les tokens expirés
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si 401 et ce n’est pas déjà un retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshToken();
      if (refreshed) {
        const token = localStorage.getItem('access_token');
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest); // relance la requête originale
      } else {
        logout(); // déconnexion si refresh échoue
        return Promise.reject(error); // ajoute ceci pour éviter une requête suspendue
      }
    }

    return Promise.reject(error);
  }
);

export default api;
