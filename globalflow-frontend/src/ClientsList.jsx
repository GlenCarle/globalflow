// src/ClientsList.jsx
import React, { useState } from "react";
import TravelList from "./TravelList";

function ClientsList({ clients, onEdit, onDelete }) {
  const [selectedClientId, setSelectedClientId] = useState(null);

  return (
    <div>
      <table className="clients-table">
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Pays</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <React.Fragment key={c.id}>
              <tr>
                <td>{c.prenom}</td>
                <td>{c.nom}</td>
                <td>{c.email}</td>
                <td>{c.telephone}</td>
                <td>{c.pays}</td>
                <td>
                  <button onClick={() => onEdit(c)}>Modifier</button>
                  <button onClick={() => onDelete(c.id)}>Supprimer</button>
                  <button
                    onClick={() =>
                      setSelectedClientId(
                        selectedClientId === c.id ? null : c.id
                      )
                    }
                  >
                    {selectedClientId === c.id ? "Cacher Voyages" : "Voir Voyages"}
                  </button>
                </td>
              </tr>
              {selectedClientId === c.id && (
                <tr>
                  <td colSpan={6}>
                    <TravelList clientId={c.id} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientsList;
