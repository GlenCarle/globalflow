// src/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './auth';

export default function PrivateRoute({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    // Redirige vers /login et mémorise la page demandée
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
