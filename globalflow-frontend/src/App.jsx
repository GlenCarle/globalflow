// // src/App.jsx
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './Login.jsx';
// import Register from './Register.jsx';
// import ForgotPassword from './ForgotPassword.jsx'; // à créer
// import Dashboard from './Dashboard.jsx';
// import './App.css';

// export default function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       setIsAuthenticated(false);
//       return;
//     }

//     // Vérification rapide de l'expiration du token (JWT)
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const now = Math.floor(Date.now() / 1000);
//       if (payload.exp && payload.exp > now) {
//         setIsAuthenticated(true);
//       } else {
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         setIsAuthenticated(false);
//       }
//     } catch (err) {
//       console.error("Token invalide :", err);
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//       setIsAuthenticated(false);
//     }
//   }, []);

//   const handleLogin = () => {
//     setIsAuthenticated(true);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//     setIsAuthenticated(false);
//   };

//   return (
//     <Router>
//       <Routes>
//         {/* Routes publiques */}
//         <Route
//           path="/login"
//           element={
//             isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
//           }
//         />
//         <Route
//           path="/register"
//           element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
//         />
//         <Route
//           path="/forgot-password"
//           element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />}
//         />

//         {/* Route privée Dashboard */}
//         <Route
//           path="/dashboard"
//           element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
//         />

//         {/* Redirection par défaut */}
//         <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
//       </Routes>
//     </Router>
//   );
// }


// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "./api"; // Instance axios configurée avec JWT + refresh automatique
import ClientsList from "./ClientsList";
import ClientForm from "./ClientForm";
import DocumentsList from "./DocumentsList";
import DocumentForm from "./DocumentForm";
import VoyageTypesList from "./VoyageTypesList";
import VoyageTypeForm from "./VoyageTypeForm";
import AlertList from "./AlertList";
import logo from "./logo.png";
import "./Dashboard.css";

function Dashboard({ onLogout }) {
  // ---------- States ----------
  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [voyageTypes, setVoyageTypes] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingClient, setEditingClient] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editingType, setEditingType] = useState(null);

  const [showClientForm, setShowClientForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  // ---------- Fetch all data ----------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsRes, docsRes, typesRes] = await Promise.all([
          api.get("/clients-list/"),
          api.get("/documents/"),
          api.get("/travel-types/"),
        ]);

        setClients(clientsRes.data || []);
        setDocuments(docsRes.data || []);
        setVoyageTypes(typesRes.data || []);

        // Génération des alertes (documents expirant dans 30 jours)
        const today = new Date();
        const upcomingAlerts = (docsRes.data || []).filter(
          (doc) =>
            doc.date_expiration &&
            new Date(doc.date_expiration) <=
              new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        );
        setAlerts(upcomingAlerts);
      } catch (err) {
        console.error("Erreur API :", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ---------- Logout ----------
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    if (onLogout) onLogout();
  };

  // ---------- Handlers (CRUD) ----------
  const handleClientSaved = (client) => {
    setClients((prev) =>
      prev.some((c) => c.id === client.id)
        ? prev.map((c) => (c.id === client.id ? client : c))
        : [...prev, client]
    );
    setShowClientForm(false);
    setEditingClient(null);
  };

  const handleDocumentSaved = (document) => {
    setDocuments((prev) =>
      prev.some((d) => d.id === document.id)
        ? prev.map((d) => (d.id === document.id ? document : d))
        : [...prev, document]
    );
    setShowDocumentForm(false);
    setEditingDocument(null);
  };

  const handleTypeSaved = (type) => {
    setVoyageTypes((prev) =>
      prev.some((t) => t.id === type.id)
        ? prev.map((t) => (t.id === type.id ? type : t))
        : [...prev, type]
    );
    setShowTypeForm(false);
    setEditingType(null);
  };

  // ---------- Edit ----------
  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };
  const handleEditDocument = (doc) => {
    setEditingDocument(doc);
    setShowDocumentForm(true);
  };
  const handleEditType = (type) => {
    setEditingType(type);
    setShowTypeForm(true);
  };

  // ---------- Delete ----------
  const handleDeleteClient = (id) =>
    setClients((prev) => prev.filter((c) => c.id !== id));
  const handleDeleteDocument = (id) =>
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  const handleDeleteType = (id) =>
    setVoyageTypes((prev) => prev.filter((t) => t.id !== id));

  // ---------- Loading/Error ----------
  if (loading) return <p className="loading">Chargement...</p>;
  if (error) return <p className="error">{error}</p>;

  // ---------- Stats ----------
  const totalClients = clients.length;
  const totalDocuments = documents.length;
  const totalTypes = voyageTypes.length;
  const totalAlerts = alerts.length;

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="dashboard-logo" />
          <h1>GlobalFlow</h1>
        </div>
        <ul className="nav-links">
          <li>Clients</li>
          <li>Documents</li>
          <li>Types de voyage</li>
          <li>Alertes</li>
        </ul>
        <div className="navbar-right">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </nav>

      {/* Header */}
      <header className="dashboard-header">
        <h2>Bienvenue sur la plateforme GlobalFlow</h2>
      </header>

      {/* Stats */}
      <div className="stats-cards">
        <div className="card">
          <h3>Total Clients</h3>
          <p>{totalClients}</p>
        </div>
        <div className="card">
          <h3>Total Documents</h3>
          <p>{totalDocuments}</p>
        </div>
        <div className="card">
          <h3>Types de voyage</h3>
          <p>{totalTypes}</p>
        </div>
        <div className="card">
          <h3>Alertes à venir</h3>
          <p>{totalAlerts}</p>
        </div>
      </div>

      {/* Section Clients */}
      <section className="section">
        <h2>Gestion des clients</h2>
        <button onClick={() => setShowClientForm(true)}>Ajouter un client</button>
        {showClientForm && (
          <ClientForm
            client={editingClient}
            onSaved={handleClientSaved}
            onCancel={() => {
              setShowClientForm(false);
              setEditingClient(null);
            }}
          />
        )}
        <ClientsList
          clients={clients}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
        />
      </section>

      {/* Section Documents */}
      <section className="section">
        <h2>Suivi des documents</h2>
        <button onClick={() => setShowDocumentForm(true)}>
          Ajouter un document
        </button>
        {showDocumentForm && (
          <DocumentForm
            document={editingDocument}
            onSaved={handleDocumentSaved}
            onCancel={() => {
              setShowDocumentForm(false);
              setEditingDocument(null);
            }}
          />
        )}
        <DocumentsList
          documents={documents}
          onEdit={handleEditDocument}
          onDelete={handleDeleteDocument}
        />
      </section>

      {/* Section Types de voyage */}
      <section className="section">
        <h2>Types de voyage</h2>
        <button onClick={() => setShowTypeForm(true)}>Ajouter un type</button>
        {showTypeForm && (
          <VoyageTypeForm
            type={editingType}
            onSaved={handleTypeSaved}
            onCancel={() => {
              setShowTypeForm(false);
              setEditingType(null);
            }}
          />
        )}
        <VoyageTypesList
          types={voyageTypes}
          onEdit={handleEditType}
          onDelete={handleDeleteType}
        />
      </section>

      {/* Section Alertes */}
      <section className="section">
        <h2>Alertes et rappels</h2>
        <AlertList alerts={alerts} />
      </section>
    </div>
  );
}

export default Dashboard;
