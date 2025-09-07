// src/LogoutButton.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from './auth';

export default function LogoutButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    // Retourne au login et mémorise de où l’on vient
    navigate('/login', { replace: true, state: { from: location } });
  };

  return (
    <button onClick={handleLogout}>
      Se déconnecter
    </button>
  );
}
