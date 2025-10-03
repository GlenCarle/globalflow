import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { toast } from '../ui/use-toast';

const ExchangeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const statusVariant = {
    draft: 'secondary',
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    cancelled: 'destructive',
    rejected: 'destructive'
  };

  useEffect(() => {
    const fetchExchangeDetails = async () => {
      try {
        setLoading(true);
        const [exchangeRes, historyRes] = await Promise.all([
          api.get(`/travel/api/currency-exchanges/${id}/`),
          api.get(`/travel/api/currency-exchanges/${id}/history/`)
        ]);
        
        setExchange(exchangeRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error('Error fetching exchange details:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails de l\'échange',
          variant: 'destructive',
        });
        navigate('/dashboard/exchange');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeDetails();
  }, [id, navigate, api]);

  const handleCancel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette demande d\'échange ? Cette action est irréversible.')) {
      return;
    }

    try {
      setIsCancelling(true);
      await api.put(`/travel/api/currency-exchanges/${id}/change_status/`, {
        status: 'cancelled',
        notes: 'Annulé par le client'
      });
      
      toast({
        title: 'Succès',
        description: 'La demande d\'échange a été annulée avec succès',
      });
      
      // Refresh the data
      const [exchangeRes, historyRes] = await Promise.all([
        api.get(`/travel/api/currency-exchanges/${id}/`),
        api.get(`/travel/api/currency-exchanges/${id}/history/`)
      ]);
      
      setExchange(exchangeRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Error cancelling exchange:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'annulation de la demande',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true);
      const response = await api.get(`/travel/api/currency-exchanges/${id}/generate_pdf/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reçu-échange-${exchange.reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le reçu',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPPp', { locale: fr });
  };

  if (loading || !exchange) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isClient = user.role === 'client';
  const canCancel = isClient && ['draft', 'pending'].includes(exchange.status);
  const canDownloadReceipt = ['completed', 'processing'].includes(exchange.status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Détails de l'échange</h1>
          <p className="text-muted-foreground">
            Référence: {exchange.reference} | Créé le {formatDate(exchange.created_at)}
          </p>
        </div>
        <div className="flex space-x-2">
          {canDownloadReceipt && (
            <Button 
              variant="outline" 
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
            >
              {isDownloading ? 'Téléchargement...' : 'Télécharger le reçu'}
            </Button>
          )}
          {canCancel && (
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Annulation...' : 'Annuler la demande'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Détails de l'échange */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'échange</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={statusVariant[exchange.status] || 'default'}>
                {exchange.status_display}
              </Badge>
              {exchange.assigned_agent_name && (
                <span className="text-sm text-muted-foreground">
                  Agent: {exchange.assigned_agent_name}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant à échanger</span>
              <span className="font-medium">
                {exchange.amount_sent} {exchange.from_currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taux de change</span>
              <span className="font-medium">
                1 {exchange.from_currency} = {exchange.exchange_rate} {exchange.to_currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais</span>
              <span className="font-medium">
                {exchange.fee_amount} {exchange.to_currency} ({exchange.fee_percentage}%)
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Montant net à recevoir</span>
                <span>
                  {exchange.amount_received} {exchange.to_currency}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations de réception */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de réception</CardTitle>
            <CardDescription>Moyen de réception sélectionné</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Méthode de réception</p>
              <p className="font-medium">{exchange.reception_method_display}</p>
            </div>

            {exchange.reception_method === 'bank_transfer' && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Banque</p>
                  <p className="font-medium">{exchange.bank_name || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Titulaire du compte</p>
                  <p className="font-medium">{exchange.account_holder_name || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IBAN/RIB</p>
                  <p className="font-mono text-sm">{exchange.iban || 'Non spécifié'}</p>
                </div>
                {exchange.bic && (
                  <div>
                    <p className="text-sm text-muted-foreground">BIC/SWIFT</p>
                    <p className="font-mono text-sm">{exchange.bic}</p>
                  </div>
                )}
              </>
            )}

            {exchange.reception_method === 'mobile_money' && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Opérateur</p>
                  <p className="font-medium">{exchange.mobile_operator || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Numéro</p>
                  <p className="font-medium">{exchange.mobile_number || 'Non spécifié'}</p>
                </div>
              </>
            )}

            {exchange.reception_method === 'agency_pickup' && (
              <div>
                <p className="text-sm text-muted-foreground">Agence de retrait</p>
                <p className="font-medium">{exchange.pickup_agency || 'Agence principale'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations client */}
        <Card>
          <CardHeader>
            <CardTitle>Informations client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nom complet</p>
              <p className="font-medium">{exchange.user_name}</p>
            </div>
            {exchange.client_phone && (
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{exchange.client_phone}</p>
              </div>
            )}
            {exchange.client_email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{exchange.client_email}</p>
              </div>
            )}
            {!isClient && exchange.internal_notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Notes internes</p>
                <p className="text-sm whitespace-pre-line">{exchange.internal_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des actions</CardTitle>
          <CardDescription>Chronologie des modifications de statut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
            <div className="space-y-6">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <div key={index} className="relative flex items-start">
                    <div className="absolute left-4 h-2 w-2 rounded-full bg-primary -translate-x-1/2 mt-2"></div>
                    <div className="ml-10 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{item.action_display}</p>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(item.performed_at)}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      )}
                      <p className="text-sm">
                        Par {item.performed_by_name || 'Système'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Aucun historique disponible
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeDetails;
