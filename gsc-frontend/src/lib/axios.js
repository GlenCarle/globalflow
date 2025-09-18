import axios from 'axios';
import authService from './auth.service';

// Create axios instance with custom config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to add the auth token to each request
api.interceptors.request.use(
  (config) => {
    // Utiliser le service d'authentification pour obtenir les tokens
    const tokens = authService.getTokens();
    
    if (tokens && tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 Unauthorized and we haven't tried to refresh the token yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using the auth service
        const { success } = await authService.refreshToken();

        // If token refresh was successful, retry the original request
        if (success) {
          // The auth service has already updated the token in localStorage and axios headers
          return api(originalRequest);
        } else {
          // If refresh failed, clear auth data
          authService.clearTokens();
          authService.clearUser();
          
          // Redirect to login page if we're in a browser environment
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } catch (refreshError) {
        // If token refresh failed, reject the promise
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;