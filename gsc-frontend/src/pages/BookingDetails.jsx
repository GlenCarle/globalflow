import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Globe, CreditCard, X, AlertTriangle, ArrowLeft } from 'lucide-react';
import BookingStatusBadge from '../components/BookingStatusBadge';
import PDFDownloadButton from '../components/PDFDownloadButton';
import { Button } from '../components/ui/Button';
import api from '../lib/axios';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch booking detail
  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/travel/api/travel-bookings/${id}/`);
      setBooking(res.data);

      // Load passengers
      setPassengers(res.data.draft_passengers || res.data.passengers || []);

      // Load documents
      const docsRes = await api.get(`/travel/api/travel-bookings/${id}/documents/`);
      setDocuments(docsRes.data || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Impossible de charger les détails de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const openCancelModal = () => {
    setCancelModal(true);
    setCancelReason('');
  };

  const closeCancelModal = () => {
    setCancelModal(false);
    setCancelReason('');
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) return;
    setCancelLoading(true);

    try {
      await api.post(`/travel/api/travel-bookings/${id}/cancel/`, { reason: cancelReason });
      await fetchBooking();
      closeCancelModal();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      // Optionally, show user-friendly error message
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={fetchBooking}>Réessayer</Button>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour
      </Button>

      <h1 className="text-3xl font-bold mb-4 text-primary">{booking.destination}</h1>
      <BookingStatusBadge statut={booking.statut} className="mb-6" />

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Détails du voyage</h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <dt className="font-semibold w-32">Destination</dt>
            <dd>{booking.destination}</dd>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <dt className="font-semibold w-32">Ville départ</dt>
            <dd>{booking.ville_depart}</dd>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <dt className="font-semibold w-32">Ville arrivée</dt>
            <dd>{booking.ville_arrivee}</dd>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <dt className="font-semibold w-32">Date départ</dt>
            <dd>{new Date(booking.date_depart).toLocaleDateString()}</dd>
          </div>

          {booking.aller_retour && booking.date_retour && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <dt className="font-semibold w-32">Date retour</dt>
              <dd>{new Date(booking.date_retour).toLocaleDateString()}</dd>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <dt className="font-semibold w-32">Passagers</dt>
            <dd>{booking.nombre_passagers}</dd>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <dt className="font-semibold w-32">Classe</dt>
            <dd>{booking.travel_class.charAt(0).toUpperCase() + booking.travel_class.slice(1)}</dd>
          </div>

          {booking.visa_application && (
            <div className="flex items-center gap-2">
              <dt className="font-semibold w-32">Visa demandé</dt>
              <dd>{booking.visa_application.status || 'En cours'}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Demandeur</h2>
        <dl className="text-gray-700 dark:text-gray-300 space-y-2">
          <div>
            <dt className="font-semibold">Nom complet :</dt>
            <dd>{booking.user.prenom} {booking.user.nom} {passengers.some(p => p.nom === booking.user.nom && p.prenom === booking.user.prenom) ? '(passager)' : ''}</dd>
          </div>
          <div>
            <dt className="font-semibold">Email :</dt>
            <dd>{booking.user.email}</dd>
          </div>
          <div>
            <dt className="font-semibold">Téléphone :</dt>
            <dd>{booking.user.telephone}</dd>
          </div>
          <div>
            <dt className="font-semibold">Pays :</dt>
            <dd>{booking.user.pays}</dd>
          </div>
        </dl>
      </section>

      {passengers.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Passagers</h2>
          <div className="space-y-4">
            {passengers.map((passenger, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <h3 className="font-semibold text-lg">{passenger.prenom} {passenger.nom}</h3>
                <dl className="text-gray-700 dark:text-gray-300 space-y-1 mt-2">
                  <div>
                    <dt className="font-semibold inline">Date de naissance :</dt>
                    <dd className="inline ml-2">{new Date(passenger.date_naissance).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Sexe :</dt>
                    <dd className="inline ml-2">{passenger.sexe === 'male' ? 'Homme' : passenger.sexe === 'female' ? 'Femme' : 'Autre'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Nationalité :</dt>
                    <dd className="inline ml-2">{passenger.nationalite}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Numéro de passeport :</dt>
                    <dd className="inline ml-2">{passenger.numero_passeport}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Expiration passeport :</dt>
                    <dd className="inline ml-2">{new Date(passenger.expiration_passeport).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          <div className="space-y-2">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span>{doc.get_type_display || doc.type} - {doc.get_statut_display || doc.statut}</span>
                {doc.fichier_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.fichier_url, '_blank')}
                    className="p-1"
                  >
                    Voir
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-wrap gap-4 items-center">
        <PDFDownloadButton bookingId={booking.id} />

        {(booking.statut === 'draft' || booking.statut === 'pending') && (
          <Button variant="destructive" onClick={openCancelModal} className="flex items-center gap-2">
            <X className="h-5 w-5" />
            Annuler la réservation
          </Button>
        )}

        {booking.statut === 'pending_payment' && (
          <Button
            size="md"
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            onClick={() => navigate(`/payment/${booking.id}`)}
          >
            <CreditCard className="h-5 w-5" />
            Payer maintenant
          </Button>
        )}
      </section>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Annuler la réservation</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Êtes-vous sûr de vouloir annuler la réservation pour <strong>{booking.destination}</strong> ?
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
