import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, CreditCard, User, Calendar, Euro } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import api from '../../lib/axios';

export default function PaymentsManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/travel/api/payments/');
      setPayments(res.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await api.post(`/travel/api/payments/${paymentId}/approve_payment/`);
      alert('Paiement approuvé avec succès');
      window.location.reload(); // Reload page
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Erreur lors de l\'approbation du paiement');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt('Motif du rejet:');
    if (!reason) return;

    try {
      await api.post(`/travel/api/payments/${paymentId}/reject_payment/`, { reason });
      alert('Paiement rejeté');
      window.location.reload(); // Reload page
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Erreur lors du rejet du paiement');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'gray',
      processing: 'yellow',
      completed: 'green',
      failed: 'red',
      cancelled: 'red'
    };

    const translations = {
      pending: 'En attente',
      processing: 'En cours de validation',
      completed: 'Validé',
      failed: 'Rejeté',
      cancelled: 'Annulé'
    };

    return (
      <Badge className={`bg-${colors[status] || 'gray'}-100 text-${colors[status] || 'gray'}-800`}>
        {translations[status] || status}
      </Badge>
    );
  };

  const getPaymentTypeBadge = (type) => {
    const translations = {
      travel_booking: 'Réservation vol',
      visa_application: 'Demande visa',
      service: 'Service'
    };

    return (
      <Badge variant="outline">
        {translations[type] || type}
      </Badge>
    );
  };

  const pendingPayments = payments.filter(p => p.status === 'processing');

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Paiements</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Validez ou rejetez les paiements soumis par les clients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente validation</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Validés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejetés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total paiements</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les paiements</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérez l'ensemble des paiements soumis par vos clients
          </p>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun paiement trouvé</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Les paiements apparaîtront ici</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-primary/30 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          payment.status === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                          payment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                          payment.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <CreditCard className={`h-6 w-6 ${
                            payment.status === 'processing' ? 'text-yellow-600 dark:text-yellow-400' :
                            payment.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                            payment.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                            'text-gray-400'
                          }`} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                            {payment.reference}
                          </span>
                          {getPaymentTypeBadge(payment.payment_type)}
                          {getStatusBadge(payment.status)}
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.user_name}
                          </p>

                          {payment.travel_booking && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📍 Réservation #{payment.booking_reference} - {payment.booking_destination}
                            </p>
                          )}

                          {payment.visa_application && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              🛂 Visa {payment.visa_application_number} - {payment.visa_type_name}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(payment.initiated_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(payment.initiated_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {payment.amount} {payment.currency}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.currency === 'EUR' ? '€' : payment.currency}
                        </div>
                      </div>

                      {(payment.status === 'processing' || payment.status === 'pending') && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePayment(payment.id)}
                            className="bg-green-600 hover:bg-green-700 gap-1 shadow-sm transform hover:scale-105 transition-transform"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectPayment(payment.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-1 transform hover:scale-105 transition-transform"
                          >
                            <XCircle className="h-4 w-4" />
                            Rejeter
                          </Button>
                        </div>
                      )}

                      {payment.status === 'completed' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          ✅ Validé
                        </Badge>
                      )}

                      {payment.status === 'failed' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          ❌ Rejeté
                        </Badge>
                      )}

                      {payment.status === 'cancelled' && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          🚫 Annulé
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}