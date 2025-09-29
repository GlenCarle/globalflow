import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { FileText, ArrowRight, ArrowLeft, Users, Plane, Eye } from 'lucide-react';
import api from '../lib/axios';

export default function RecapStep({ recap, onPrev, onSubmit, bookingId }) {
  const [bookingData, setBookingData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookingData = async () => {
      if (bookingId) {
        try {
          // Load booking data
          const bookingRes = await api.get(`/travel/api/travel-bookings/${bookingId}/`);
          setBookingData(bookingRes.data);

          // Load documents for this booking
          const docsRes = await api.get(`/travel/api/travel-bookings/${bookingId}/documents/`);
          setDocuments(docsRes.data || []);
        } catch (error) {
          console.error('Error loading booking data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadBookingData();
  }, [bookingId]);

  const openDocumentPreview = (doc) => {
    if (doc.fichier_url) {
      window.open(doc.fichier_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const data = bookingData || recap;

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
          <FileText className="h-7 w-7 text-primary" />
        </span>
        <h2 className="text-2xl font-bold text-primary">Récapitulatif de la réservation</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2"><Plane className="h-5 w-5 text-primary" /><strong>Destination :</strong> {data.destination}</div>
          <div className="mb-2"><strong>Départ :</strong> {data.ville_depart}</div>
          <div className="mb-2"><strong>Arrivée :</strong> {data.ville_arrivee}</div>
          <div className="mb-2"><strong>Date de départ :</strong> {data.date_depart}</div>
          <div className="mb-2"><strong>Date de retour :</strong> {data.date_retour || 'Aller simple'}</div>
          <div className="mb-2"><strong>Classe :</strong> {data.get_travel_class_display || data.travel_class}</div>
          <div className="mb-2 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><strong>Nombre de passagers :</strong> {data.nombre_passagers}</div>
        </div>
        <div>
          <div className="mb-2"><strong>Passagers :</strong></div>
          <ul className="mb-4 list-disc pl-5">
            {(data.draft_passengers || []).map((p, idx) => (
              <li key={p.id || idx}>{p.nom} {p.prenom} - {p.numero_passeport}</li>
            ))}
          </ul>
          <div className="mb-2"><strong>Documents :</strong></div>
          <div className="space-y-2">
            {documents.map((d, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span>{d.get_type_display || d.type} - {d.get_statut_display || d.statut}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openDocumentPreview(d)}
                  className="p-1"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-8">
        <Button type="button" onClick={onPrev} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <Button type="button" onClick={onSubmit} className="flex items-center gap-2">
          Soumettre la demande <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
