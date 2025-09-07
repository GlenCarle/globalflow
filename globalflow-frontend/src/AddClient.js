import React, { useState, useEffect } from 'react';
import api from './api';

function AddClient({ clientToEdit, onClientSaved, onCancel }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [type_piece, setTypePiece] = useState('');
  const [numero_piece, setNumeroPiece] = useState('');
  const [pays, setPays] = useState('');
  const [error, setError] = useState('');

  // Remplir le formulaire si on édite un client
  useEffect(() => {
    if (clientToEdit) {
      setNom(clientToEdit.nom);
      setPrenom(clientToEdit.prenom);
      setEmail(clientToEdit.email);
      setTelephone(clientToEdit.telephone);
      setTypePiece(clientToEdit.type_piece);
      setNumeroPiece(clientToEdit.numero_piece);
      setPays(clientToEdit.pays);
    } else {
      // reset
      setNom('');
      setPrenom('');
      setEmail('');
      setTelephone('');
      setTypePiece('');
      setNumeroPiece('');
      setPays('');
    }
  }, [clientToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientData = { nom, prenom, email, telephone, type_piece, numero_piece, pays };

    try {
      let response;
      if (clientToEdit) {
        // Modification
        response = await api.put(`clients/${clientToEdit.id}/`, clientData);
      } else {
        // Ajout
        response = await api.post('clients/', clientData);
      }

      onClientSaved(response.data);
    } catch (err) {
      console.error('Erreur API :', err);
      setError('Impossible d’enregistrer le client');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{clientToEdit ? 'Modifier Client' : 'Ajouter Client'}</h3>
      <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} required />
      <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="text" placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} required />
      <input type="text" placeholder="Type de pièce" value={type_piece} onChange={e => setTypePiece(e.target.value)} required />
      <input type="text" placeholder="Numéro de pièce" value={numero_piece} onChange={e => setNumeroPiece(e.target.value)} required />
      <input type="text" placeholder="Pays" value={pays} onChange={e => setPays(e.target.value)} required />

      <button type="submit">{clientToEdit ? 'Mettre à jour' : 'Ajouter'}</button>
      {clientToEdit && <button type="button" onClick={onCancel}>Annuler</button>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default AddClient;
