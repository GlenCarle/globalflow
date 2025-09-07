// src/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false); // pour toggle dark mode

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/forgot-password/', { email });
      setMessage('Un email de réinitialisation a été envoyé.');
    } catch (err) {
      setMessage('Erreur lors de la demande.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? "forgot-background dark" : "forgot-background"}>
      <form className="forgot-form" onSubmit={handleForgot}>
        <h2>Mot de passe oublié</h2>
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Envoyer</button>
        {message && <p className="forgot-message">{message}</p>}

        {/* Toggle Dark Mode */}
        <div className="toggle-darkmode">
          <label>
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            Mode sombre
          </label>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
