import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  User,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { AGENT_ROUTES } from '../../constants/routes';
import axios from '../../lib/axios';

const ApplicationsManagement = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [success, setSuccess] = useState(null);

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
        return { variant: 'default', icon: AlertTriangle, label: status };
    }
  };

  // Filter applications based on search and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.visa_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleStatusChange = async (applicationId, newStatus, notes = '') => {
    try {
      setUpdatingStatus(applicationId);
      setError(null);

      await axios.post(`/travel/api/visa-applications/${applicationId}/change_status/`, {
        status: newStatus,
        notes: notes
      });

      setSuccess('Statut mis à jour avec succès');
      setTimeout(() => setSuccess(null), 3000);

      // Reload applications to get updated data
      await loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.error || 'Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(null);
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

  const availableStatusChanges = (currentStatus) => {
    const transitions = {
      'submitted': ['under_review', 'additional_info_required'],
      'under_review': ['approved', 'rejected', 'additional_info_required', 'document_verification'],
      'additional_info_required': ['under_review'],
      'document_verification': ['approved', 'rejected', 'biometrics_required'],
      'biometrics_required': ['approved', 'rejected', 'interview_required'],
      'interview_required': ['approved', 'rejected'],
      'approved': ['embassy_submitted'],
      'embassy_submitted': ['visa_processing'],
      'visa_processing': ['visa_printed'],
      'visa_printed': ['ready_for_pickup'],
      'ready_for_pickup': ['delivered'],
      'delivered': ['completed'],
    };

    return transitions[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des demandes...</p>
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
            Gestion des demandes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez toutes les demandes de visa soumises par les clients
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <div>{error}</div>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <div>{success}</div>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par client, pays, type de visa ou numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="all">Tous les statuts</option>
                {statusOptions.slice(1).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
              Liste de toutes les demandes de visa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Demande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type de visa</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de soumission</TableHead>
                    <TableHead>Temps de traitement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => {
                    const statusInfo = getStatusInfo(application.status);
                    const StatusIcon = statusInfo.icon;
                    const availableChanges = availableStatusChanges(application.status);

                    return (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.application_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            {application.applicant_name || 'N/A'}
                          </div>
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
                          {application.submitted_at
                            ? new Date(application.submitted_at).toLocaleDateString('fr-FR')
                            : new Date(application.created_at).toLocaleDateString('fr-FR')
                          }
                        </TableCell>
                        <TableCell>
                          {getProcessingTime(application.created_at, application.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link to={`/agent/cases/${application.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {availableChanges.length > 0 && (
                              <div className="flex gap-1">
                                {availableChanges.slice(0, 2).map(status => (
                                  <Button
                                    key={status}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange(application.id, status)}
                                    disabled={updatingStatus === application.id}
                                    className="text-xs"
                                  >
                                    {status.replace('_', ' ')}
                                  </Button>
                                ))}
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
                ? 'Il n\'y a pas encore de demandes de visa.'
                : 'Aucune demande ne correspond à vos critères de recherche.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {applications.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
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
                En attente d'examen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter(a => a.status === 'submitted').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                En cours d'examen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(a => ['under_review', 'document_verification', 'biometrics_required', 'interview_required'].includes(a.status)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Terminées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(a => ['approved', 'rejected', 'completed'].includes(a.status)).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManagement;