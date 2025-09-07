import axios from 'axios';

// Vérifie si l'utilisateur est authentifié
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (err) {
    console.error('[Auth] Token invalide :', err);
    return false;
  }
};

// Déconnecte l'utilisateur
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete axios.defaults.headers.common['Authorization'];
};

// Rafraîchit le token d'accès à partir du refresh token
export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  console.log('[Auth] Refresh token:', refresh);

  if (!refresh) {
    console.log('[Auth] Aucun refresh token trouvé, déconnexion');
    logout();
    return false;
  }

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh });
    const { access } = response.data;
    localStorage.setItem('access_token', access);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    console.log('[Auth] Nouveau access_token reçu:', access);
    return true;
  } catch (error) {
    console.error('[Auth] Erreur lors du refresh token:', error);
    logout();
    return false;
  }
};
