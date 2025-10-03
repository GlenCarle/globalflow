import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { CheckCircle, XCircle, Clock, Eye, Download, Search, Filter } from 'lucide-react';
import api from '../../lib/axios';

const CurrencyExchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');

  useEffect(() => {
    loadExchanges();
  }, []);

  const loadExchanges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/travel/api/currency-exchanges/');
      setExchanges(response.data);
    } catch (error) {
      console.error('Error loading exchanges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleStatusChange = async (exchangeId, newStatus) => {
    try {
      await api.post(`/travel/api/currency-exchanges/${exchangeId}/change_status/`, {
        status: newStatus,
        notes: statusUpdateNotes
      });
      setStatusUpdateNotes('');
      loadExchanges();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDownloadReceipt = async (exchange) => {
    try {
      const response = await api.get(`/travel/api/currency-exchanges/${exchange.id}/generate_pdf/`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exchange_receipt_${exchange.reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Erreur lors du téléchargement du reçu');
    }
  };

  const filteredExchanges = exchanges.filter(exchange => {
    const matchesStatus = statusFilter === 'all' || exchange.status === statusFilter;
    const matchesSearch = exchange.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exchange.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En cours' },
    { value: 'completed', label: 'Terminé' },
    { value: 'cancelled', label: 'Annulé' },
    { value: 'rejected', label: 'Refusé' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des échanges de devise</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez les demandes d'échange de devise de vos clients
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par référence ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {exchanges.filter(e => e.status === 'pending').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {exchanges.filter(e => e.status === 'processing').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Terminés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {exchanges.filter(e => e.status === 'completed').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold">{exchanges.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchanges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes d'échange</CardTitle>
          <CardDescription>
            {filteredExchanges.length} demande(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Devises</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExchanges.map((exchange) => (
                  <TableRow key={exchange.id}>
                    <TableCell className="font-medium">{exchange.reference}</TableCell>
                    <TableCell>{exchange.user_name}</TableCell>
                    <TableCell>
                      {exchange.amount_sent} {exchange.from_currency}
                    </TableCell>
                    <TableCell>
                      {exchange.from_currency} → {exchange.to_currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(exchange.status)}>
                        {exchange.status_display}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(exchange.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedExchange(exchange);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {exchange.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(exchange)}
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
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Détails de l'échange - {selectedExchange?.reference}</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande d'échange
            </DialogDescription>
          </DialogHeader>

          {selectedExchange && (
            <div className="space-y-6">
              {/* Exchange Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <p className="text-sm text-gray-600">{selectedExchange.user_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <Badge variant={getStatusVariant(selectedExchange.status)} className="mt-1">
                    {selectedExchange.status_display}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Montant envoyé</label>
                  <p className="text-sm text-gray-600">
                    {selectedExchange.amount_sent} {selectedExchange.from_currency}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Montant reçu</label>
                  <p className="text-sm text-gray-600">
                    {selectedExchange.amount_received} {selectedExchange.to_currency}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Taux appliqué</label>
                  <p className="text-sm text-gray-600">{selectedExchange.exchange_rate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Frais</label>
                  <p className="text-sm text-gray-600">
                    {selectedExchange.fee_amount} {selectedExchange.to_currency}
                  </p>
                </div>
              </div>

              {/* Reception Details */}
              <div>
                <label className="text-sm font-medium">Mode de réception</label>
                <p className="text-sm text-gray-600">{selectedExchange.reception_method_display}</p>

                {selectedExchange.reception_method === 'agency_pickup' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Agence: {selectedExchange.pickup_agency}
                  </p>
                )}

                {selectedExchange.reception_method === 'bank_transfer' && (
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Banque: {selectedExchange.bank_name}</p>
                    <p>Titulaire: {selectedExchange.account_holder_name}</p>
                    <p>IBAN: {selectedExchange.iban}</p>
                  </div>
                )}

                {selectedExchange.reception_method === 'mobile_money' && (
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Opérateur: {selectedExchange.mobile_operator}</p>
                    <p>Numéro: {selectedExchange.mobile_number}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedExchange.client_notes && (
                <div>
                  <label className="text-sm font-medium">Notes client</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedExchange.client_notes}</p>
                </div>
              )}

              {selectedExchange.internal_notes && (
                <div>
                  <label className="text-sm font-medium">Notes internes</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedExchange.internal_notes}</p>
                </div>
              )}

              {/* Status Update */}
              {selectedExchange.status !== 'completed' && selectedExchange.status !== 'cancelled' && selectedExchange.status !== 'rejected' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Mettre à jour le statut</label>
                    <Textarea
                      placeholder="Notes pour la mise à jour..."
                      value={statusUpdateNotes}
                      onChange={(e) => setStatusUpdateNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    {selectedExchange.status === 'pending' && (
                      <Button
                        onClick={() => handleStatusChange(selectedExchange.id, 'processing')}
                        className="flex items-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Marquer en cours
                      </Button>
                    )}

                    {selectedExchange.status === 'processing' && (
                      <Button
                        onClick={() => handleStatusChange(selectedExchange.id, 'completed')}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Marquer comme effectué
                      </Button>
                    )}

                    {(selectedExchange.status === 'pending' || selectedExchange.status === 'processing') && (
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusChange(selectedExchange.id, 'rejected')}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Refuser
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CurrencyExchanges;