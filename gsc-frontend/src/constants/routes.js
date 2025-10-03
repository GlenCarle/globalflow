/**
 * Application routes
 * This file contains all the routes used in the application
 */

// Error pages
export const ERROR_ROUTES = {
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
  SERVER_ERROR: '/500',
  FORBIDDEN: '/403',
};

// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',
  ABOUT: '/about',
  CONTACT: '/contact',
  IMMIGRATION_ASSISTANT: '/immigration-assistant',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
  FAQ: '/faq',
  ...ERROR_ROUTES,
};

// Client routes
export const CLIENT_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  PROFILE_EDIT: '/dashboard/profile/edit',
  SECURITY: '/dashboard/security',
  NOTIFICATIONS: '/dashboard/notifications',
  
  // Applications
  APPLICATIONS: '/dashboard/my-applications',
  APPLICATION_DETAIL: '/dashboard/my-applications/:id',
  VISA_APPLICATIONS: '/dashboard/visa-applications',
  VISA_APPLICATIONS_NEW: '/dashboard/visa-applications/new',
  VISA_APPLICATION_DETAIL: '/dashboard/visa-applications/:id',
  VISA_APPLICATION_DUPLICATE: '/dashboard/visa-applications/duplicate',
  
  // Bookings & Appointments
  BOOKINGS: '/dashboard/bookings',
  BOOKING_DETAIL: '/dashboard/bookings/:id',
  APPOINTMENTS: '/dashboard/appointments',
  APPOINTMENT_DETAIL: '/dashboard/appointments/:id',
  
  // Documents & Messages
  DOCUMENTS: '/dashboard/documents',
  DOCUMENT_UPLOAD: '/dashboard/documents/upload',
  MESSAGES: '/dashboard/messages',
  MESSAGE_THREAD: '/dashboard/messages/:threadId',
  
  // Billing & Payments
  PAYMENTS: '/dashboard/payments',
  PAYMENT_DETAIL: '/payment/:bookingId',
  PAYMENT_METHODS: '/dashboard/payments/methods',
  PAYMENT_HISTORY: '/dashboard/payments/history',
  INVOICES: '/dashboard/payments/invoices',
  INVOICE_DETAIL: '/dashboard/payments/invoices/:id',

  // Currency Exchange
  CURRENCY_EXCHANGE: '/dashboard/exchange',
  CURRENCY_EXCHANGE_HISTORY: '/dashboard/exchange/history',
  CURRENCY_EXCHANGE_DETAIL: '/dashboard/exchange/requests/:id',
  CURRENCY_EXCHANGE_NEW: '/dashboard/exchange/new',

  // Checkout
  CHECKOUT: '/dashboard/checkout',
  CHECKOUT_CONFIRMATION: '/dashboard/checkout/confirmation',
  
  // Settings
  SETTINGS: '/dashboard/settings',
  PREFERENCES: '/dashboard/settings/preferences',
};

// Agent routes
export const AGENT_ROUTES = {
  DASHBOARD: '/agent',
  
  // Applications & Cases
  APPLICATIONS: '/agent/applications',
  APPLICATION_DETAIL: '/agent/applications/:id',
  CASE_DETAIL: '/agent/cases/:id',
  CASE_REVIEW: '/agent/cases/:id/review',
  
  // Appointments
  APPOINTMENTS: '/agent/appointments',
  APPOINTMENT_DETAIL: '/agent/appointments/:id',
  APPOINTMENT_CREATE: '/agent/appointments/new',
  
  // Clients
  CLIENTS: '/agent/clients',
  CLIENT_DETAIL: '/agent/clients/:id',
  CLIENT_EDIT: '/agent/clients/:id/edit',

  // Payments & Bookings
  PAYMENTS_MANAGEMENT: '/agent/payments-management',
  BOOKINGS_MANAGEMENT: '/agent/bookings-management',
  
  // Communication
  MESSAGES: '/agent/messages',
  MESSAGE_THREAD: '/agent/messages/:threadId',
  
  // Alerts & Notifications
  ALERTS: '/agent/alerts',
  NOTIFICATIONS: '/agent/notifications',
  
  // Currency Exchange
  CURRENCY_EXCHANGES: '/agent/currency-exchanges',

  // Reports
  REPORTS: '/agent/reports',
  PERFORMANCE: '/agent/performance',

  // Settings
  SETTINGS: '/agent/settings',
  PROFILE: '/agent/profile',
  PREFERENCES: '/agent/preferences',
};

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  USER_DETAIL: '/admin/users/:id',
  AGENTS: '/admin/agents',
  AGENT_DETAIL: '/admin/agents/:id',
  SERVICES: '/admin/services',
  SERVICE_DETAIL: '/admin/services/:id',
  EXCHANGE_RATES: '/admin/exchange-rates',
  REPORTS: '/admin/reports',
  SETTINGS: '/admin/settings',
};

// Combine all routes
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...CLIENT_ROUTES,
  ...AGENT_ROUTES,
  ...ADMIN_ROUTES,
};

export default ROUTES;