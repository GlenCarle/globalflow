// src/components/ClientForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ClientForm({ client, onSaved, onCancel }) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [pays, setPays] = useState('');

  useEffect(() => {
    if (client) {
      setPrenom(client.prenom);
      setNom(client.nom);
      setEmail(client.email);
      setTelephone(client.telephone);
      setPays(client.pays);
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    try {
      if (client) {
        const res = await axios.put(`http://127.0.0.1:8000/api/clients/${client.id}/`, 
          { prenom, nom, email, telephone, pays },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onSaved(res.data);
      } else {
        const res = await axios.post(`http://127.0.0.1:8000/api/clients/`, 
          { prenom, nom, email, telephone, pays },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onSaved(res.data);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement du client');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-client">
      <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Prénom" required />
      <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required type="email" />
      <input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="Téléphone" required />
      <input value={pays} onChange={e => setPays(e.target.value)} placeholder="Pays" required />
      <div className="buttons">
        <button type="submit">{client ? 'Modifier' : 'Ajouter'}</button>
        <button type="button" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  );
}

export default ClientForm;
