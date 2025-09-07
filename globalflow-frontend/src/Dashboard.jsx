// // src/Dashboard.jsx
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import ClientsList from "./ClientsList";
// import ClientForm from "./ClientForm";
// import logo from "./logo.png";
// import "./Dashboard.css";

// function Dashboard({ onLogout }) {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editingClient, setEditingClient] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);

//   // Récupération des clients depuis l'API
//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const token = localStorage.getItem("access_token");
//         const response = await axios.get("http://127.0.0.1:8000/api/clients/", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         // Supprimer les doublons par email
//         const uniqueClients = Array.from(
//           new Map(response.data.map((c) => [c.email, c])).values()
//         );
//         setClients(uniqueClients);
//       } catch (err) {
//         console.error("Erreur API :", err);
//         setError("Erreur lors du chargement des clients");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchClients();
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     if (onLogout) onLogout();
//   };

//   const handleClientSaved = (client) => {
//     const exists = clients.find((c) => c.id === client.id);
//     if (exists) {
//       setClients(clients.map((c) => (c.id === client.id ? client : c)));
//     } else {
//       setClients([...clients, client]);
//     }
//     setShowForm(false);
//     setEditingClient(null);
//   };

//   const handleEdit = (client) => {
//     setEditingClient(client);
//     setShowForm(true);
//   };

//   const handleDelete = (id) => {
//     setClients(clients.filter((c) => c.id !== id));
//   };

//   if (loading) return <p className="loading">Chargement...</p>;
//   if (error) return <p className="error">{error}</p>;

//   // Stats
//   const totalClients = clients.length;
//   const paysRepresentes = [...new Set(clients.map((c) => c.pays))].length;
//   const dernierClient = clients.length ? clients[clients.length - 1].prenom : "—";

//   return (
//     <div className={`dashboard ${darkMode ? "dark" : ""}`}>
//       {/* Navbar */}
//       <nav className="navbar">
//         <div className="navbar-left">
//           <img src={logo} alt="GlobalFlow logo" className="dashboard-logo" />
//           <h1>GlobalFlow</h1>
//         </div>
//         <ul className="nav-links">
//           <li>Clients</li>
//           <li>Rapports</li>
//           <li>Paramètres</li>
//         </ul>
//         <div className="navbar-right">
//           <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
//             {darkMode ? "☀️" : "🌙"}
//           </button>
//           <button className="logout-btn" onClick={handleLogout}>
//             Déconnexion
//           </button>
//         </div>
//       </nav>

//       {/* Header */}
//       <header className="dashboard-header">
//         <h2>Bienvenue sur la plateforme GlobalFlow</h2>
//       </header>

//       {/* Stats */}
//       <div className="stats-cards">
//         <div className="card">
//           <h3>Total Clients</h3>
//           <p>{totalClients}</p>
//         </div>
//         <div className="card">
//           <h3>Pays représentés</h3>
//           <p>{paysRepresentes}</p>
//         </div>
//         <div className="card">
//           <h3>Dernier client ajouté</h3>
//           <p>{dernierClient}</p>
//         </div>
//       </div>

//       {/* Clients List */}
//       <section className="clients-list">
//         <div className="clients-list-header">
//           <h2>Liste des clients</h2>
//           <button className="add-btn" onClick={() => setShowForm(true)}>
//             Ajouter un client
//           </button>
//         </div>

//         {showForm && (
//           <ClientForm
//             client={editingClient}
//             onSaved={handleClientSaved}
//             onCancel={() => {
//               setShowForm(false);
//               setEditingClient(null);
//             }}
//           />
//         )}

//         <ClientsList clients={clients} onEdit={handleEdit} onDelete={handleDelete} />
//       </section>
//     </div>
//   );
// }

// export default Dashboard;

