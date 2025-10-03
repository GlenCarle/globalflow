import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlaneTakeoff,
  Calendar,
  FileCheck,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Clock,
  AlertTriangle,
  Plus,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import {PUBLIC_ROUTES, CLIENT_ROUTES} from '../../constants/routes';
import axios from '../../lib/axios';

const UserDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currencyExchanges, setCurrencyExchanges] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [applicationsResponse, appointmentsResponse, exchangesResponse, ratesResponse] = await Promise.all([
        axios.get('/travel/api/visa-applications/'),
        axios.get('/travel/api/appointments/'),
        axios.get('/travel/api/currency-exchanges/'),
        axios.get('/travel/api/exchange-rates/current_rates/')
      ]);
      setApplications(applicationsResponse.data);
      setAppointments(appointmentsResponse.data);
      setCurrencyExchanges(exchangesResponse.data);
      setExchangeRates(ratesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };


  const documents = [
    { id: 1, name: 'Passeport', status: 'Valide', expiration: '2028-05-12' },
    { id: 2, name: 'Relevé bancaire', status: 'En attente de validation', expiration: null },
    { id: 3, name: 'Certificat de naissance', status: 'Validé', expiration: null },
  ];

  const messages = [
    { id: 1, from: 'Agent GSC', subject: 'Mise à jour de votre dossier', date: '2025-09-16', read: false },
  ];

  // Helper function to get status badge variant
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'en cours':
        return 'secondary';
      case 'approuvé':
      case 'validé':
      case 'valide':
      case 'confirmé':
      case 'read':
        return 'success';
      case 'refusé':
      case 'canceled':
        return 'destructive';
      case 'en attente de validation':
      case 'unread':
        return 'warning';
      case 'postponed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 p-1 md:p-0">
      {/* Welcome Section */}
      <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Bienvenue, {user?.first_name || 'Client'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Voici un aperçu de vos dossiers et activités
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={CLIENT_ROUTES.APPLICATIONS}>
              <Button variant="outline" className="gap-2">
                Mes demandes
                <FileText className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={CLIENT_ROUTES.VISA_APPLICATIONS_NEW}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle demande de visa
              </Button>
            </Link>
            <Link to="/currency-exchange">
              <Button variant="outline" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Échanger de la devise
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Demandes en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {applications.filter(a => ['draft', 'submitted', 'under_review', 'additional_info_required'].includes(a.status)).length}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Rendez-vous non lus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{appointments.filter(a => a.status === 'unread').length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Documents à fournir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{documents.filter(d => d.status === 'En attente de validation').length}</span>
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
              Échanges de devise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {currencyExchanges.filter(e => ['pending', 'processing'].includes(e.status)).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Mes demandes</CardTitle>
              <CardDescription>Suivi de vos demandes de visa et d'immigration</CardDescription>
            </div>
            <Link to={CLIENT_ROUTES.APPLICATIONS}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 3).map((application) => (
                  <div key={application.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{application.visa_type_name}</h3>
                        <Badge variant={getStatusVariant(application.status)}>
                          {application.get_status_display}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Destination: {application.country_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Créé le: {new Date(application.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Documents: {application.documents_completed}/{application.total_documents} validés
                      </p>
                    </div>
                    <Link to={`/dashboard/visa-applications/${application.id}`}>
                      <Button variant="ghost" size="sm">
                        Modifier
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileText className="mb-2 h-10 w-10 text-gray-400" />
                <h3 className="mb-1 font-medium">Aucune demande</h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Vous n'avez pas encore de demande en cours
                </p>
                <Link to={CLIENT_ROUTES.VISA_APPLICATIONS_NEW}>
                  <Button>Créer une demande de visa</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Rendez-vous</CardTitle>
              <CardDescription>Vos prochains rendez-vous avec nos agents</CardDescription>
            </div>
            <Link to={CLIENT_ROUTES.APPOINTMENTS}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{appointment.reason_display}</h3>
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {appointment.status_display}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {appointment.date_formatted}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Lieu: {appointment.location_display}
                      </p>
                      {appointment.message && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm">
                          <p className="text-blue-800 dark:text-blue-200">
                            {appointment.message}
                          </p>
                        </div>
                      )}
                      {appointment.required_documents && appointment.required_documents.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Documents requis:</p>
                          <div className="flex flex-wrap gap-1">
                            {appointment.required_documents.map((doc, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {appointment.status === 'unread' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await axios.post(`/travel/api/appointments/${appointment.id}/mark_as_read/`);
                              loadData(); // Reload data
                            } catch (error) {
                              console.error('Error marking as read:', error);
                            }
                          }}
                        >
                          Marquer lu
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Calendar className="mb-2 h-10 w-10 text-gray-400" />
                <h3 className="mb-1 font-medium">Aucun rendez-vous</h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Vous n'avez pas de rendez-vous à venir
                </p>
                <Button variant="outline">Contacter un agent</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Vos documents importants</CardDescription>
            </div>
            <Link to={CLIENT_ROUTES.DOCUMENTS}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{document.name}</h3>
                        <Badge variant={getStatusVariant(document.status)}>
                          {document.status}
                        </Badge>
                      </div>
                      {document.expiration && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          Expire le: {new Date(document.expiration).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      Voir
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileCheck className="mb-2 h-10 w-10 text-gray-400" />
                <h3 className="mb-1 font-medium">Aucun document</h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Vous n'avez pas encore téléchargé de documents
                </p>
                <Button>Ajouter un document</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Communications avec nos agents</CardDescription>
            </div>
            <Link to={CLIENT_ROUTES.MESSAGES}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {messages.length > 0 ? (
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
                      Lire
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <MessageSquare className="mb-2 h-10 w-10 text-gray-400" />
                <h3 className="mb-1 font-medium">Aucun message</h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Vous n'avez pas de messages
                </p>
                <Button>Contacter un agent</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currency Exchange Rates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Taux de change actuels</CardTitle>
              <CardDescription>Taux de référence pour vos échanges</CardDescription>
            </div>
            <Link to="/currency-exchange">
              <Button variant="ghost" size="sm" className="gap-1">
                Échanger
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : exchangeRates.length > 0 ? (
              <div className="space-y-3">
                {exchangeRates.slice(0, 4).map((rate) => (
                  <div key={`${rate.from_currency}-${rate.to_currency}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {rate.from_currency} → {rate.to_currency}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{Number(rate.rate).toFixed(4)}</div>
                      <div className="text-xs text-gray-500">
                        Mis à jour: {new Date(rate.updated_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Aucun taux de change disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currency Exchanges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Échanges de devise</CardTitle>
              <CardDescription>Vos demandes d'échange de monnaie</CardDescription>
            </div>
            <Link to="/currency-exchanges">
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {currencyExchanges.length > 0 ? (
              <div className="space-y-4">
                {currencyExchanges.slice(0, 3).map((exchange) => (
                  <div key={exchange.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{exchange.reference}</h3>
                        <Badge variant={getStatusVariant(exchange.status)}>
                          {exchange.status_display}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exchange.amount_sent} {exchange.from_currency} → {exchange.amount_received} {exchange.to_currency}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Créé le: {new Date(exchange.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {exchange.status === 'completed' && exchange.receipt_pdf && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(exchange.receipt_pdf, '_blank')}
                      >
                        Reçu PDF
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <DollarSign className="mb-2 h-10 w-10 text-gray-400" />
                <h3 className="mb-1 font-medium">Aucun échange</h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Vous n'avez pas encore d'échange de devise
                </p>
                <Link to="/currency-exchange">
                  <Button>Échanger de la devise</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            <CardTitle>Alertes importantes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Badge variant="warning">Expiration</Badge>
                <p className="font-medium">Votre passeport expire dans 6 mois</p>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Pensez à renouveler votre passeport avant votre prochain voyage.
              </p>
            </div>
            <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Badge variant="info">Information</Badge>
                <p className="font-medium">Document manquant pour votre dossier</p>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Veuillez télécharger votre attestation d'hébergement pour compléter votre dossier.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Télécharger
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;