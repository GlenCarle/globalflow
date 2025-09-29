import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, CreditCard, X, AlertTriangle, Calendar, Users, Globe, Play } from 'lucide-react';
import BookingStatusBadge from '../components/BookingStatusBadge';
import PDFDownloadButton from '../components/PDFDownloadButton';
import { Button } from '../components/ui/Button';
import api from '../lib/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch bookings, exposed for refresh
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/travel/api/travel-bookings/');
      setBookings(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Erreur lors du chargement des réservations');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancelModal.booking || !cancelReason.trim()) return;

    setCancelLoading(true);
    try {
      await api.post(`/travel/api/travel-bookings/${cancelModal.booking.id}/cancel/`, {
        reason: cancelReason
      });

      await fetchBookings();
      setCancelModal({ open: false, booking: null });
      setCancelReason('');
    } catch (error) {
      console.error('Error canceling booking:', error);
    } finally {
      setCancelLoading(false);
    }
  };

  const openCancelModal = (booking) => {
    setCancelModal({ open: true, booking });
    setCancelReason('');
  };

  const closeCancelModal = () => {
    setCancelModal({ open: false, booking: null });
    setCancelReason('');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p className="text-red-600 text-lg mb-6">{error}</p>
        <Button onClick={fetchBookings}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Mes voyages</h1>
        <div className="flex gap-3">
          <Link to="/book">
            <Button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-lg shadow-lg transition">
              <Plus className="h-5 w-5" />
              Nouveau voyage
            </Button>
          </Link>
          <Link to="/destinations">
            <Button variant="outline" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg">
              <MapPin className="h-5 w-5" />
              Choisir une destination
            </Button>
          </Link>
        </div>
      </header>

      {bookings.length === 0 ? (
        <section className="text-center py-20">
          <MapPin className="mx-auto mb-6 h-20 w-20 text-gray-400 dark:text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucune réservation trouvée</h2>
          <p className="text-gray-500 dark:text-gray-400">Commencez par choisir une destination ou créer un nouveau voyage.</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {bookings.map(booking => (
            <article
              key={booking.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <header>
                <h3 className="text-xl font-bold text-primary mb-1">{booking.destination}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{booking.ville_depart} → {booking.ville_arrivee}</p>
                <BookingStatusBadge statut={booking.statut} />
              </header>

              <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                <p className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>
                    Départ: <strong>{new Date(booking.date_depart).toLocaleDateString()}</strong>
                  </span>
                </p>
                {booking.aller_retour && booking.date_retour && (
                  <p className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>
                      Retour: <strong>{new Date(booking.date_retour).toLocaleDateString()}</strong>
                    </span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>
                    Passagers: <strong>{booking.nombre_passagers}</strong>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>
                    Classe: <strong>{booking.travel_class.charAt(0).toUpperCase() + booking.travel_class.slice(1)}</strong>
                  </span>
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <span>
                    Créé: <strong>{new Date(booking.created_at).toLocaleString()}</strong>
                  </span>
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <span>
                    Modifié: <strong>{new Date(booking.updated_at).toLocaleString()}</strong>
                  </span>
                </p>
              </div>

              <footer className="mt-6 flex flex-wrap gap-3 items-center justify-between">
                <Link
                  to={`/booking/${booking.id}`}
                  className="text-primary hover:underline font-semibold"
                >
                  Voir détails
                </Link>

                <div className="flex flex-wrap gap-2 items-center">
                  {(booking.statut === 'draft' || booking.statut === 'pending') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openCancelModal(booking)}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Annuler
                    </Button>
                  )}
                  {booking.statut === 'pending_payment' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                      onClick={() => navigate(`/payment/${booking.id}`)}
                    >
                      <CreditCard className="h-4 w-4" />
                      Payer
                    </Button>
                  )}
                  {booking.statut === 'draft' && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                      onClick={() => navigate(`/book?bookingId=${booking.id}`)}
                    >
                      <Play className="h-4 w-4" />
                      Continuer
                    </Button>
                  )}
                  {(booking.statut === 'confirmed' || booking.statut === 'completed') && (
                    <PDFDownloadButton bookingId={booking.id} />
                  )}
                </div>
              </footer>
            </article>
          ))}
        </section>
      )}

      {/* Cancel Modal */}
      {cancelModal.open && cancelModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
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
              <Button variant="outline" onClick={closeCancelModal} disabled={cancelLoading}>Annuler</Button>
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                disabled={!cancelReason.trim() || cancelLoading}
              >
                {cancelLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
