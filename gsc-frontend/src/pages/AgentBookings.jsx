import React, { useEffect, useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import BookingStatusBadge from '../components/BookingStatusBadge';
import PDFDownloadButton from '../components/PDFDownloadButton';
import { Button } from '../components/ui/Button';
import api from '@/lib/axios';

export default function AgentBookings() {
  const [bookings, setBookings] = useState([]);
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
      setError(null);
      const res = await api.get('/travel/api/travel-bookings/');
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-600 text-lg mb-6">{error}</p>
        <Button onClick={fetchBookings}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Réservations</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez toutes les réservations de voyage
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

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune réservation trouvée</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Départ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {b.user_name || `${b.user?.prenom} ${b.user?.nom}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{b.destination}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {b.date_depart ? new Date(b.date_depart).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BookingStatusBadge statut={b.statut} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2 flex-wrap">
                      <a
                        href={`/booking/${b.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Détail
                      </a>
                      <PDFDownloadButton bookingId={b.id} />

                      {/* Cancel/Delete buttons based on status */}
                      {b.statut === 'pending_payment' ? (
                        <Button
                          size="sm"
                          onClick={() => openCancelModal(b)}
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
                          onClick={() => openDeleteModal(b)}
                          variant="outline"
                          className="text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50"
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
