import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Eye,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { AGENT_ROUTES } from '../../constants/routes';
import axios from '../../lib/axios';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [travelBookings, setTravelBookings] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currencyExchanges, setCurrencyExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const [applicationsResponse, paymentsResponse, bookingsResponse, appointmentsResponse, exchangesResponse] = await Promise.all([
        axios.get('/travel/api/visa-applications/'),
        axios.get('/travel/api/payments/'),
        axios.get('/travel/api/travel-bookings/'),
        axios.get('/travel/api/appointments/'),
        axios.get('/travel/api/currency-exchanges/')
      ]);
      setApplications(applicationsResponse.data);
      setPayments(paymentsResponse.data);
      setTravelBookings(bookingsResponse.data);
      setAppointments(appointmentsResponse.data);
      setCurrencyExchanges(exchangesResponse.data);

      // Debug: log payments data
      console.log('Payments data:', paymentsResponse.data);
      console.log('Pending payments:', paymentsResponse.data.filter(p => p.status === 'processing'));
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.visa_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.country_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const completedPayments = payments.filter(p => p.status === 'completed');

  // Get bookings that need appointments (confirmed bookings without appointments)
  const getBookingsNeedingAppointments = () => {
    return travelBookings.filter(booking => {
      // Only confirmed bookings
      if (booking.statut !== 'confirmed') return false;

      // Check if booking has any appointment
      const hasAppointment = appointments.some(appointment =>
        appointment.travel_booking === booking.id
      );

      return !hasAppointment;
    });
  };

  const bookingsNeedingAppointments = getBookingsNeedingAppointments();

  const handleApprovePayment = async (paymentId) => {
    try {
      await axios.post(`/travel/api/payments/${paymentId}/approve_payment/`);
      alert('Paiement approuvé avec succès');
      window.location.reload(); // Reload page
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Erreur lors de l\'approbation du paiement');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt('Motif du rejet:');
    if (!reason) return;

    try {
      await axios.post(`/travel/api/payments/${paymentId}/reject_payment/`, { reason });
      alert('Paiement rejeté');
      window.location.reload(); // Reload page
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Erreur lors du rejet du paiement');
    }
  };

  const handleCreateAppointment = async (bookingId) => {
    // Redirect to appointments page with booking pre-selected
    window.location.href = `${AGENT_ROUTES.APPOINTMENTS}?booking=${bookingId}`;
  };


  const alerts = [
    { id: 1, type: 'Document', message: 'Passeport de Jean Dupont expire dans 30 jours', priority: 'high', date: '2025-09-16' },
    { id: 2, type: 'Dossier', message: 'Délai de traitement du dossier de Marie Martin dépassé', priority: 'medium', date: '2025-09-15' },
    { id: 3, type: 'Rendez-vous', message: 'Pierre Dubois n\'a pas confirmé son rendez-vous du 27/09', priority: 'low', date: '2025-09-14' },
  ];

  const messages = [
    { id: 1, from: 'Jean Dupont', subject: 'Question sur les documents à fournir', date: '2025-09-16', read: false },
    { id: 2, from: 'Marie Martin', subject: 'Confirmation de réception des documents', date: '2025-09-15', read: true },
  ];

  // Helper function to get status badge variant
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'en cours':
        return 'secondary';
      case 'documents validés':
      case 'validé':
      case 'confirmé':
        return 'success';
      case 'refusé':
        return 'destructive';
      case 'en attente':
      case 'en attente de documents':
      case 'entretien programmé':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Helper function to get priority badge variant
  const getPriorityVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Helper function to get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Bell className="h-4 w-4" />;
      case 'low':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-1 md:p-0">
      {/* Welcome Section */}
      <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Bienvenue, {user?.first_name || 'Agent'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Voici un aperçu des dossiers et activités à traiter aujourd'hui
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher un client..."
                className="pl-10 pr-4 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to={AGENT_ROUTES.APPLICATIONS}>
              <Button className="gap-2">
                Tous les dossiers
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Link to={AGENT_ROUTES.PAYMENTS_MANAGEMENT}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Valider Paiements</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approuver les paiements clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={AGENT_ROUTES.BOOKINGS_MANAGEMENT}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Gérer Réservations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Valider les réservations payées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={AGENT_ROUTES.APPLICATIONS}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Demandes Visa</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Traiter les demandes de visa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={AGENT_ROUTES.CLIENTS}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Clients</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gérer la base clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={AGENT_ROUTES.CURRENCY_EXCHANGES}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Échanges de devise</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gérer les demandes d'échange</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Paiements effectués
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{completedPayments.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Dossiers actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {applications.filter(a => ['submitted', 'under_review', 'additional_info_required'].includes(a.status)).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Rendez-vous aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{appointments.filter(a => a.date === '2025-09-17').length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Messages non lus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{messages.filter(m => !m.read).length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Échanges en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <svg className="mr-2 h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-2xl font-bold">
                {currencyExchanges.filter(e => ['pending', 'processing'].includes(e.status)).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Cases */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Dossiers récents</CardTitle>
              <CardDescription>Les derniers dossiers mis à jour</CardDescription>
            </div>
            <Link to={AGENT_ROUTES.APPLICATIONS}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Destination</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Documents</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Créé le</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.slice(0, 5).map((application) => (
                      <tr key={application.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{application.applicant_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{application.visa_type_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{application.country_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={getStatusVariant(application.status)}>
                            {application.get_status_display}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {application.documents_completed}/{application.total_documents}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(application.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`applications/${application.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="h-4 w-4" />
                              Voir
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredApplications.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune demande trouvée
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookings Needing Appointments */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Réservations nécessitant un rendez-vous</CardTitle>
              <CardDescription>Réservations validées qui n'ont pas encore de rendez-vous programmé</CardDescription>
            </div>
            <Link to={AGENT_ROUTES.BOOKINGS_MANAGEMENT}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir réservations
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {bookingsNeedingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Toutes les réservations ont un rendez-vous</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Aucune réservation validée sans rendez-vous programmé
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingsNeedingAppointments.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Réservation #{booking.id}
                            </span>
                            <Badge variant="success" className="text-xs">
                              Confirmée
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {booking.user?.prenom} {booking.user?.nom} • {booking.destination}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Créée le {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.ville_depart} → {booking.ville_arrivee}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.nombre_passagers} passager{booking.nombre_passagers > 1 ? 's' : ''}
                          </div>
                        </div>

                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCreateAppointment(booking.id)}
                          className="bg-blue-600 hover:bg-blue-700 gap-1 shadow-sm"
                        >
                          <Calendar className="h-4 w-4" />
                          Créer RDV
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {bookingsNeedingAppointments.length > 3 && (
                  <div className="text-center pt-4">
                    <Link to={AGENT_ROUTES.BOOKINGS_MANAGEMENT}>
                      <Button variant="outline" className="gap-2">
                        Voir toutes les réservations ({bookingsNeedingAppointments.length})
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Currency Exchanges */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Échanges de devise en attente</CardTitle>
              <CardDescription>Demandes d'échange nécessitant votre validation ou traitement</CardDescription>
            </div>
            <Link to={AGENT_ROUTES.CURRENCY_EXCHANGES}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {currencyExchanges.filter(e => ['pending', 'processing'].includes(e.status)).length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun échange en attente</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Les nouvelles demandes apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currencyExchanges.filter(e => ['pending', 'processing'].includes(e.status)).slice(0, 3).map((exchange) => (
                  <div
                    key={exchange.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                              {exchange.reference}
                            </span>
                            <Badge variant={exchange.status === 'pending' ? 'warning' : 'info'}>
                              {exchange.status === 'pending' ? 'En attente' : 'En cours'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {exchange.user_name} • {new Date(exchange.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {exchange.amount_sent} {exchange.from_currency}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            → {exchange.amount_received} {exchange.to_currency}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {exchange.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 gap-1 shadow-sm"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approuver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-1"
                              >
                                <XCircle className="h-4 w-4" />
                                Rejeter
                              </Button>
                            </>
                          )}
                          {exchange.status === 'processing' && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 gap-1 shadow-sm"
                            >
                              Terminer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {currencyExchanges.filter(e => ['pending', 'processing'].includes(e.status)).length > 3 && (
                  <div className="text-center pt-4">
                    <Link to={AGENT_ROUTES.CURRENCY_EXCHANGES}>
                      <Button variant="outline" className="gap-2">
                        Voir tous les échanges ({currencyExchanges.filter(e => ['pending', 'processing'].includes(e.status)).length})
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Paiements en attente de validation</CardTitle>
              <CardDescription>Paiements soumis par les clients nécessitant votre approbation</CardDescription>
            </div>
            <Link to={AGENT_ROUTES.PAYMENTS_MANAGEMENT}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun paiement en attente</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Les nouveaux paiements apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.slice(0, 3).map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                              {payment.reference}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {payment.payment_type === 'travel_booking' ? 'Réservation vol' :
                               payment.payment_type === 'visa_application' ? 'Demande visa' : payment.payment_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {payment.user_name} • {new Date(payment.initiated_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {payment.amount} {payment.currency}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(payment.initiated_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprovePayment(payment.id)}
                            className="bg-green-600 hover:bg-green-700 gap-1 shadow-sm"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectPayment(payment.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-1"
                          >
                            <XCircle className="h-4 w-4" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingPayments.length > 3 && (
                  <div className="text-center pt-4">
                    <Link to={AGENT_ROUTES.PAYMENTS_MANAGEMENT}>
                      <Button variant="outline" className="gap-2">
                        Voir tous les paiements ({pendingPayments.length})
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Rendez-vous à venir</CardTitle>
              <CardDescription>Vos prochains rendez-vous avec les clients</CardDescription>
            </div>
            <Link to={AGENT_ROUTES.APPOINTMENTS}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{appointment.title}</h3>
                      <Badge variant={getStatusVariant(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Client: {appointment.client}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Alertes</CardTitle>
              <CardDescription>Notifications importantes nécessitant votre attention</CardDescription>
            </div>
            <Link to={AGENT_ROUTES.ALERTS}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityVariant(alert.priority)} className="gap-1">
                        {getPriorityIcon(alert.priority)}
                        {alert.priority === 'high' ? 'Urgent' : alert.priority === 'medium' ? 'Important' : 'Information'}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(alert.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{alert.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Type: {alert.type}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Traiter
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Messages récents</CardTitle>
            <CardDescription>Communications avec vos clients</CardDescription>
          </div>
          <Link to={AGENT_ROUTES.MESSAGES}>
            <Button variant="ghost" size="sm" className="gap-1">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{message.subject}</h3>
                    {!message.read && (
                      <Badge variant="secondary">Nouveau</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    De: {message.from}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {new Date(message.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Répondre
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;