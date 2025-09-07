// src/TravelList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TravelForm from './TravelForm';

function TravelList({ clientId }) {
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTravel, setEditingTravel] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchTravels = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/travels/?client=${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTravels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravels();
  }, []);

  const handleTravelSaved = (travel) => {
    const exists = travels.find(t => t.id === travel.id);
    if (exists) {
      setTravels(travels.map(t => t.id === travel.id ? travel : t));
    } else {
      setTravels([...travels, travel]);
    }
    setShowForm(false);
    setEditingTravel(null);
  };

  const handleEdit = (travel) => {
    setEditingTravel(travel);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setTravels(travels.filter(t => t.id !== id));
  };

  if (loading) return <p>Chargement des voyages...</p>;

  return (
    <div className="travel-list">
      <h3>Voyages</h3>
      <button onClick={() => setShowForm(true)}>Ajouter un voyage</button>
      {showForm && (
        <TravelForm
          clientId={clientId}
          travel={editingTravel}
          onSaved={handleTravelSaved}
          onCancel={() => setShowForm(false)}
        />
      )}
      <ul>
        {travels.map(t => (
          <li key={t.id}>
            {t.type} - {t.date_depart} à {t.date_retour}
            <button onClick={() => handleEdit(t)}>Modifier</button>
            <button onClick={() => handleDelete(t.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TravelList;
