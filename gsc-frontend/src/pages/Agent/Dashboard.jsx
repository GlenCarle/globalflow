import React from 'react';
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
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../constants/routes';

const AgentDashboard = () => {
  const { user } = useAuth();

  // Mock data for dashboard
  const cases = [
    { id: 1, client: 'Jean Dupont', type: 'Visa Étudiant', destination: 'Canada', status: 'En cours', lastUpdate: '2025-09-16' },
    { id: 2, client: 'Marie Martin', type: 'Visa Tourisme', destination: 'France', status: 'En attente de documents', lastUpdate: '2025-09-15' },
    { id: 3, client: 'Pierre Dubois', type: 'Visa Travail', destination: 'États-Unis', status: 'Documents validés', lastUpdate: '2025-09-14' },
    { id: 4, client: 'Sophie Lefebvre', type: 'Résidence Permanente', destination: 'Canada', status: 'Entretien programmé', lastUpdate: '2025-09-13' },
  ];

  const appointments = [
    { id: 1, client: 'Jean Dupont', title: 'Consultation visa', date: '2025-09-25', time: '10:00', status: 'Confirmé' },
    { id: 2, client: 'Sophie Lefebvre', title: 'Entretien préliminaire', date: '2025-09-26', time: '14:30', status: 'Confirmé' },
    { id: 3, client: 'Pierre Dubois', title: 'Vérification documents', date: '2025-09-27', time: '11:15', status: 'En attente' },
  ];

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
              />
            </div>
            <Link to={ROUTES.AGENT_ROUTES.CASES}>
              <Button className="gap-2">
                Tous les dossiers
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Dossiers actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{cases.length}</span>
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
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{alerts.length}</span>
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
            <Link to={ROUTES.AGENT_ROUTES.CASES}>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Destination</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Dernière mise à jour</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((caseItem) => (
                    <tr key={caseItem.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{caseItem.client}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{caseItem.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{caseItem.destination}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={getStatusVariant(caseItem.status)}>
                          {caseItem.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(caseItem.lastUpdate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`${ROUTES.AGENT_ROUTES.CASES}/${caseItem.id}`}>
                          <Button variant="ghost" size="sm">
                            Détails
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Rendez-vous à venir</CardTitle>
              <CardDescription>Vos prochains rendez-vous avec les clients</CardDescription>
            </div>
            <Link to={ROUTES.AGENT_ROUTES.APPOINTMENTS}>
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
            <Link to={ROUTES.AGENT_ROUTES.ALERTS}>
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
          <Link to={ROUTES.AGENT_ROUTES.MESSAGES}>
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