import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { PUBLIC_ROUTES, CLIENT_ROUTES, AGENT_ROUTES, ADMIN_ROUTES, ERROR_ROUTES } from './constants/routes';

// Layouts
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const AgentLayout = lazy(() => import('./components/layout/AgentLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));

// Auth Components
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));
const RoleGuard = lazy(() => import('./components/auth/RoleGuard'));

// Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/Auth/Login'));
const RegisterPage = lazy(() => import('./pages/Auth/Register'));
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPassword'));
const ServicesPage = lazy(() => import('./pages/Services'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetail'));
const AboutPage = lazy(() => import('./pages/About'));
const ContactPage = lazy(() => import('./pages/Contact'));
const ImmigrationAssistantPage = lazy(() => import('./pages/ImmigrationAssistant'));
const TravelBookingStepper = lazy(() => import('./pages/TravelBookingStepper'));
const DestinationSelectionPage = lazy(() => import('./pages/DestinationSelection'));

// Client Pages
const UserDashboardPage = lazy(() => import('./pages/User/Dashboard'));
const UserAppointmentsPage = lazy(() => import('./pages/User/Appointments'));
const MyBookingsPage = lazy(() => import('./pages/MyBookings'));
const BookingDetailsPage = lazy(() => import('./pages/BookingDetails'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const CurrencyExchangePage = lazy(() => import('./pages/CurrencyExchange'));
const ClientCurrencyExchangesPage = lazy(() => import('./pages/CurrencyExchanges'));
import ExchangeHistory from './components/currency/ExchangeHistory';
import ExchangeDetails from './components/currency/ExchangeDetails';
import ExchangeManagement from './components/agent/ExchangeManagement';

// Agent Pages
const AgentDashboard = lazy(() => import('./pages/Agent/Dashboard'));
const AgentApplications = lazy(() => import('./pages/Agent/Applications'));
const AgentApplicationDetail = lazy(() => import('./pages/Agent/ApplicationDetail'));
const AgentClients = lazy(() => import('./pages/Agent/Clients'));
const PaymentsManagement = lazy(() => import('./pages/Agent/PaymentsManagement'));
const BookingsManagement = lazy(() => import('./pages/Agent/BookingsManagement'));
const CurrencyExchangesPage = lazy(() => import('./pages/Agent/CurrencyExchanges'));
const UserProfilePage = lazy(() => import('./pages/User/Profile'));
const MyApplicationsPage = lazy(() => import('./pages/User/MyApplications'));
// Commenting out non-existent imports for now
// const ApplicationDetailPage = lazy(() => import('./pages/User/ApplicationDetail'));
const VisaApplicationPage = lazy(() => import('./pages/VisaApplication'));
const DuplicateVisaApplication = lazy(() => import('./pages/DuplicateVisaApplication'));
// const MyBookingsPage = lazy(() => import('./pages/User/MyBookings'));
// const MyAppointmentsPage = lazy(() => import('./pages/User/MyAppointments'));
// const DocumentsHubPage = lazy(() => import('./pages/User/DocumentsHub'));
// const MessagesPage = lazy(() => import('./pages/MessagesPage'));
// const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
// const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

// Agent Pages
// Commenting out Agent pages as they might not exist yet
// const AgentDashboardPage = lazy(() => import('./pages/Agent/AgentDashboard'));
// const ApplicationsManagementPage = lazy(() => import('./pages/Agent/ApplicationsManagement'));
// const CaseDetailPage = lazy(() => import('./pages/Agent/CaseDetail'));
const AgentAppointmentsPage = lazy(() => import('./pages/Agent/Appointments'));
// const AgentClientsPage = lazy(() => import('./pages/Agent/AgentClients'));
// const AgentClientDetailPage = lazy(() => import('./pages/Agent/AgentClientDetail'));
// const AgentMessagesPage = lazy(() => import('./pages/Agent/AgentMessages'));
// const AgentAlertsPage = lazy(() => import('./pages/Agent/AgentAlerts'));

// Admin Pages
// Commenting out Admin pages as they might not exist yet
// const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboard'));
const ExchangeRatesPage = lazy(() => import('./pages/Admin/ExchangeRates'));
// const UserManagementPage = lazy(() => import('./pages/Admin/UserManagement'));
// const UserDetailPage = lazy(() => import('./pages/Admin/UserDetail'));
// const AgentManagementPage = lazy(() => import('./pages/Admin/AgentManagement'));
// const AgentDetailPage = lazy(() => import('./pages/Admin/AgentDetail'));
// const ServiceCatalogPage = lazy(() => import('./pages/Admin/ServiceCatalog'));
// const AdminServiceDetailPage = lazy(() => import('./pages/Admin/ServiceDetail'));
// const ReportsPage = lazy(() => import('./pages/Admin/Reports'));
// const SettingsPage = lazy(() => import('./pages/Admin/Settings'));

// Error Pages
const UnauthorizedPage = lazy(() => import('./pages/Unauthorized'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const { initialized } = useAuth();

  // Show loading state while auth is initializing
  if (!initialized) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path={PUBLIC_ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={PUBLIC_ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={PUBLIC_ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={`${PUBLIC_ROUTES.RESET_PASSWORD}/:uidb64/:token`} element={<ResetPasswordPage />} />
            <Route path={PUBLIC_ROUTES.SERVICES} element={<ServicesPage />} />
            <Route path={PUBLIC_ROUTES.SERVICE_DETAIL} element={<ServiceDetailPage />} />
            <Route path={PUBLIC_ROUTES.ABOUT} element={<AboutPage />} />
            <Route path={PUBLIC_ROUTES.CONTACT} element={<ContactPage />} />
            <Route path={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT} element={<ImmigrationAssistantPage />} />
            <Route path="/book" element={<TravelBookingStepper />} />
          </Route>

          {/* Client Routes - Only accessible by clients */}
          <Route element={
            <ProtectedRoute allowedRoles={['client']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path={CLIENT_ROUTES.DASHBOARD} element={<UserDashboardPage />} />
            <Route path={CLIENT_ROUTES.APPOINTMENTS} element={<UserAppointmentsPage />} />
            <Route path={CLIENT_ROUTES.PROFILE} element={<UserProfilePage />} />
            <Route path={CLIENT_ROUTES.APPLICATIONS} element={<MyApplicationsPage />} />
            <Route path={CLIENT_ROUTES.VISA_APPLICATIONS_NEW} element={<VisaApplicationPage />} />
            <Route path={CLIENT_ROUTES.VISA_APPLICATION_DETAIL} element={<VisaApplicationPage />} />
            <Route path={CLIENT_ROUTES.VISA_APPLICATION_DUPLICATE} element={<DuplicateVisaApplication />} />
            <Route path={CLIENT_ROUTES.BOOKINGS} element={<MyBookingsPage />} />
            <Route path="/booking/:id" element={<BookingDetailsPage />} />
            <Route path="/payment/:bookingId" element={<PaymentPage />} />
            <Route path={CLIENT_ROUTES.PAYMENTS} element={<PaymentsPage />} />
            <Route path="/destinations" element={<DestinationSelectionPage />} />
            <Route path="/currency-exchanges" element={<ClientCurrencyExchangesPage />} />
            <Route path="currency-exchange" element={<CurrencyExchangePage />} />
            <Route path="exchange/history" element={<ExchangeHistory />} />
            <Route path="exchange/requests/:id" element={<ExchangeDetails />} />
            {/* Commenting out routes for non-existent components
            <Route path={CLIENT_ROUTES.BOOKINGS} element={<MyBookingsPage />} />
            <Route path={CLIENT_ROUTES.APPOINTMENTS} element={<MyAppointmentsPage />} />
            <Route path={CLIENT_ROUTES.DOCUMENTS} element={<DocumentsHubPage />} />
            <Route path={CLIENT_ROUTES.MESSAGES} element={<MessagesPage />} />
            <Route path={CLIENT_ROUTES.PAYMENTS} element={<PaymentsPage />} />
            <Route path={CLIENT_ROUTES.CHECKOUT} element={<CheckoutPage />} />
            */}
          </Route>

          {/* Agent Routes - Only accessible by agents */}
          <Route element={
            <ProtectedRoute allowedRoles={['agent']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AgentDashboard />} />
            <Route path={AGENT_ROUTES.DASHBOARD} element={<AgentDashboard />} />
            <Route path={AGENT_ROUTES.APPLICATIONS} element={<AgentApplications />} />
            <Route path={AGENT_ROUTES.APPLICATION_DETAIL} element={<AgentApplicationDetail />} />
            <Route path={AGENT_ROUTES.CLIENTS} element={<AgentClients />} />
            <Route path={AGENT_ROUTES.PAYMENTS_MANAGEMENT} element={<PaymentsManagement />} />
            <Route path={AGENT_ROUTES.BOOKINGS_MANAGEMENT} element={<BookingsManagement />} />
            <Route path={AGENT_ROUTES.CURRENCY_EXCHANGES} element={<CurrencyExchangesPage />} />
            {/* Uncomment and implement other agent routes as needed
            <Route path={AGENT_ROUTES.CASE_DETAIL} element={<CaseDetailPage />} />
            */}
            <Route path={AGENT_ROUTES.APPOINTMENTS} element={<AgentAppointmentsPage />} />
            {/* Uncomment other routes as needed
            <Route path={AGENT_ROUTES.CLIENT_DETAIL} element={<AgentClientDetailPage />} />
            <Route path={AGENT_ROUTES.MESSAGES} element={<AgentMessagesPage />} />
            <Route path={AGENT_ROUTES.ALERTS} element={<AgentAlertsPage />} />
            */}
          </Route>

          {/* Admin Routes - Only accessible by admins */}
          <Route element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path={ADMIN_ROUTES.EXCHANGE_RATES} element={<ExchangeRatesPage />} />
            {/* Uncomment other admin routes as needed
            <Route path={ADMIN_ROUTES.DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ADMIN_ROUTES.USERS} element={<UserManagementPage />} />
            <Route path={ADMIN_ROUTES.USER_DETAIL} element={<UserDetailPage />} />
            <Route path={ADMIN_ROUTES.AGENTS} element={<AgentManagementPage />} />
            <Route path={ADMIN_ROUTES.AGENT_DETAIL} element={<AgentDetailPage />} />
            <Route path={ADMIN_ROUTES.SERVICES} element={<ServiceCatalogPage />} />
            <Route path={ADMIN_ROUTES.SERVICE_DETAIL} element={<AdminServiceDetailPage />} />
            <Route path={ADMIN_ROUTES.REPORTS} element={<ReportsPage />} />
            <Route path={ADMIN_ROUTES.SETTINGS} element={<SettingsPage />} />
            */}
          </Route>

          {/* Error Pages */}
          <Route path={ERROR_ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

// Wrap the App with necessary providers
const AppWithProviders = () => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default AppWithProviders;
