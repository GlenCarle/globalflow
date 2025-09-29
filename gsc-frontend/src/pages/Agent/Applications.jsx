import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Download,
  CheckCircle,
  XCircle,
  File,
  User,
  Calendar as CalendarIcon,
  Clock,
  X,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Edit,
  FileText,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from '@/lib/axios';
//import { Toaster } from "@/components/ui/toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from '../../components/ui/dropdown-menu';

// Helper function to get CSRF token
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const statuses = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'submitted', label: 'Soumis' },
  { value: 'under_review', label: 'En cours d\'examen' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Rejeté' },
  { value: 'cancelled', label: 'Annulé' },
];

// Helper function to get status badge component based on status
const getStatusBadge = (status) => {
  const variants = {
    draft: { variant: 'secondary', text: 'Brouillon' },
    submitted: { variant: 'default', text: 'Soumis' },
    under_review: { variant: 'warning', text: 'En cours' },
    approved: { variant: 'success', text: 'Approuvé' },
    rejected: { variant: 'destructive', text: 'Rejeté' },
    cancelled: { variant: 'outline', text: 'Annulé' }
  };

  const config = variants[status] || { variant: 'outline', text: status };
  return <Badge variant={config.variant}>{config.text}</Badge>;
};


const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch applications from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/travel/api/visa-applications/');

      // Debug: Log the first application to see the API response structure
      if (response.data.length > 0) {
        console.log('API Response for first application:', response.data[0]);
      }

      // Transform the data to match our UI needs
      const formattedApplications = response.data.map(app => ({
        id: app.id,
        clientName: app.applicant?.profile?.user
          ? `${app.applicant.profile.user.first_name} ${app.applicant.profile.user.last_name}`.trim()
          : 'Client inconnu',
        type: app.visa_type?.name || 'N/A',
        status: app.status || 'draft',
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        documents: Array.isArray(app.documents) ? app.documents : [],
        // Include all original data for the detail view
        ...app
      }));
      
      setApplications(formattedApplications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchApplications();
  }, []);
  
  // Handle status update
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setLoading(true);
      await axios.patch(
        `/travel/api/visa-applications/${applicationId}/`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          }
        }
      );
      // Refresh the applications list
      await fetchApplications();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle document download
  const handleDownloadDocument = async (documentId, filename) => {
    try {
      const response = await axios.get(`/travel/api/application-documents/${documentId}/download/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Erreur lors du téléchargement du document');
    }
  };
  
  // Handle application cancellation
  const handleCancelApplication = async (applicationId, reason) => {
    try {
      setLoading(true);
      await axios.post(
        `/travel/api/visa-applications/${applicationId}/cancel/`,
        { reason },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          }
        }
      );
      // Refresh the applications list
      await fetchApplications();
      setIsCancelling(false);
      setCancellationReason('');
    } catch (err) {
      console.error('Error cancelling application:', err);
      setError('Erreur lors de l\'annulation de la demande');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter applications based on search term and status
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredApplications.length / itemsPerPage);
  }, [filteredApplications, itemsPerPage]);
  
  // Get current applications for the current page
  const currentApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
            <div className="mt-2">
              <Button variant="outline" onClick={fetchApplications}>
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Demandes de visa - Vue détaillée</h1>
          <p className="text-muted-foreground">
            Consultez toutes les informations détaillées des demandes de visa, documents et statuts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Rechercher par nom, ID ou type de visa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-1/4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {currentApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {filteredApplications.length === 0 && applications.length === 0
                  ? 'Aucune demande de visa trouvée'
                  : 'Aucun résultat pour cette recherche'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Les demandes de visa avec toutes leurs informations détaillées apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Visa & Destination
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentApplications.map((app, index) => (
                    <tr key={app.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/30 dark:bg-gray-800/20'}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          #{app.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {app.clientName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {app.applicant?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {app.type}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {app.visa_type?.country?.name || app.country_name || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(app.status)}
                          {app.priority && (
                            <Badge variant="outline" className="text-xs">
                              {app.priority === 'express' ? 'Express' : app.priority === 'urgent' ? 'Urgent' : 'Normal'}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <File className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {app.documents?.length || 0} document(s)
                            </span>
                          </div>
                          {app.documents?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {app.documents.slice(0, 2).map((doc, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                                  {doc.status === 'approved' ? '✓' : doc.status === 'rejected' ? '✗' : '○'} {doc.required_document?.name?.slice(0, 15) || 'Doc'}
                                </Badge>
                              ))}
                              {app.documents.length > 2 && (
                                <Badge variant="outline" className="text-xs px-2 py-0">
                                  +{app.documents.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Créé: {app.createdAt ? format(new Date(app.createdAt), 'dd/MM/yy', { locale: fr }) : 'N/A'}
                            </span>
                          </div>
                          {app.updatedAt && app.updatedAt !== app.createdAt && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Maj: {format(new Date(app.updatedAt), 'dd/MM/yy', { locale: fr })}
                              </span>
                            </div>
                          )}
                          {app.submitted_at && (
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-xs text-green-600 dark:text-green-400">
                                Soumis
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg w-64">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigate(`/agent/applications/${app.id}`)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir les détails complets
                            </DropdownMenuItem>

                            {app.documents?.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Documents ({app.documents.length})
                                </DropdownMenuLabel>
                                <div className="max-h-32 overflow-y-auto">
                                  {app.documents.map((doc) => (
                                    <DropdownMenuItem
                                      key={doc.id}
                                      onClick={() => handleDownloadDocument(doc.id, doc.filename)}
                                      className="cursor-pointer text-sm"
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                          <File className="mr-2 h-3 w-3" />
                                          <span className="truncate max-w-32">
                                            {doc.required_document?.name || doc.filename || 'Document'}
                                          </span>
                                        </div>
                                        <Badge
                                          variant={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'destructive' : 'secondary'}
                                          className="text-xs ml-2"
                                        >
                                          {doc.status === 'approved' ? '✓' : doc.status === 'rejected' ? '✗' : '○'}
                                        </Badge>
                                      </div>
                                    </DropdownMenuItem>
                                  ))}
                                </div>
                              </>
                            )}

                            {app.status !== 'cancelled' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Changer le statut
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      {statuses
                                        .filter((s) => s.value !== 'all' && s.value !== app.status)
                                        .map((status) => (
                                          <DropdownMenuItem
                                            key={status.value}
                                            onSelect={() => handleStatusUpdate(app.id, status.value)}
                                            className="cursor-pointer"
                                          >
                                            {status.label}
                                          </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    const reason = prompt('Motif de l\'annulation:');
                                    if (reason) handleCancelApplication(app.id, reason);
                                  }}
                                  className="cursor-pointer text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Annuler la demande
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <div className="text-sm">
                Page {currentPage} sur {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      
      {/* <Toaster /> */}
    </div>
  );
};

export default ApplicationsPage;
//     </div>
//   );
// };

// export default ApplicationsPage;
