// src/VoyageTypesList.jsx
import React from "react";

function VoyageTypesList({ types, onEdit, onDelete }) {
  return (
    <ul>
      {types.map(t => (
        <li key={t.id}>
          {t.nom} 
          <button onClick={() => onEdit(t)}>✏️</button>
          <button onClick={() => onDelete(t.id)}>🗑️</button>
        </li>
      ))}
    </ul>
  );
}

export default VoyageTypesList;
