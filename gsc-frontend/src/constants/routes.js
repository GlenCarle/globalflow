/**
 * Application routes
 * This file contains all the routes used in the application
 */

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
};

// Client routes
export const CLIENT_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  APPLICATIONS: '/dashboard/applications',
  APPLICATION_DETAIL: '/dashboard/applications/:id',
  BOOKINGS: '/dashboard/bookings',
  BOOKING_DETAIL: '/dashboard/bookings/:id',
  APPOINTMENTS: '/dashboard/appointments',
  DOCUMENTS: '/dashboard/documents',
  MESSAGES: '/dashboard/messages',
  PAYMENTS: '/dashboard/payments',
  CHECKOUT: '/dashboard/checkout',
};

// Agent routes
export const AGENT_ROUTES = {
  DASHBOARD: '/agent',
  CASES: '/agent/cases',
  CASE_DETAIL: '/agent/cases/:id',
  APPOINTMENTS: '/agent/appointments',
  CLIENTS: '/agent/clients',
  CLIENT_DETAIL: '/agent/clients/:id',
  MESSAGES: '/agent/messages',
  ALERTS: '/agent/alerts',
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