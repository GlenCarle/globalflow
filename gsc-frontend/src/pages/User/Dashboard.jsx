import React from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import {PUBLIC_ROUTES, CLIENT_ROUTES} from '../../constants/routes';

const UserDashboard = () => {
  const { user } = useAuth();

  // Mock data for dashboard
  const applications = [
    { id: 1, type: 'Visa Étudiant', destination: 'Canada', status: 'En cours', date: '2025-10-15' },
    { id: 2, type: 'Visa Tourisme', destination: 'France', status: 'Approuvé', date: '2025-09-30' },
  ];

  const appointments = [
    { id: 1, title: 'Consultation visa', date: '2025-09-25', time: '10:00', status: 'Confirmé' },
  ];

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
        return 'success';
      case 'refusé':
        return 'destructive';
      case 'en attente de validation':
        return 'warning';
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
            <Link to={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT}>
              <Button className="gap-2">
                Nouvelle demande
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
              Demandes en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{applications.filter(a => a.status === 'En cours').length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Prochains rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{appointments.length}</span>
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
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
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
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{application.type}</h3>
                        <Badge variant={getStatusVariant(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Destination: {application.destination}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Date prévue: {new Date(application.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Link to={`${CLIENT_ROUTES.APPLICATIONS}/${application.id}`}>
                      <Button variant="ghost" size="sm">
                        Détails
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
                <Link to={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT}>
                  <Button>Créer une demande</Button>
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
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{appointment.title}</h3>
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.time}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
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
                <Button>Prendre rendez-vous</Button>
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