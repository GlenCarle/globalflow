// Statuts des échanges
export const EXCHANGE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

export const EXCHANGE_STATUS_LABELS = {
  [EXCHANGE_STATUS.DRAFT]: 'Brouillon',
  [EXCHANGE_STATUS.PENDING]: 'En attente',
  [EXCHANGE_STATUS.PROCESSING]: 'En cours',
  [EXCHANGE_STATUS.COMPLETED]: 'Terminé',
  [EXCHANGE_STATUS.CANCELLED]: 'Annulé',
  [EXCHANGE_STATUS.REJECTED]: 'Rejeté'
};

// Méthodes de réception
export const RECEPTION_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_MONEY: 'mobile_money',
  CASH_PICKUP: 'cash_pickup',
  AGENCY_PICKUP: 'agency_pickup'
};

export const RECEPTION_METHOD_LABELS = {
  [RECEPTION_METHODS.BANK_TRANSFER]: 'Virement bancaire',
  [RECEPTION_METHODS.MOBILE_MONEY]: 'Mobile Money',
  [RECEPTION_METHODS.CASH_PICKUP]: 'Retrait en espèces',
  [RECEPTION_METHODS.AGENCY_PICKUP]: 'Retrait en agence'
};
