import React, { useState, useEffect } from 'react';
import Stepper from '../components/Stepper';
import PassengerForm from '../components/PassengerForm';
import DocumentUpload from '../components/DocumentUpload';
import GeneralInfoForm from '../components/GeneralInfoForm';
import RecapStep from '../components/RecapStep';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CLIENT_ROUTES } from '../constants/routes';
import api from '../lib/axios';

const steps = [
  'Informations générales',
  'Passagers',
  'Documents',
  'Récapitulatif',
];

export default function TravelBookingStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingId, setBookingId] = useState(null);
  const [isContinueMode, setIsContinueMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [passengers, setPassengers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [recap, setRecap] = useState({});
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Pré-remplissage de la destination depuis l'URL ou chargement d'une réservation existante
  useEffect(() => {
    const loadExistingBooking = async () => {
      const params = new URLSearchParams(location.search);
      const destination = params.get('destination');
      const bookingId = params.get('bookingId');

      if (bookingId) {
        // Mode continuation - charger une réservation existante
        setIsContinueMode(true);
        try {
          const res = await api.get(`/travel/api/travel-bookings/${bookingId}/`);
          const booking = res.data;

          // Charger les données du formulaire depuis draft_form_data si disponible
          if (booking.draft_form_data) {
            setFormData(booking.draft_form_data);
          } else {
            // Fallback to booking fields if no draft data
            setFormData({
              destination: booking.destination,
              pays_arrivee: booking.destination,
              ville_depart: booking.ville_depart,
              ville_arrivee: booking.ville_arrivee,
              aller_retour: booking.aller_retour,
              date_depart: booking.date_depart,
              date_retour: booking.date_retour,
              travel_class: booking.travel_class,
              nombre_passagers: booking.nombre_passagers,
            });
          }

          // Charger les passagers existants
          if (booking.draft_passengers) {
            setPassengers(booking.draft_passengers);
          }

          // Charger les documents existants
          if (booking.documents) {
            setDocuments(booking.documents.map(doc => ({
              id: doc.id,
              type: doc.type,
              file: doc.fichier,
              status: doc.statut
            })));
          }

          // Déterminer l'étape de départ basée sur les données existantes
          // Commencer au minimum à l'étape 1 (passagers) car les infos générales sont déjà remplies
          let startStep = 1; // Commencer par les passagers
          if (booking.draft_passengers && booking.draft_passengers.length > 0) {
            startStep = 2; // Passagers saisis, aller à l'étape documents
          }
          if (booking.documents && booking.documents.length > 0) {
            startStep = 3; // Documents présents, aller directement au récapitulatif
          }

          setCurrentStep(startStep);
          setBookingId(bookingId);
          console.log('Réservation existante chargée, étape de départ:', startStep);
        } catch (error) {
          console.error('Erreur lors du chargement de la réservation:', error);
        }
      } else if (destination) {
        // Nouveau booking avec destination pré-remplie
        setIsContinueMode(false);
        const countryCities = {
          'Canada': 'Toronto',
          'États-Unis': 'New York',
          'France': 'Paris',
          'Royaume-Uni': 'Londres',
          'Australie': 'Sydney',
          'Allemagne': 'Berlin',
          'Maroc': 'Casablanca',
          'Japon': 'Tokyo'
        };

        const city = countryCities[destination] || destination;

        setFormData(prev => ({
          ...prev,
          destination,
          pays_arrivee: destination,
          ville_arrivee: city
        }));
        console.log('Pré-remplissage de la destination:', destination, city);
      } else {
        // Nouveau booking vide
        setIsContinueMode(false);
      }
    };

    loadExistingBooking();
  }, []); // Exécute une seule fois au montage

  // Gestion du formulaire d'informations générales : création ou mise à jour
  const handleGeneralInfoSubmit = async () => {
    setLoading(true);
    try {
      if (isContinueMode && bookingId) {
        // Mode continuation : mettre à jour la réservation existante
        const payload = {
          destination: formData.pays_arrivee || formData.destination || '',
          ville_depart: formData.ville_depart || '',
          ville_arrivee: formData.ville_arrivee || '',
          aller_retour: !!formData.aller_retour,
          date_depart: formData.date_depart || '',
          travel_class: formData.travel_class || 'economy',
          nombre_passagers: formData.nombre_passagers || 1,
          draft_form_data: formData, // Save complete form data
        };
        if (payload.aller_retour && formData.date_retour) {
          payload.date_retour = formData.date_retour;
        }

        console.log('PATCH payload:', payload);
        await api.patch(`/travel/api/travel-bookings/${bookingId}/`, payload);
        setCurrentStep(1); // Passe au step suivant après mise à jour
      } else {
        // Mode création : créer une nouvelle réservation
        // Get current user from API to ensure we have the correct ID
        const userResponse = await api.get('/users/me/');
        const currentUser = userResponse.data;

        // Collect required fields for TravelBooking
        const payload = {
          //user: currentUser.id,
          destination: formData.pays_arrivee || formData.destination || '',
          ville_depart: formData.ville_depart || '',
          ville_arrivee: formData.ville_arrivee || '',
          aller_retour: !!formData.aller_retour,
          date_depart: formData.date_depart || '',
          travel_class: formData.travel_class || 'economy',
          nombre_passagers: formData.nombre_passagers || 1,
          statut: 'draft',
          draft_form_data: formData, // Save complete form data
        };
        if (payload.aller_retour && formData.date_retour) {
          payload.date_retour = formData.date_retour;
        }

        console.log('POST payload:', payload);
        const res = await api.post('/travel/api/travel-bookings/', payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        setBookingId(res.data.id);
        setCurrentStep(1); // Passe au step suivant après création
      }
    } catch (err) {
      console.error('Error saving booking:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du stepper
  const handleNext = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));

  const handlePrev = () => {
    // En mode continuation, empêcher de revenir aux étapes déjà complétées
    if (isContinueMode) {
      // Déterminer l'étape minimale autorisée basée sur les données existantes
      let minStep = 0;
      // Note: Cette logique pourrait être améliorée en fonction des données réelles
      // Pour l'instant, permettre la navigation normale
      setCurrentStep(s => Math.max(s - 1, minStep));
    } else {
      setCurrentStep(s => Math.max(s - 1, 0));
    }
  };

  // Soumission finale de la réservation
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // First update the booking with passenger data
      const updatePayload = {
        draft_passengers: passengers,
      };
      await api.patch(`/travel/api/travel-bookings/${bookingId}/`, updatePayload);

      // Then submit the booking
      await api.post(`/travel/api/travel-bookings/${bookingId}/submit/`);

      // Redirect to bookings list after successful submission
      window.location.href = CLIENT_ROUTES.BOOKINGS;
    } catch (err) {
      console.error('SUBMIT error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update booking draft with form data, passenger and document data
  const updateBookingDraft = async () => {
    if (!bookingId) return;

    try {
      const payload = {
        draft_form_data: formData,
        draft_passengers: passengers,
        draft_documents: documents,
      };

      await api.patch(`/travel/api/travel-bookings/${bookingId}/`, payload);
    } catch (error) {
      console.error('Error updating booking draft:', error);
    }
  };

  // Liste de villes de départ (select)
  const villesDepart = [
    'Douala', 'Yaoundé', 'Abidjan', 'Dakar', 'Lagos', 'Casablanca', 'Tunis',
    'Paris', 'Bruxelles', 'Genève', 'Lisbonne', 'Madrid', 'Berlin', 'Rome', 'Londres'
  ];

  // En mode continuation, toutes les étapes restent visibles
  const displaySteps = steps;
  const displayCurrentStep = currentStep;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Stepper steps={displaySteps} currentStep={displayCurrentStep} />
      {currentStep === 0 && !isContinueMode && (
        <GeneralInfoForm
          formData={formData}
          setFormData={setFormData}
          onNext={handleGeneralInfoSubmit}
          villesDepart={villesDepart}
        />
      )}
      {currentStep === 1 && (
        <PassengerForm
          bookingId={bookingId}
          passengers={passengers}
          setPassengers={setPassengers}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
      {currentStep === 2 && (
        <DocumentUpload
          bookingId={bookingId}
          documents={documents}
          setDocuments={setDocuments}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
      {currentStep === 3 && (
        <RecapStep
          recap={recap}
          bookingId={bookingId}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
