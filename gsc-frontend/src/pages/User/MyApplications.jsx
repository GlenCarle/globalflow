import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useAuth } from '../../contexts/AuthContext';
import { CLIENT_ROUTES } from '../../constants/routes';
import axios from '../../lib/axios';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/travel/api/visa-applications/');
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status badge variant and icon
  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return { variant: 'secondary', icon: FileText, label: 'Brouillon' };
      case 'submitted':
        return { variant: 'warning', icon: Clock, label: 'Soumise' };
      case 'under_review':
        return { variant: 'info', icon: Clock, label: 'En examen' };
      case 'approved':
        return { variant: 'success', icon: CheckCircle, label: 'Approuvée' };
      case 'rejected':
        return { variant: 'destructive', icon: XCircle, label: 'Rejetée' };
      case 'completed':
        return { variant: 'success', icon: CheckCircle, label: 'Terminée' };
      default:
        return { variant: 'default', icon: AlertCircle, label: status };
    }
  };

  // Helper function to render completeness status
  const renderCompleteness = (application) => {
    const percentage = application.completeness_percentage || 0;
    const isComplete = application.is_complete;
    const missingDocs = application.missing_documents || [];

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isComplete
                  ? 'bg-green-500'
                  : percentage > 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {percentage}%
          </span>
        </div>
        {!isComplete && missingDocs.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {missingDocs.filter(doc => doc.is_mandatory).length} documents obligatoires manquants
          </div>
        )}
        {isComplete && (
          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            Complet
          </div>
        )}
      </div>
    );
  };

  // Filter applications based on search and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.visa_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.country_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.application_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate processing time
  const getProcessingTime = (createdAt, status) => {
    if (status === 'completed' || status === 'approved' || status === 'rejected') {
      return 'Terminé';
    }

    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return '1 jour';
    } else {
      return `${diffDays} jours`;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'submitted', label: 'Soumise' },
    { value: 'under_review', label: 'En examen' },
    { value: 'approved', label: 'Approuvée' },
    { value: 'rejected', label: 'Rejetée' },
    { value: 'completed', label: 'Terminée' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement de vos demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Mes demandes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Suivez l'état de vos demandes de visa et d'immigration
          </p>
        </div>
        <Link to="/dashboard/visa-applications/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle demande de visa
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par pays, type de visa ou numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  {statusOptions.find(opt => opt.value === statusFilter)?.label || 'Tous les statuts'}
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      {filteredApplications.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Demandes ({filteredApplications.length})</CardTitle>
            <CardDescription>
              Liste de toutes vos demandes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Demande</TableHead>
                    <TableHead>Type de visa</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Complétude</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead>Temps de traitement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => {
                    const statusInfo = getStatusInfo(application.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.application_number || 'N/A'}
                        </TableCell>
                        <TableCell>{application.visa_type_name}</TableCell>
                        <TableCell>{application.country_name}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {renderCompleteness(application)}
                        </TableCell>
                        <TableCell>
                          {new Date(application.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {getProcessingTime(application.created_at, application.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link to={`/dashboard/visa-applications/${application.id}`}>
                              <Button variant="ghost" size="sm" title="Voir les détails">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {(application.status === 'draft' || !application.is_complete) && (
                              <Link to={`/dashboard/visa-applications/${application.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title={application.status === 'draft' ? 'Continuer la demande' : 'Compléter la demande'}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {!application.is_complete && application.status !== 'draft' && (
                              <div className="flex items-center text-yellow-600 dark:text-yellow-400" title="Documents manquants">
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              {applications.length === 0 ? 'Aucune demande' : 'Aucun résultat'}
            </h3>
            <p className="mb-6 text-center text-gray-500 dark:text-gray-400">
              {applications.length === 0
                ? 'Vous n\'avez pas encore créé de demande de visa.'
                : 'Aucune demande ne correspond à vos critères de recherche.'
              }
            </p>
            {applications.length === 0 && (
              <Link to="/dashboard/visa-applications/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre première demande
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Incomplete Applications Alert */}
      {applications.filter(a => !a.is_complete && a.status === 'draft').length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Demandes incomplètes
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {applications.filter(a => !a.is_complete && a.status === 'draft').length} de vos demandes nécessitent des documents supplémentaires pour être soumises.
                </p>
              </div>
              <Link to={`/dashboard/visa-applications/${applications.filter(a => !a.is_complete && a.status === 'draft')[0].id}`}>
                <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300">
                  Compléter maintenant
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {applications.length > 0 && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total des demandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Brouillons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {applications.filter(a => a.status === 'draft').length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {applications.filter(a => a.status === 'draft' && !a.is_complete).length} incomplets
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                En cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter(a => ['submitted', 'under_review'].includes(a.status)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Approuvées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(a => a.status === 'approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Rejetées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {applications.filter(a => a.status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyApplications;