import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { CreditCard, Eye, Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/travel/api/payments/');
        setPayments(res.data);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Erreur lors du chargement des paiements');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
      refunded: 'purple'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'En attente',
      processing: 'En cours',
      completed: 'Terminé',
      failed: 'Échec',
      cancelled: 'Annulé',
      refunded: 'Remboursé'
    };
    return texts[status] || status;
  };

  const getPaymentTypeText = (type) => {
    const texts = {
      travel_booking: 'Réservation de vol',
      visa_application: 'Demande de visa',
      service: 'Service'
    };
    return texts[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Mes paiements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Historique de tous vos paiements
          </p>
        </div>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun paiement trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Vous n'avez encore effectué aucun paiement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {payment.reference}
                    </TableCell>
                    <TableCell>
                      {getPaymentTypeText(payment.payment_type)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {payment.description}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {payment.amount} {payment.currency}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(payment.status)}
                        className="capitalize"
                      >
                        {getStatusText(payment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(payment.initiated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1"
                            title="Télécharger le reçu"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Statistics */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">
                {payments.filter(p => p.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Paiements réussis
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {payments.filter(p => p.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                En attente
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)} €
              </div>
              <p className="text-xs text-muted-foreground">
                Total payé
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {payments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Total paiements
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}