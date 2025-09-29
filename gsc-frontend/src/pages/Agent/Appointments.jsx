import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  FileText,
  MoreHorizontal,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from '@/lib/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

// Helper function to get status badge component based on status
const getStatusBadge = (status) => {
  switch (status) {
    case 'unread':
      return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">Non lu</Badge>;
    case 'read':
      return <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">Lu</Badge>;
    case 'canceled':
      return <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400">Annulé</Badge>;
    case 'postponed':
      return <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">Reporté</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'unread', label: 'Non lu' },
  { value: 'read', label: 'Lu' },
  { value: 'canceled', label: 'Annulé' },
  { value: 'postponed', label: 'Reporté' },
];

const reasonOptions = [
  { value: 'all', label: 'Toutes les raisons' },
  { value: 'visa', label: 'Demande de visa' },
  { value: 'booking', label: 'Réservation de voyage' },
  { value: 'other', label: 'Autre' },
];

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [visaApplications, setVisaApplications] = useState([]);
  const [travelBookings, setTravelBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;

  // Form states for creating appointment
  const [newAppointment, setNewAppointment] = useState({
    client: '',
    reason: '',
    specific_request: '', // visa application or travel booking ID
    date: '',
    message: '',
    location: 'agency',
    required_documents: []
  });

  // Form states for updating status
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    new_date: ''
  });

  // Fetch appointments, clients, visa applications and travel bookings
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appointmentsResponse, clientsResponse, visaResponse, bookingsResponse] = await Promise.all([
        axios.get('/travel/api/appointments/'),
        axios.get('/core/api/clients/'),
        axios.get('/travel/api/visa-applications/'),
        axios.get('/travel/api/travel-bookings/')
      ]);

      setAppointments(appointmentsResponse.data);
      setClients(clientsResponse.data);
      setVisaApplications(visaResponse.data);
      setTravelBookings(bookingsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle URL parameters for pre-filling form
  useEffect(() => {
    const bookingId = searchParams.get('booking');
    const clientId = searchParams.get('client');

    if ((bookingId || clientId) && travelBookings.length > 0 && clients.length > 0) {
      let booking = null;
      let client = null;

      if (bookingId) {
        booking = travelBookings.find(b => b.id.toString() === bookingId);
        if (booking) {
          client = booking.user;
        }
      } else if (clientId) {
        client = clients.find(c => c.id.toString() === clientId);
      }

      if (client) {
        setNewAppointment(prev => ({
          ...prev,
          client: client.id?.toString() || '',
          reason: booking ? 'booking' : '',
          specific_request: booking ? bookingId : '',
          required_documents: booking ? getRequiredDocumentsForReason('booking') : []
        }));
        setShowCreateDialog(true);
      }
    }
  }, [searchParams, travelBookings, clients]);

  // Handle create appointment
  const handleCreateAppointment = async () => {
    try {
      setIsSubmitting(true);
      const appointmentData = {
        client: newAppointment.client,
        reason: newAppointment.reason,
        date: new Date(newAppointment.date).toISOString(),
        message: newAppointment.message,
        location: newAppointment.location,
        required_documents: newAppointment.required_documents
      };

      // Add specific request reference based on reason
      if (newAppointment.reason === 'visa' && newAppointment.specific_request) {
        appointmentData.visa_application = newAppointment.specific_request;
      } else if (newAppointment.reason === 'booking' && newAppointment.specific_request) {
        appointmentData.travel_booking = newAppointment.specific_request;
      }

      await axios.post('/travel/api/appointments/', appointmentData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        }
      });

      // Clear URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      setShowCreateDialog(false);
      setNewAppointment({
        client: '',
        reason: '',
        specific_request: '',
        date: '',
        message: '',
        location: 'agency',
        required_documents: []
      });
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('Erreur lors de la création du rendez-vous');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      setIsSubmitting(true);
      const updateData = {
        status: statusUpdate.status
      };

      if (statusUpdate.status === 'postponed' && statusUpdate.new_date) {
        updateData.new_date = new Date(statusUpdate.new_date).toISOString();
      }

      await axios.patch(`/travel/api/appointments/${selectedAppointment.id}/`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        }
      });

      setShowStatusDialog(false);
      setSelectedAppointment(null);
      setStatusUpdate({ status: '', new_date: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get required documents based on reason
  const getRequiredDocumentsForReason = (reason) => {
    const documentsByReason = {
      'visa': ['passport', 'photo', 'birth_certificate', 'marriage_certificate', 'bank_statement', 'employment_letter', 'medical_certificate', 'police_clearance'],
      'booking': ['passport', 'flight_itinerary', 'hotel_booking'],
      'other': []
    };
    return documentsByReason[reason] || [];
  };

  // Get client-specific visa applications
  const getClientVisaApplications = (clientId) => {
    if (!clientId) return [];
    return visaApplications.filter(app => app.applicant?.id === parseInt(clientId));
  };

  // Get client-specific travel bookings (only paid ones)
  const getClientTravelBookings = (clientId) => {
    if (!clientId) return [];
    // Filter bookings that have at least one completed or processing payment
    return travelBookings.filter(booking => {
      return booking.user?.id === parseInt(clientId) &&
             booking.payments?.some(payment =>
               payment.status === 'completed' || payment.status === 'processing'
             );
    });
  };

  // Handle client change - reset dependent fields
  const handleClientChange = (clientId) => {
    setNewAppointment(prev => ({
      ...prev,
      client: clientId,
      specific_request: '',
      reason: '',
      required_documents: []
    }));
  };

  // Handle reason change - reset specific request
  const handleReasonChange = (reason) => {
    setNewAppointment(prev => ({
      ...prev,
      reason,
      specific_request: '',
      required_documents: getRequiredDocumentsForReason(reason)
    }));
  };

  // Document options for checkboxes
  const documentOptions = [
    { id: 'passport', label: 'Passeport' },
    { id: 'photo', label: 'Photo d\'identité' },
    { id: 'birth_certificate', label: 'Acte de naissance' },
    { id: 'marriage_certificate', label: 'Acte de mariage' },
    { id: 'bank_statement', label: 'Relevé bancaire' },
    { id: 'employment_letter', label: 'Lettre d\'emploi' },
    { id: 'medical_certificate', label: 'Certificat médical' },
    { id: 'police_clearance', label: 'Casier judiciaire' },
    { id: 'flight_itinerary', label: 'Itinéraire de vol' },
    { id: 'hotel_booking', label: 'Réservation hôtel' },
  ];

  // Handle document checkbox change
  const handleDocumentChange = (documentId, checked) => {
    setNewAppointment(prev => ({
      ...prev,
      required_documents: checked
        ? [...prev.required_documents, documentId]
        : prev.required_documents.filter(id => id !== documentId)
    }));
  };

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = searchTerm === '' ||
        appointment.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.reason_display?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      const matchesReason = reasonFilter === 'all' || appointment.reason === reasonFilter;

      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [appointments, searchTerm, statusFilter, reasonFilter]);

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAppointments.length / itemsPerPage);
  }, [filteredAppointments, itemsPerPage]);

  const currentAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <div className="mt-2">
              <Button variant="outline" onClick={fetchData}>
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
          <h1 className="text-2xl font-bold tracking-tight">Rendez-vous</h1>
          <p className="text-muted-foreground">
            Gérez les rendez-vous avec vos clients
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau rendez-vous
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Rechercher par client ou raison..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Raison" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentAppointments.length > 0 ? (
              currentAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.client_name}
                        </h3>
                        {getStatusBadge(appointment.status)}
                        <Badge variant="outline" className="text-xs">
                          {appointment.reason_display}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {appointment.date_formatted}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {appointment.location_display}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Créé le {format(new Date(appointment.created_at), 'PP', { locale: fr })}
                        </div>
                      </div>
                      {appointment.message && (
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {appointment.message}
                        </p>
                      )}
                      {appointment.new_date && (
                        <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                          Nouvelle date: {format(new Date(appointment.new_date), 'PPPp', { locale: fr })}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setStatusUpdate({ status: appointment.status, new_date: '' });
                            setShowStatusDialog(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier le statut
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {filteredAppointments.length === 0 && appointments.length === 0
                    ? 'Aucun rendez-vous trouvé'
                    : 'Aucun résultat pour cette recherche'}
                </p>
              </div>
            )}
          </div>

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

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-sm border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Créer un nouveau rendez-vous</DialogTitle>
            <DialogDescription className="text-gray-300">
              Planifiez un rendez-vous avec un client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Client</label>
              <Select value={newAppointment.client} onValueChange={handleClientChange}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()} className="text-white hover:bg-gray-700">
                      {client.prenom} {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Motif du rendez-vous</label>
              <Select
                value={newAppointment.reason}
                onValueChange={handleReasonChange}
                disabled={!newAppointment.client}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white disabled:opacity-50">
                  <SelectValue placeholder="Sélectionner le motif" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="visa" className="text-white hover:bg-gray-700">Demande de visa</SelectItem>
                  <SelectItem value="booking" className="text-white hover:bg-gray-700">Réservation de voyage</SelectItem>
                  <SelectItem value="other" className="text-white hover:bg-gray-700">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specific Request Selection */}
            {newAppointment.client && newAppointment.reason && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  {newAppointment.reason === 'visa' ? 'Demande de visa spécifique' : 'Réservation spécifique'}
                </label>
                <Select
                  value={newAppointment.specific_request}
                  onValueChange={(value) => setNewAppointment({...newAppointment, specific_request: value})}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder={newAppointment.reason === 'visa' ? 'Sélectionner une demande de visa' : 'Sélectionner une réservation'} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {newAppointment.reason === 'visa' ? (
                      getClientVisaApplications(newAppointment.client).map((app) => (
                        <SelectItem key={app.id} value={app.id.toString()} className="text-white hover:bg-gray-700">
                          #{app.application_number} - {app.visa_type_name} ({app.country_name})
                        </SelectItem>
                      ))
                    ) : (
                      getClientTravelBookings(newAppointment.client).map((booking) => (
                        <SelectItem key={booking.id} value={booking.id.toString()} className="text-white hover:bg-gray-700">
                          #{booking.id} - {booking.destination} ({booking.get_statut_display})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date, Time and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Date et heure</label>
                <Input
                  type="datetime-local"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Lieu</label>
                <Select value={newAppointment.location} onValueChange={(value) => setNewAppointment({...newAppointment, location: value})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="agency" className="text-white hover:bg-gray-700">Agence</SelectItem>
                    <SelectItem value="embassy" className="text-white hover:bg-gray-700">Ambassade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Documents Checkboxes */}
            <div>
              <label className="block text-sm font-medium mb-3 text-white">Documents à apporter</label>
              <div className="grid grid-cols-2 gap-3">
                {documentOptions.map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={doc.id}
                      checked={newAppointment.required_documents.includes(doc.id)}
                      onChange={(e) => handleDocumentChange(doc.id, e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800/50 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={doc.id} className="text-sm text-gray-300 cursor-pointer">
                      {doc.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Message pour le client</label>
              <Textarea
                value={newAppointment.message}
                onChange={(e) => setNewAppointment({...newAppointment, message: e.target.value})}
                placeholder="Instructions ou recommandations pour le client..."
                rows={4}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <DialogFooter className="border-t border-gray-700 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateAppointment}
              disabled={isSubmitting || !newAppointment.client || !newAppointment.reason || !newAppointment.date}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Création...' : 'Créer le rendez-vous'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="bg-black/80 backdrop-blur-sm border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier le statut du rendez-vous</DialogTitle>
            <DialogDescription className="text-gray-300">
              Mettez à jour le statut de ce rendez-vous
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Nouveau statut</label>
              <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate({...statusUpdate, status: value})}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="read" className="text-white hover:bg-gray-700">Lu</SelectItem>
                  <SelectItem value="canceled" className="text-white hover:bg-gray-700">Annulé</SelectItem>
                  <SelectItem value="postponed" className="text-white hover:bg-gray-700">Reporté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {statusUpdate.status === 'postponed' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Nouvelle date</label>
                <Input
                  type="datetime-local"
                  value={statusUpdate.new_date}
                  onChange={(e) => setStatusUpdate({...statusUpdate, new_date: e.target.value})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
            )}
          </div>
          <DialogFooter className="border-t border-gray-700 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Annuler
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;