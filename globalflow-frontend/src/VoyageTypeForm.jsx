// src/VoyageTypeForm.jsx
import React, { useState, useEffect } from "react";

function VoyageTypeForm({ type, onSaved, onCancel }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (type) setName(type.nom);
  }, [type]);

  const handleSubmit = e => {
    e.preventDefault();
    onSaved({ id: type?.id, nom: name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom type de voyage" required />
      <button type="submit">Enregistrer</button>
      <button type="button" onClick={onCancel}>Annuler</button>
    </form>
  );
}

export default VoyageTypeForm;
