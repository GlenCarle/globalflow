import React from 'react';

export default function BookingStatusBadge({ statut }) {
  const colors = {
    draft: 'gray',
    pending_payment: 'amber',
    processing: 'blue',
    confirmed: 'green',
    ticket_sent: 'purple',
    cancelled: 'red',
  };

  const translations = {
    draft: 'Brouillon',
    pending_payment: 'En attente de paiement',
    processing: 'En cours de traitement',
    payment_validated: 'Paiement validé',
    pending_agent_validation: 'En attente de validation agent',
    confirmed: 'Confirmée',
    ticket_sent: 'Billet envoyé',
    cancelled: 'Annulée',
  };

  return (
    <span className={`px-2 py-1 rounded bg-${colors[statut] || 'gray'}-200 text-${colors[statut] || 'gray'}-800`}>
      {translations[statut] || statut}
    </span>
  );
}
