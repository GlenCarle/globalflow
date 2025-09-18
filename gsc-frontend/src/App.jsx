import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PUBLIC_ROUTES, CLIENT_ROUTES, AGENT_ROUTES, ADMIN_ROUTES } from './constants/routes';

// Layouts
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Components
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import ForgotPasswordPage from './pages/Auth/ForgotPassword';
import ResetPasswordPage from './pages/Auth/ResetPassword';
// These pages will be implemented later
const ServicesListPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Services</h1><p>Cette page est en cours de développement.</p></div>;
const ServiceDetailPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Détail du service</h1><p>Cette page est en cours de développement.</p></div>;
const AboutPage = () => <div className="p-8"><h1 className="text-2xl font-bold">À propos</h1><p>Cette page est en cours de développement.</p></div>;
const ContactPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Contact</h1><p>Cette page est en cours de développement.</p></div>;
const ImmigrationAssistantPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Assistant d'immigration</h1><p>Cette page est en cours de développement.</p></div>;

// Client Pages
import UserDashboardPage from './pages/User/Dashboard';
import UserProfilePage from './pages/User/Profile';
// User pages placeholders
const MyApplicationsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Mes demandes</h1><p>Cette page est en cours de développement.</p></div>;
const ApplicationDetailPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Détail de la demande</h1><p>Cette page est en cours de développement.</p></div>;
const MyBookingsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Mes réservations</h1><p>Cette page est en cours de développement.</p></div>;
const MyAppointmentsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Mes rendez-vous</h1><p>Cette page est en cours de développement.</p></div>;
const DocumentsHubPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Mes documents</h1><p>Cette page est en cours de développement.</p></div>;
const MessagesPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Messages</h1><p>Cette page est en cours de développement.</p></div>;
const PaymentsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Paiements</h1><p>Cette page est en cours de développement.</p></div>;
const CheckoutPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Paiement</h1><p>Cette page est en cours de développement.</p></div>;

// Agent Pages
// Agent pages placeholders
const AgentDashboardPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Tableau de bord agent</h1><p>Cette page est en cours de développement.</p></div>;
const CaseListPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Liste des dossiers</h1><p>Cette page est en cours de développement.</p></div>;
const CaseDetailPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Détail du dossier</h1><p>Cette page est en cours de développement.</p></div>;
const AgentAppointmentsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Rendez-vous</h1><p>Cette page est en cours de développement.</p></div>;
const AgentClientsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Clients</h1><p>Cette page est en cours de développement.</p></div>;
const AgentClientDetailPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Détail du client</h1><p>Cette page est en cours de développement.</p></div>;
const AgentMessagesPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Messages</h1><p>Cette page est en cours de développement.</p></div>;
const AgentAlertsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Alertes</h1><p>Cette page est en cours de développement.</p></div>;

// Admin Pages
// Admin pages placeholders
const AdminDashboardPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Tableau de bord administrateur</h1><p>Cette page est en cours de développement.</p></div>;
const UserManagementPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Gestion des utilisateurs</h1><p>Cette page est en cours de développement.</p></div>;
const UserDetailPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Détail de l'utilisateur</h1><p>Cette page est en cours de développement.</p></div>;
const AgentManagementPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Gestion des agents</h1><p>Cette page est en cours de développement.</p></div>;
const AgentDetailPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Détail de l'agent</h1><p>Cette page est en cours de développement.</p></div>;
const ServiceCatalogPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Catalogue de services</h1><p>Cette page est en cours de développement.</p></div>;
const AdminServiceDetailPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Détail du service</h1><p>Cette page est en cours de développement.</p></div>;
const ReportsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Rapports</h1><p>Cette page est en cours de développement.</p></div>;
const SettingsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Paramètres</h1><p>Cette page est en cours de développement.</p></div>;

