// src/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Assure-toi d’avoir le CSS ci-dessous

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', {
        username,
        email,
        password,
      });
      setMessage('Compte créé avec succès ! Vous pouvez vous connecter.');
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage('Erreur lors de la création du compte.');
    }
  };

  return (
    <div className={`register-background ${darkMode ? 'dark' : ''}`}>
      <form className="register-form" onSubmit={handleRegister}>
        <h2 className="fadeIn">Créer un compte</h2>

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="fadeIn delay1"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="fadeIn delay2"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="fadeIn delay3"
        />

        <button type="submit" className="fadeIn delay4">S'inscrire</button>

        {message && <p className="register-message fadeIn delay5">{message}</p>}

        <p className="toggle-darkmode fadeIn delay6">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />{' '}
          Dark Mode
        </p>
      </form>
    </div>
  );
}

export default Register;
