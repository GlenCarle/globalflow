import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, User, Calendar, MapPin, Users, Plane, Plus, X, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { AGENT_ROUTES } from '../../constants/routes';
import api from '../../lib/axios';

export default function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Modal states
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, booking: null });
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [bookingsRes, appointmentsRes] = await Promise.all([
        api.get('/travel/api/travel-bookings/'),
        api.get('/travel/api/appointments/')
      ]);

      // Filter bookings that have payments (paid bookings)
      const paidBookings = bookingsRes.data.filter(booking =>
        booking.statut === 'processing' ||
        booking.statut === 'payment_validated' ||
        booking.statut === 'pending_agent_validation' ||
        booking.statut === 'confirmed'
      );

      setBookings(paidBookings);
      setAppointments(appointmentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateBooking = async (bookingId) => {
   try {
     setActionLoading(true);
     setActionError(null);
     await api.post(`/travel/api/travel-bookings/${bookingId}/validate_booking/`);
     fetchBookings(); // Refresh data
     alert('Réservation validée avec succès');
   } catch (error) {
     console.error('Error validating booking:', error);
     const errorMessage = error.response?.data?.error || 'Erreur lors de la validation de la réservation';
     setActionError(errorMessage);
   } finally {
     setActionLoading(false);
   }
 };

  const handleAssignAgent = async (bookingId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await api.post(`/travel/api/travel-bookings/${bookingId}/assign_agent/`);
      fetchBookings(); // Refresh data
      alert('Réservation assignée avec succès');
    } catch (error) {
      console.error('Error assigning booking:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'assignation de la réservation';
      setActionError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModal.booking || !cancelReason.trim()) return;

    try {
      setActionLoading(true);
      setActionError(null);
      await api.post(`/travel/api/travel-bookings/${cancelModal.booking.id}/cancel/`, {
        reason: cancelReason
      });

      await fetchBookings();
      setCancelModal({ open: false, booking: null });
      setCancelReason('');
      alert('Réservation annulée avec succès');
    } catch (error) {
      console.error('Error canceling booking:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'annulation de la réservation';
      setActionError(errorMessage);
      // Don't close modal on error so user can retry
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteModal.booking) return;

    try {
      setActionLoading(true);
      setActionError(null);
      await api.delete(`/travel/api/travel-bookings/${deleteModal.booking.id}/`);

      await fetchBookings();
      setDeleteModal({ open: false, booking: null });
      alert('Réservation supprimée avec succès');
    } catch (error) {
      console.error('Error deleting booking:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression de la réservation';
      setActionError(errorMessage);
      // Don't close modal on error so user can retry
    } finally {
      setActionLoading(false);
    }
  };

  const openCancelModal = (booking) => {
    setCancelModal({ open: true, booking });
    setCancelReason('');
    setActionError(null);
  };

  const openDeleteModal = (booking) => {
    setDeleteModal({ open: true, booking });
    setActionError(null);
  };

  const closeCancelModal = () => {
    setCancelModal({ open: false, booking: null });
    setCancelReason('');
    setActionError(null);
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, booking: null });
    setActionError(null);
  };

  const getStatusBadge = (status) => {
    const variants = {
      processing: { variant: 'secondary', text: 'Paiement en cours' },
      payment_validated: { variant: 'default', text: 'Paiement validé' },
      pending_agent_validation: { variant: 'warning', text: 'Validation requise' },
      confirmed: { variant: 'success', text: 'Confirmée' },
      cancelled: { variant: 'destructive', text: 'Annulée' }
    };

    const config = variants[status] || { variant: 'outline', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const hasAppointment = (bookingId) => {
    return appointments.some(appointment => appointment.travel_booking === bookingId);
  };

  const getAppointmentBadge = (bookingId) => {
    const appointmentExists = hasAppointment(bookingId);
    return appointmentExists ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Calendar className="h-3 w-3 mr-1" />
        RDV programmé
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
        <Clock className="h-3 w-3 mr-1" />
        RDV requis
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-600 text-lg mb-6">{error}</p>
        <Button onClick={fetchBookings}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Réservations & Rendez-vous</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez les réservations payées, validez les demandes et planifiez les rendez-vous
        </p>

        {/* Error Display */}
        {actionError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erreur
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {actionError}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">En attente validation</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {bookings.filter(b => b.statut === 'pending_agent_validation').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Validées</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {bookings.filter(b => b.statut === 'confirmed').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Paiement validé</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {bookings.filter(b => b.statut === 'payment_validated').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-indigo-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Avec rendez-vous</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {bookings.filter(b => hasAppointment(b.id)).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">RDV requis</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {bookings.filter(b => !hasAppointment(b.id)).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total réservations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {bookings.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Réservations avec paiement & Statut des rendez-vous</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune réservation payée trouvée</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Les réservations apparaîtront ici une fois payées
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Départ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Passagers
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Rendez-vous
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Durée
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {bookings.map((booking, index) => (
                    <tr key={booking.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/30 dark:bg-gray-800/20'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          #{booking.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.user?.prenom} {booking.user?.nom}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {booking.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {booking.destination}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {new Date(booking.date_depart).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {booking.nombre_passagers}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getAppointmentBadge(booking.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.procedure_duration_days ? (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {booking.procedure_duration_days} jours
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2 flex-wrap">
                          {booking.statut === 'processing' && (
                            <Button
                              size="sm"
                              onClick={() => handleAssignAgent(booking.id)}
                              variant="outline"
                              className="text-xs"
                              disabled={actionLoading}
                            >
                              M'assigner
                            </Button>
                          )}
                          {booking.statut === 'pending_agent_validation' && (
                            <Button
                              size="sm"
                              onClick={() => handleValidateBooking(booking.id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Valider
                            </Button>
                          )}
                          {booking.statut === 'confirmed' && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              Terminée
                            </Badge>
                          )}

                          {/* Cancel/Delete buttons based on status */}
                          {booking.statut === 'pending_payment' ? (
                            <Button
                              size="sm"
                              onClick={() => openCancelModal(booking)}
                              variant="destructive"
                              className="text-xs gap-1"
                              disabled={actionLoading}
                            >
                              <X className="h-3 w-3" />
                              Annuler
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => openDeleteModal(booking)}
                              variant="outline"
                              className="text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50"
                              disabled={actionLoading}
                            >
                              <Trash2 className="h-3 w-3" />
                              Supprimer
                            </Button>
                          )}

                          <Link to={`${AGENT_ROUTES.APPOINTMENTS}?booking=${booking.id}&client=${booking.user?.id}`}>
                            <Button
                              size="sm"
                              variant={hasAppointment(booking.id) ? "outline" : "default"}
                              className={`text-xs gap-1 ${
                                hasAppointment(booking.id)
                                  ? "border-green-200 text-green-700"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                              disabled={actionLoading}
                            >
                              {hasAppointment(booking.id) ? (
                                <>
                                  <Calendar className="h-3 w-3" />
                                  Voir RDV
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3" />
                                  Créer RDV
                                </>
                              )}
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Modal */}
      {cancelModal.open && cancelModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Annuler la réservation</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Êtes-vous sûr de vouloir annuler la réservation pour <strong>{cancelModal.booking.destination}</strong> ?
            </p>

            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Veuillez indiquer le motif de l'annulation..."
              className="w-full min-h-[90px] rounded-md border border-gray-300 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none mb-6"
              required
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeCancelModal} disabled={actionLoading}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                disabled={!cancelReason.trim() || actionLoading}
              >
                {actionLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && deleteModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Supprimer la réservation</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Êtes-vous sûr de vouloir supprimer définitivement la réservation pour <strong>{deleteModal.booking.destination}</strong> ?
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Attention :</strong> Cette action est irréversible. La réservation sera supprimée définitivement.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeDeleteModal} disabled={actionLoading}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteBooking}
                disabled={actionLoading}
              >
                {actionLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}