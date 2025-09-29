import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  FileText,
  File,
  Calendar as CalendarIcon,
  CheckCircle,
  Download,
  Eye,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from '@/lib/axios';

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

// Helper function to get status badge component based on status
const getStatusBadge = (status) => {
  switch (status) {
    case 'draft':
      return <Badge variant="outline" className="border-gray-400 text-gray-600 dark:text-gray-300">Brouillon</Badge>;
    case 'submitted':
      return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">Soumis</Badge>;
    case 'under_review':
      return <Badge variant="outline" className="border-purple-500 text-purple-600 dark:text-purple-400">En cours</Badge>;
    case 'approved':
      return <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">Approuvé</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400">Rejeté</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="border-gray-500 text-gray-600 dark:text-gray-400">Annulé</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const statuses = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'submitted', label: 'Soumis' },
  { value: 'under_review', label: 'En cours d\'examen' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Rejeté' },
  { value: 'cancelled', label: 'Annulé' },
];

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/travel/api/visa-applications/${id}/`);
      setApplication(response.data);
      setStatus(response.data.status);
      setNotes(response.data.internal_notes || '');
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('Erreur lors du chargement de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await axios.patch(`/travel/api/visa-applications/${id}/`, {
        status,
        internal_notes: notes
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        }
      });
      setApplication({ ...application, ...response.data });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating application:', error);
      setError('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

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
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/agent/applications')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error || 'Demande non trouvée'}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/agent/applications')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux demandes
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                Demande de visa #{application.application_number || application.id}
              </h1>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                {application.visa_type_name} - {application.country_name} • Créée le {format(new Date(application.created_at), 'PPP', { locale: fr })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Informations personnelles */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Prénom</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.first_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.last_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Genre</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.gender || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de naissance</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {application.date_of_birth ? format(new Date(application.date_of_birth), 'PPP', { locale: fr }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lieu de naissance</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.place_of_birth || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nationalité</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.nationality || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border border-green-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center text-green-900 dark:text-green-100">
                <FileText className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse actuelle</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.current_address || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ville</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.city || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.email || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations du passeport */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-700 border border-purple-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-900 dark:text-purple-100">
                <File className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                Informations du passeport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Numéro de passeport</h4>
                  <p className="mt-1 text-gray-900 dark:text-white font-mono">{application.passport_number || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date d'émission</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {application.passport_issue_date ? format(new Date(application.passport_issue_date), 'PPP', { locale: fr }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date d'expiration</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {application.passport_expiry_date ? format(new Date(application.passport_expiry_date), 'PPP', { locale: fr }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lieu d'émission</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.passport_issue_place || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de voyage */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 border border-orange-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-900 dark:text-orange-100">
                <CalendarIcon className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                Informations de voyage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Motif du voyage</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.purpose_of_visit || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date d'arrivée prévue</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {application.intended_date_of_arrival ? format(new Date(application.intended_date_of_arrival), 'PPP', { locale: fr }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de départ prévue</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {application.intended_date_of_departure ? format(new Date(application.intended_date_of_departure), 'PPP', { locale: fr }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durée du séjour</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {application.length_of_stay_days ? `${application.length_of_stay_days} jours` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statut et informations administratives */}
          <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-700 border border-red-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center text-red-900 dark:text-red-100">
                <CheckCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                Statut et informations administratives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut actuel</h4>
                  <div className="mt-2">
                    {isEditing ? (
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses
                            .filter(s => s.value !== 'all')
                            .map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center">
                        {getStatusBadge(application.status)}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Agent assigné</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {application.assigned_agent_name || 'Non assigné'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Priorité</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">{application.priority_display || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Étape en cours</h4>
                  <p className="mt-1 text-gray-900 dark:text-white">Étape {application.current_step || 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 border border-teal-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center text-teal-900 dark:text-teal-100">
                <File className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
                Documents soumis ({application.documents?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.documents?.length > 0 ? (
                <div className="space-y-3">
                  {application.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <File className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.document_name || 'Document'}
                          </span>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={doc.status === 'approved' ? 'success' : doc.status === 'submitted' ? 'warning' : 'secondary'} className="text-xs">
                              {doc.get_status_display || doc.status}
                            </Badge>
                            {doc.uploaded_at && (
                              <span className="text-xs text-gray-500">
                                Uploadé le {format(new Date(doc.uploaded_at), 'PP', { locale: fr })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.file_url, '_blank')}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Voir
                          </Button>
                        )}
                        {doc.file && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.id, doc.file_name || doc.document_name)}
                            className="gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Télécharger
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucun document soumis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes internes */}
          {(application.internal_notes || isEditing) && (
            <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-slate-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900 dark:text-slate-100">
                  <FileText className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
                  Notes internes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="Ajoutez des notes internes sur cette demande..."
                    />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    {application.internal_notes ? (
                      <p className="whitespace-pre-line text-gray-900 dark:text-white">{application.internal_notes}</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">Aucune note interne</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