// Error Pages
import NotFoundPage from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, initialized } = useAuth();

  // Helper function to redirect to appropriate dashboard based on user role
  const getHomepageRedirect = () => {
    if (!user) return PUBLIC_ROUTES.HOME;
    
    switch (user.role) {
      case 'admin':
        return ADMIN_ROUTES.DASHBOARD;
      case 'agent':
        return AGENT_ROUTES.DASHBOARD;
      default:
        return CLIENT_ROUTES.DASHBOARD;
    }
  };

  // Show loading state while auth is initializing
  if (!initialized) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path={PUBLIC_ROUTES.HOME} element={<LandingPage />} />
          <Route path={PUBLIC_ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={PUBLIC_ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={PUBLIC_ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={PUBLIC_ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={PUBLIC_ROUTES.SERVICES} element={<ServicesListPage />} />
          <Route path={PUBLIC_ROUTES.SERVICE_DETAIL} element={<ServiceDetailPage />} />
          <Route path={PUBLIC_ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={PUBLIC_ROUTES.CONTACT} element={<ContactPage />} />
          <Route path={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT} element={<ImmigrationAssistantPage />} />
        </Route>

        {/* Client Routes */}
        <Route
          path={CLIENT_ROUTES.DASHBOARD}
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<UserDashboardPage />} />
          <Route path={CLIENT_ROUTES.PROFILE} element={<UserProfilePage />} />
          <Route path={CLIENT_ROUTES.APPLICATIONS} element={<MyApplicationsPage />} />
          <Route path={CLIENT_ROUTES.APPLICATION_DETAIL} element={<ApplicationDetailPage />} />
          <Route path={CLIENT_ROUTES.BOOKINGS} element={<MyBookingsPage />} />
          <Route path={CLIENT_ROUTES.APPOINTMENTS} element={<MyAppointmentsPage />} />
          <Route path={CLIENT_ROUTES.DOCUMENTS} element={<DocumentsHubPage />} />
          <Route path={CLIENT_ROUTES.MESSAGES} element={<MessagesPage />} />
          <Route path={CLIENT_ROUTES.PAYMENTS} element={<PaymentsPage />} />
          <Route path={CLIENT_ROUTES.CHECKOUT} element={<CheckoutPage />} />
        </Route>

        {/* Agent Routes */}
        <Route
          path={AGENT_ROUTES.DASHBOARD}
          element={
            <PrivateRoute requiredRole="agent">
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AgentDashboardPage />} />
          <Route path={AGENT_ROUTES.CASES} element={<CaseListPage />} />
          <Route path={AGENT_ROUTES.CASE_DETAIL} element={<CaseDetailPage />} />
          <Route path={AGENT_ROUTES.APPOINTMENTS} element={<AgentAppointmentsPage />} />
          <Route path={AGENT_ROUTES.CLIENTS} element={<AgentClientsPage />} />
          <Route path={AGENT_ROUTES.CLIENT_DETAIL} element={<AgentClientDetailPage />} />
          <Route path={AGENT_ROUTES.MESSAGES} element={<AgentMessagesPage />} />
          <Route path={AGENT_ROUTES.ALERTS} element={<AgentAlertsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path={ADMIN_ROUTES.DASHBOARD}
          element={
            <PrivateRoute requiredRole="admin">
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path={ADMIN_ROUTES.USERS} element={<UserManagementPage />} />
          <Route path={ADMIN_ROUTES.USER_DETAIL} element={<UserDetailPage />} />
          <Route path={ADMIN_ROUTES.AGENTS} element={<AgentManagementPage />} />
          <Route path={ADMIN_ROUTES.AGENT_DETAIL} element={<AgentDetailPage />} />
          <Route path={ADMIN_ROUTES.SERVICES} element={<ServiceCatalogPage />} />
          <Route path={ADMIN_ROUTES.SERVICE_DETAIL} element={<AdminServiceDetailPage />} />
          <Route path={ADMIN_ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ADMIN_ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>

        {/* Redirect to appropriate dashboard or homepage */}
        <Route path="/" element={<Navigate to={getHomepageRedirect()} replace />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
