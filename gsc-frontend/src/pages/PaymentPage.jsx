import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CreditCard, CheckCircle, ArrowRight, ArrowLeft, MapPin, Calendar, Users, Plane } from 'lucide-react';
import api from '../lib/axios';

const steps = [
  'Détails du paiement',
  'Informations de paiement',
  'Récapitulatif',
  'Confirmation'
];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Payment form data
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    paymentMethod: 'card'
  });

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const res = await api.get(`/travel/api/travel-bookings/${bookingId}/`);
        setBooking(res.data);
      } catch (error) {
        console.error('Error loading booking:', error);
        console.error('Error response:', error.response?.data);
        navigate('/dashboard/bookings');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId, navigate]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentSubmit = async () => {
    setProcessing(true);
    try {
      // Calculate amount
      const amount = booking.nombre_passagers * 500;

      // Create payment with payment details
      const paymentRes = await api.post('/travel/api/payments/', {
        payment_type: 'travel_booking',
        amount: amount,
        currency: 'EUR',
        payment_method: paymentData.paymentMethod,
        travel_booking: bookingId,
        description: `Paiement pour réservation de vol - ${booking.destination}`
      });

      const createdPayment = paymentRes.data;
      setPayment(createdPayment);

      // Process payment (mark as submitted for agent validation)
      await api.post(`/travel/api/payments/${createdPayment.id}/process_payment/`);

      // Update booking status to processing (waiting for agent validation)
      await api.patch(`/travel/api/travel-bookings/${bookingId}/`, {
        statut: 'processing'
      });

      setCurrentStep(3); // Go to confirmation
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Erreur lors du traitement du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-red-600">Réservation non trouvée</p>
        <Button onClick={() => navigate('/dashboard/bookings')} className="mt-4">
          Retour aux réservations
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= currentStep
                  ? 'bg-primary border-primary text-white'
                  : 'border-gray-300 text-gray-300'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`ml-2 mr-4 text-sm ${
                index <= currentStep ? 'text-primary font-semibold' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-primary' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Détails du paiement</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Veuillez vérifier les détails de votre réservation avant de procéder au paiement
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Réservation #{booking.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Destination:</span>
                    <span>{booking.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Départ:</span>
                    <span>{new Date(booking.date_depart).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Passagers:</span>
                    <span>{booking.nombre_passagers}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Classe:</span>
                    <span>{booking.travel_class}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Montant total:</span>
                    <span className="text-primary">{booking.nombre_passagers * 500} EUR</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Informations de paiement</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Entrez vos informations de paiement sécurisées
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Numéro de carte</label>
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        cardNumber: formatCardNumber(e.target.value)
                      })}
                      maxLength="19"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date d'expiration</label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData({
                          ...paymentData,
                          expiryDate: formatExpiryDate(e.target.value)
                        })}
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <Input
                        type="text"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({
                          ...paymentData,
                          cvv: e.target.value.replace(/[^0-9]/g, '').substring(0, 4)
                        })}
                        maxLength="4"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nom du titulaire</label>
                    <Input
                      type="text"
                      placeholder="JOHN DOE"
                      value={paymentData.cardHolderName}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        cardHolderName: e.target.value.toUpperCase()
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Récapitulatif du paiement</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Vérifiez les informations avant de confirmer
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Réservation</h3>
                  <p>{booking.destination} - {booking.nombre_passagers} passager(s)</p>
                  <p>Départ: {new Date(booking.date_depart).toLocaleDateString()}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Paiement</h3>
                  <p>Montant: {booking.nombre_passagers * 500} EUR</p>
                  <p>Carte: **** **** **** {paymentData.cardNumber.slice(-4)}</p>
                  <p>Titulaire: {paymentData.cardHolderName}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      En cliquant sur "Confirmer le paiement", vous acceptez les conditions générales
                      et autorisez le débit de votre carte bancaire.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-primary">Paiement soumis !</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Votre paiement a été soumis et est en attente de validation par notre équipe. Vous recevrez un email de confirmation une fois validé.
            </p>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Référence de paiement:</span>
                    <Badge variant="outline">{payment.reference}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant payé:</span>
                    <span className="font-semibold">{payment.amount} {payment.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/dashboard/bookings')}>
                Voir mes réservations
              </Button>
              <Button onClick={() => navigate('/payments')} variant="outline">
                Voir mes paiements
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            {currentStep === 2 ? (
              <Button
                onClick={handlePaymentSubmit}
                disabled={processing}
                className="flex items-center gap-2"
              >
                {processing ? 'Traitement...' : 'Confirmer le paiement'}
                <CreditCard className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}