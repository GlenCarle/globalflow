// src/DocumentsList.jsx
import React from "react";

function DocumentsList({ documents, onEdit, onDelete }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Numéro</th>
          <th>Client</th>
          <th>Date expiration</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {documents.map(doc => (
          <tr key={doc.id}>
            <td>{doc.type}</td>
            <td>{doc.numero}</td>
            <td>{doc.client_nom}</td>
            <td>{doc.date_expiration}</td>
            <td>
              <button onClick={() => onEdit(doc)}>✏️</button>
              <button onClick={() => onDelete(doc.id)}>🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DocumentsList;
