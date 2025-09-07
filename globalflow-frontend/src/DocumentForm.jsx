// src/DocumentForm.jsx
import React, { useState, useEffect } from "react";

function DocumentForm({ document, onSaved, onCancel }) {
  const [formData, setFormData] = useState({
    type: "",
    numero: "",
    client_nom: "",
    date_expiration: ""
  });

  useEffect(() => {
    if (document) setFormData(document);
  }, [document]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = e => {
    e.preventDefault();
    onSaved(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="type" value={formData.type} onChange={handleChange} placeholder="Type" required />
      <input name="numero" value={formData.numero} onChange={handleChange} placeholder="Numéro" required />
      <input name="client_nom" value={formData.client_nom} onChange={handleChange} placeholder="Nom client" required />
      <input type="date" name="date_expiration" value={formData.date_expiration} onChange={handleChange} required />
      <button type="submit">Enregistrer</button>
      <button type="button" onClick={onCancel}>Annuler</button>
    </form>
  );
}

export default DocumentForm;