src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "./api"; // Instance axios avec JWT et refresh
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
          api.get("/travel/api/documents/"),
          api.get("/travel/api/dossiers/"),
        ]);

        setClients(clientsRes.data || []);
        setDocuments(docsRes.data || []);
        setVoyageTypes(typesRes.data || []);

        // Génération des alertes (documents expirant dans 30 jours)
        const today = new Date();
        const upcomingAlerts = (docsRes.data || []).filter(
          doc => doc.date_expiration && new Date(doc.date_expiration) <= new Date(today.getTime() + 30*24*60*60*1000)
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

  // ---------- Handlers ----------
  const handleClientSaved = client => {
    setClients(prev => prev.some(c => c.id === client.id) ? prev.map(c => c.id === client.id ? client : c) : [...prev, client]);
    setShowClientForm(false);
    setEditingClient(null);
  };

  const handleDocumentSaved = document => {
    setDocuments(prev => prev.some(d => d.id === document.id) ? prev.map(d => d.id === document.id ? document : d) : [...prev, document]);
    setShowDocumentForm(false);
    setEditingDocument(null);
  };

  const handleTypeSaved = type => {
    setVoyageTypes(prev => prev.some(t => t.id === type.id) ? prev.map(t => t.id === type.id ? type : t) : [...prev, type]);
    setShowTypeForm(false);
    setEditingType(null);
  };

  const handleEditClient = client => { setEditingClient(client); setShowClientForm(true); };
  const handleEditDocument = doc => { setEditingDocument(doc); setShowDocumentForm(true); };
  const handleEditType = type => { setEditingType(type); setShowTypeForm(true); };

  const handleDeleteClient = id => setClients(prev => prev.filter(c => c.id !== id));
  const handleDeleteDocument = id => setDocuments(prev => prev.filter(d => d.id !== id));
  const handleDeleteType = id => setVoyageTypes(prev => prev.filter(t => t.id !== id));

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
          <h1>Agence de Voyage</h1>
        </div>
        <ul className="nav-links">
          <li>Clients</li>
          <li>Documents</li>
          <li>Types de voyage</li>
          <li>Alertes</li>
        </ul>
        <div className="navbar-right">
          <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? "☀️" : "🌙"}</button>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </nav>

      {/* Header */}
      <header className="dashboard-header">
        <h2>Bienvenue sur la plateforme Agence de Voyage</h2>
      </header>

      {/* Stats */}
      <div className="stats-cards">
        <div className="card"><h3>Total Clients</h3><p>{totalClients}</p></div>
        <div className="card"><h3>Total Documents</h3><p>{totalDocuments}</p></div>
        <div className="card"><h3>Types de voyage</h3><p>{totalTypes}</p></div>
        <div className="card"><h3>Alertes à venir</h3><p>{totalAlerts}</p></div>
      </div>

      {/* Sections */}
      <section className="section">
        <h2>Gestion des clients</h2>
        <button onClick={() => setShowClientForm(true)}>Ajouter un client</button>
        {showClientForm && (
          <ClientForm client={editingClient} onSaved={handleClientSaved} onCancel={() => { setShowClientForm(false); setEditingClient(null); }} />
        )}
        <ClientsList clients={clients} onEdit={handleEditClient} onDelete={handleDeleteClient} />
      </section>

      <section className="section">
        <h2>Suivi des documents</h2>
        <button onClick={() => setShowDocumentForm(true)}>Ajouter un document</button>
        {showDocumentForm && (
          <DocumentForm document={editingDocument} onSaved={handleDocumentSaved} onCancel={() => { setShowDocumentForm(false); setEditingDocument(null); }} />
        )}
        <DocumentsList documents={documents} onEdit={handleEditDocument} onDelete={handleDeleteDocument} />
      </section>

      <section className="section">
        <h2>Types de voyage</h2>
        <button onClick={() => setShowTypeForm(true)}>Ajouter un type</button>
        {showTypeForm && (
          <VoyageTypeForm type={editingType} onSaved={handleTypeSaved} onCancel={() => { setShowTypeForm(false); setEditingType(null); }} />
        )}
        <VoyageTypesList types={voyageTypes} onEdit={handleEditType} onDelete={handleDeleteType} />
      </section>

      <section className="section">
        <h2>Alertes et rappels</h2>
        <AlertList alerts={alerts} />
      </section>
    </div>
  );
}

export default Dashboard;
