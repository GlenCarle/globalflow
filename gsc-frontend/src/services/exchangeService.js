import api from './api';

/**
 * Save a new exchange request
 * @param {Object} requestData - The exchange request data
 * @returns {Promise<Object>} The created exchange request
 */
export const saveExchangeRequest = async (requestData) => {
  try {
    const response = await api.post('/api/exchange/requests/', requestData);
    return response.data;
  } catch (error) {
    console.error('Error saving exchange request:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'enregistrement de la demande d\'échange');
  }
};

/**
 * Get exchange request by ID
 * @param {string} id - The exchange request ID
 * @returns {Promise<Object>} The exchange request details
 */
export const getExchangeRequest = async (id) => {
  try {
    const response = await api.get(`/api/exchange/requests/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange request:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la demande d\'échange');
  }
};

/**
 * Get all exchange requests for the current user
 * @param {Object} filters - Optional filters for the request
 * @returns {Promise<Array>} List of exchange requests
 */
export const getExchangeRequests = async (filters = {}) => {
  try {
    const response = await api.get('/api/exchange/requests/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange requests:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des demandes d\'échange');
  }
};

/**
 * Update an exchange request status
 * @param {string} id - The exchange request ID
 * @param {string} status - The new status
 * @param {string} notes - Optional notes for the status update
 * @returns {Promise<Object>} The updated exchange request
 */
export const updateExchangeRequestStatus = async (id, status, notes = '') => {
  try {
    const response = await api.patch(`/api/exchange/requests/${id}/status/`, { status, notes });
    return response.data;
  } catch (error) {
    console.error('Error updating exchange request status:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut de la demande d\'échange');
  }
};

/**
 * Cancel an exchange request
 * @param {string} id - The exchange request ID
 * @param {string} reason - Reason for cancellation
 * @returns {Promise<Object>} The cancelled exchange request
 */
export const cancelExchangeRequest = async (id, reason) => {
  try {
    const response = await api.post(`/api/exchange/requests/${id}/cancel/`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error cancelling exchange request:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'annulation de la demande d\'échange');
  }
};

/**
 * Get exchange rate between two currencies
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<Object>} Exchange rate information
 */
export const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    const response = await api.get('/api/exchange/rate/', {
      params: { from: fromCurrency, to: toCurrency }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du taux de change');
  }
};

/**
 * Get exchange history for the current user
 * @param {Object} filters - Optional filters for the history
 * @returns {Promise<Array>} List of exchange history items
 */
export const getExchangeHistory = async (filters = {}) => {
  try {
    const response = await api.get('/api/exchange/history/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange history:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'historique des échanges');
  }
};
