import api from './axios';

/**
 * API service for handling all API requests
 * Uses the configured axios instance with interceptors
 */
const ApiService = {
  /**
   * Authentication
   */
  auth: {
    /**
     * Login user
     * @param {Object} credentials - User credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @returns {Promise} - Promise with response data
     */
    login: (credentials) => {
      return api.post('/auth/login/', credentials);
    },

    /**
     * Register user
     * @param {Object} userData - User data
     * @returns {Promise} - Promise with response data
     */
    register: (userData) => {
      return api.post('/auth/register/', userData);
    },

    /**
     * Forgot password
     * @param {Object} data - Email data
     * @param {string} data.email - User email
     * @returns {Promise} - Promise with response data
     */
    forgotPassword: (data) => {
      return api.post('/auth/forgot-password/', data);
    },

    /**
     * Reset password
     * @param {Object} data - Reset password data
     * @param {string} data.token - Reset token
     * @param {string} data.password - New password
     * @returns {Promise} - Promise with response data
     */
    resetPassword: (data) => {
      return api.post('/auth/reset-password/', data);
    },

    /**
     * Verify reset token
     * @param {Object} data - Token data
     * @param {string} data.token - Reset token
     * @returns {Promise} - Promise with response data
     */
    verifyResetToken: (data) => {
      return api.post('/auth/verify-reset-token/', data);
    },

    /**
     * Refresh token
     * @param {Object} data - Refresh token data
     * @param {string} data.refresh - Refresh token
     * @returns {Promise} - Promise with response data
     */
    refreshToken: (data) => {
      return api.post('/auth/refresh/', data);
    },

    /**
     * Get current user profile
     * @returns {Promise} - Promise with response data
     */
    getProfile: () => {
      return api.get('/auth/profile/');
    },

    /**
     * Update user profile
     * @param {Object} userData - User data to update
     * @returns {Promise} - Promise with response data
     */
    updateProfile: (userData) => {
      return api.put('/auth/profile/', userData);
    },

    /**
     * Change password
     * @param {Object} data - Password data
     * @param {string} data.current_password - Current password
     * @param {string} data.new_password - New password
     * @returns {Promise} - Promise with response data
     */
    changePassword: (data) => {
      return api.post('/auth/change-password/', data);
    },
  },

  /**
   * Users
   */
  users: {
    /**
     * Get all users
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getAll: (params = {}) => {
      return api.get('/users/', { params });
    },

    /**
     * Get user by ID
     * @param {number} id - User ID
     * @returns {Promise} - Promise with response data
     */
    getById: (id) => {
      return api.get(`/users/${id}/`);
    },

    /**
     * Create user
     * @param {Object} userData - User data
     * @returns {Promise} - Promise with response data
     */
    create: (userData) => {
      return api.post('/users/', userData);
    },

    /**
     * Update user
     * @param {number} id - User ID
     * @param {Object} userData - User data to update
     * @returns {Promise} - Promise with response data
     */
    update: (id, userData) => {
      return api.put(`/users/${id}/`, userData);
    },

    /**
     * Delete user
     * @param {number} id - User ID
     * @returns {Promise} - Promise with response data
     */
    delete: (id) => {
      return api.delete(`/users/${id}/`);
    },
  },

  /**
   * Clients
   */
  clients: {
    /**
     * Get all clients
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getAll: (params = {}) => {
      return api.get('/clients/', { params });
    },

    /**
     * Get client by ID
     * @param {number} id - Client ID
     * @returns {Promise} - Promise with response data
     */
    getById: (id) => {
      return api.get(`/clients/${id}/`);
    },

    /**
     * Create client
     * @param {Object} clientData - Client data
     * @returns {Promise} - Promise with response data
     */
    create: (clientData) => {
      return api.post('/clients/', clientData);
    },

    /**
     * Update client
     * @param {number} id - Client ID
     * @param {Object} clientData - Client data to update
     * @returns {Promise} - Promise with response data
     */
    update: (id, clientData) => {
      return api.put(`/clients/${id}/`, clientData);
    },

    /**
     * Delete client
     * @param {number} id - Client ID
     * @returns {Promise} - Promise with response data
     */
    delete: (id) => {
      return api.delete(`/clients/${id}/`);
    },
  },

  /**
   * Services
   */
  services: {
    /**
     * Get all services
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getAll: (params = {}) => {
      return api.get('/services/', { params });
    },

    /**
     * Get service by ID
     * @param {number} id - Service ID
     * @returns {Promise} - Promise with response data
     */
    getById: (id) => {
      return api.get(`/services/${id}/`);
    },

    /**
     * Create service
     * @param {Object} serviceData - Service data
     * @returns {Promise} - Promise with response data
     */
    create: (serviceData) => {
      return api.post('/services/', serviceData);
    },

    /**
     * Update service
     * @param {number} id - Service ID
     * @param {Object} serviceData - Service data to update
     * @returns {Promise} - Promise with response data
     */
    update: (id, serviceData) => {
      return api.put(`/services/${id}/`, serviceData);
    },

    /**
     * Delete service
     * @param {number} id - Service ID
     * @returns {Promise} - Promise with response data
     */
    delete: (id) => {
      return api.delete(`/services/${id}/`);
    },
  },

  /**
   * Applications
   */
  applications: {
    /**
     * Get all applications
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getAll: (params = {}) => {
      return api.get('/applications/', { params });
    },

    /**
     * Get application by ID
     * @param {number} id - Application ID
     * @returns {Promise} - Promise with response data
     */
    getById: (id) => {
      return api.get(`/applications/${id}/`);
    },

    /**
     * Create application
     * @param {Object} applicationData - Application data
     * @returns {Promise} - Promise with response data
     */
    create: (applicationData) => {
      return api.post('/applications/', applicationData);
    },

    /**
     * Update application
     * @param {number} id - Application ID
     * @param {Object} applicationData - Application data to update
     * @returns {Promise} - Promise with response data
     */
    update: (id, applicationData) => {
      return api.put(`/applications/${id}/`, applicationData);
    },

    /**
     * Delete application
     * @param {number} id - Application ID
     * @returns {Promise} - Promise with response data
     */
    delete: (id) => {
      return api.delete(`/applications/${id}/`);
    },
  },

  /**
   * Documents
   */
  documents: {
    /**
     * Get all documents
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getAll: (params = {}) => {
      return api.get('/documents/', { params });
    },

    /**
     * Get document by ID
     * @param {number} id - Document ID
     * @returns {Promise} - Promise with response data
     */
    getById: (id) => {
      return api.get(`/documents/${id}/`);
    },

    /**
     * Upload document
     * @param {FormData} formData - Form data with file
     * @returns {Promise} - Promise with response data
     */
    upload: (formData) => {
      return api.post('/documents/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },

    /**
     * Update document
     * @param {number} id - Document ID
     * @param {Object} documentData - Document data to update
     * @returns {Promise} - Promise with response data
     */
    update: (id, documentData) => {
      return api.put(`/documents/${id}/`, documentData);
    },

    /**
     * Delete document
     * @param {number} id - Document ID
     * @returns {Promise} - Promise with response data
     */
    delete: (id) => {
      return api.delete(`/documents/${id}/`);
    },
  },

  /**
   * Appointments
   */
  appointments: {
    /**
     * Get all appointments
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getAll: (params = {}) => {
      return api.get('/appointments/', { params });
    },

    /**
     * Get appointment by ID
     * @param {number} id - Appointment ID
     * @returns {Promise} - Promise with response data
     */
    getById: (id) => {
      return api.get(`/appointments/${id}/`);
    },

    /**
     * Create appointment
     * @param {Object} appointmentData - Appointment data
     * @returns {Promise} - Promise with response data
     */
    create: (appointmentData) => {
      return api.post('/appointments/', appointmentData);
    },

    /**
     * Update appointment
     * @param {number} id - Appointment ID
     * @param {Object} appointmentData - Appointment data to update
     * @returns {Promise} - Promise with response data
     */
    update: (id, appointmentData) => {
      return api.put(`/appointments/${id}/`, appointmentData);
    },

    /**
     * Delete appointment
     * @param {number} id - Appointment ID
     * @returns {Promise} - Promise with response data
     */
    delete: (id) => {
      return api.delete(`/appointments/${id}/`);
    },
  },

  /**
   * Messages
   */
  messages: {
    /**
     * Get all messages
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getAll: (params = {}) => {
      return api.get('/messages/', { params });
    },

    /**
     * Get message by ID
     * @param {number} id - Message ID
     * @returns {Promise} - Promise with response data
     */
    getById: (id) => {
      return api.get(`/messages/${id}/`);
    },

    /**
     * Send message
     * @param {Object} messageData - Message data
     * @returns {Promise} - Promise with response data
     */
    send: (messageData) => {
      return api.post('/messages/', messageData);
    },

    /**
     * Mark message as read
     * @param {number} id - Message ID
     * @returns {Promise} - Promise with response data
     */
    markAsRead: (id) => {
      return api.post(`/messages/${id}/read/`);
    },

    /**
     * Delete message
     * @param {number} id - Message ID
     * @returns {Promise} - Promise with response data
     */
    delete: (id) => {
      return api.delete(`/messages/${id}/`);
    },
  },

  /**
   * Reports
   */
  reports: {
    /**
     * Get revenue report
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getRevenue: (params = {}) => {
      return api.get('/reports/revenue/', { params });
    },

    /**
     * Get clients report
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getClients: (params = {}) => {
      return api.get('/reports/clients/', { params });
    },

    /**
     * Get applications report
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    getApplications: (params = {}) => {
      return api.get('/reports/applications/', { params });
    },

    /**
     * Export report
     * @param {string} type - Report type
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise with response data
     */
    export: (type, params = {}) => {
      return api.get(`/reports/export/${type}/`, {
        params,
        responseType: 'blob',
      });
    },
  },
};

export default ApiService;