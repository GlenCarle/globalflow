import React, { useEffect, useState } from 'react';
import api from './api';
import AddClient from './AddClient';

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('clients/');
      setClients(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur API :', err);
      setError('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClick = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce client ?')) return;
    try {
      await api.delete(`clients/${id}/`);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur suppression :', err);
      alert('Impossible de supprimer le client');
    }
  };

  const handleClientSaved = (client) => {
    if (editingClient) {
      setClients(prev => prev.map(c => (c.id === client.id ? client : c)));
    } else {
      setClients(prev => [...prev, client]);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  // Stats
  const totalClients = clients.length;
  const countries = [...new Set(clients.map(c => c.pays))];

  if (loading) return <p className="text-gray-500 text-center mt-10">Chargement...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white p-6 space-y-4">
        <div className="text-2xl font-bold">GlobalFlow</div>
        <button className="block w-full text-left px-4 py-2 hover:bg-blue-600 rounded">Clients</button>
        <button className="block w-full text-left px-4 py-2 hover:bg-blue-600 rounded">Rapports</button>
        <button className="block w-full text-left px-4 py-2 hover:bg-blue-600 rounded">Paramètres</button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bienvenue sur la plateforme GlobalFlow</h1>
          <button className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">Dark Mode</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
            <h3 className="text-gray-500">Total Clients</h3>
            <p className="text-2xl font-bold">{totalClients}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
            <h3 className="text-gray-500">Pays représentés</h3>
            <p className="text-2xl font-bold">{countries.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
            <h3 className="text-gray-500">Dernier client ajouté</h3>
            <p className="text-2xl font-bold">{clients.length ? clients[clients.length - 1].prenom : 'N/A'}</p>
          </div>
        </div>

        {/* Clients Table */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">Liste des clients</h2>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Ajouter un client
          </button>
        </div>

        {showForm && (
          <AddClient
            clientToEdit={editingClient}
            onClientSaved={handleClientSaved}
            onCancel={handleCancel}
          />
        )}

        <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-blue-100 dark:bg-gray-700">
              <tr>
                {['Prénom','Nom','Email','Téléphone','Type de pièce','Numéro de pièce','Pays','Actions'].map(h => (
                  <th key={h} className="px-4 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-blue-50 dark:hover:bg-gray-600">
                  <td className="px-4 py-2">{c.prenom}</td>
                  <td className="px-4 py-2">{c.nom}</td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">{c.telephone}</td>
                  <td className="px-4 py-2">{c.type_piece}</td>
                  <td className="px-4 py-2">{c.numero_piece}</td>
                  <td className="px-4 py-2">{c.pays}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEditClick(c)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(c.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
