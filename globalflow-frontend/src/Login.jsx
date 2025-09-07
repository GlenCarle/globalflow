// // src/Login.jsx
// import React, { useState } from 'react';
// import axios from 'axios';
// import './Login.css';
// import logo from './logo.png';

// function Login({ onLogin }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [message, setMessage] = useState('');
//   const [darkMode, setDarkMode] = useState(false);

//   const [showRegister, setShowRegister] = useState(false);
//   const [showForgot, setShowForgot] = useState(false);

//   const [regUsername, setRegUsername] = useState('');
//   const [regEmail, setRegEmail] = useState('');
//   const [regPassword, setRegPassword] = useState('');
//   const [forgotEmail, setForgotEmail] = useState('');

//   // ===== Connexion =====
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setMessage('');
//     try {
//       const response = await axios.post('http://127.0.0.1:8000/api/token/', { username, password });
//       const { access, refresh } = response.data;

//       localStorage.setItem('access_token', access);
//       localStorage.setItem('refresh_token', refresh);
//       axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
//       onLogin();
//     } catch {
//       setError('Identifiants invalides');
//     }
//   };

//   // ===== Inscription =====
//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     try {
//       await axios.post('http://127.0.0.1:8000/api/register/', {
//         username: regUsername,
//         email: regEmail,
//         password: regPassword
//       });
//       setMessage('Inscription réussie ! Connectez-vous.');
//       setShowRegister(false);
//       setRegUsername('');
//       setRegEmail('');
//       setRegPassword('');
//     } catch {
//       setMessage('Erreur lors de l’inscription.');
//     }
//   };

//   // ===== Mot de passe oublié =====
//   const handleForgot = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     try {
//       await axios.post('http://127.0.0.1:8000/api/forgot-password/', { email: forgotEmail });
//       setMessage('Email de réinitialisation envoyé !');
//       setShowForgot(false);
//       setForgotEmail('');
//     } catch {
//       setMessage('Erreur lors de la réinitialisation.');
//     }
//   };

//   return (
//     <div className={`login-background ${darkMode ? 'dark' : ''}`}>
//       <form className="login-form" onSubmit={handleLogin}>
//         <img src={logo} alt="Logo GlobalFlow" className="login-logo" />
//         <h2 className="fadeIn">Connexion GSC</h2>

//         <input
//           type="text"
//           placeholder="Nom d'utilisateur"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//           className="fadeIn delay1"
//         />
//         <input
//           type="password"
//           placeholder="Mot de passe"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           className="fadeIn delay2"
//         />

//         <button type="submit" className="fadeIn delay3">Se connecter</button>

//         {error && <p className="login-error fadeIn">{error}</p>}
//         {message && <p className="login-message fadeIn">{message}</p>}

//         <div className="login-links fadeIn delay4">
//           <span className="link" onClick={() => setShowForgot(true)}>Mot de passe oublié ?</span>
//           <span className="link" onClick={() => setShowRegister(true)}>S’inscrire</span>
//         </div>

//         <p className="toggle-darkmode fadeIn delay5">
//           <input
//             type="checkbox"
//             checked={darkMode}
//             onChange={() => setDarkMode(!darkMode)}
//           />{' '}
//           Dark Mode
//         </p>
//       </form>

//       {/* ===== Modal Inscription ===== */}
//       {showRegister && (
//         <div className="modal fadeInModal">
//           <div className="modal-content slideDown">
//             <h3>S’inscrire</h3>
//             <form onSubmit={handleRegister}>
//               <input type="text" placeholder="Nom d'utilisateur" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
//               <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
//               <input type="password" placeholder="Mot de passe" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
//               <button type="submit">S’inscrire</button>
//             </form>
//             <button className="close-btn" onClick={() => setShowRegister(false)}>✖</button>
//           </div>
//         </div>
//       )}

//       {/* ===== Modal Mot de passe oublié ===== */}
//       {showForgot && (
//         <div className="modal fadeInModal">
//           <div className="modal-content slideDown">
//             <h3>Réinitialiser le mot de passe</h3>
//             <form onSubmit={handleForgot}>
//               <input type="email" placeholder="Email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
//               <button type="submit">Envoyer</button>
//             </form>
//             <button className="close-btn" onClick={() => setShowForgot(false)}>✖</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Login;

// src/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import logo from './logo.png';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', { username, password });
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      onLogin(); // met à jour l'état parent pour afficher le dashboard
    } catch (err) {
      setError('Identifiants invalides');
    }
  };

  return (
    <div className={`login-background ${darkMode ? 'dark' : ''}`}>
      <form className="login-form" onSubmit={handleSubmit}>
        <img src={logo} alt="Logo GlobalFlow" className="login-logo" />
        <h2>Connexion GSC</h2>

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Se connecter</button>

        {error && <p className="login-error">{error}</p>}

        <div className="login-links">
          <a href="/forgot-password">Mot de passe oublié ?</a>
          <a href="/register">S’inscrire</a>
        </div>

        <p className="toggle-darkmode">
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

export default Login;
