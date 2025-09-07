// src/TravelForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

function TravelForm({ clientId, travel, onSaved, onCancel }) {
  const [type, setType] = useState(travel?.type || '');
  const [dateDepart, setDateDepart] = useState(travel?.date_depart || '');
  const [dateRetour, setDateRetour] = useState(travel?.date_retour || '');
  const [documents, setDocuments] = useState(travel?.documents || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const data = { client: clientId, type, date_depart: dateDepart, date_retour: dateRetour, documents };

    try {
      let res;
      if (travel) {
        res = await axios.put(`http://127.0.0.1:8000/api/travels/${travel.id}/`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`http://127.0.0.1:8000/api/travels/`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSaved(res.data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={type} onChange={e => setType(e.target.value)} required>
        <option value="">Sélectionnez un type de voyage</option>
        <option value="Études">Études</option>
        <option value="Travail">Travail</option>
        <option value="Tourisme">Tourisme</option>
        <option value="Pèlerinage">Pèlerinage</option>
      </select>
      <input type="date" value={dateDepart} onChange={e => setDateDepart(e.target.value)} required />
      <input type="date" value={dateRetour} onChange={e => setDateRetour(e.target.value)} required />
      <input type="text" placeholder="Documents (passeport, visa…)" value={documents} onChange={e => setDocuments(e.target.value)} />
      <button type="submit">{travel ? "Modifier" : "Ajouter"}</button>
      <button type="button" onClick={onCancel}>Annuler</button>
    </form>
  );
}

export default TravelForm;
