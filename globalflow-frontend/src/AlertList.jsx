// src/AlertList.jsx
import React from "react";

function AlertList({ alerts }) {
  if (!alerts.length) return <p>Aucune alerte pour le moment.</p>;

  return (
    <ul>
      {alerts.map(alert => (
        <li key={alert.id}>
          {alert.client_nom} - {alert.type} expire le {alert.date_expiration}
        </li>
      ))}
    </ul>
  );
}

export default AlertList;
