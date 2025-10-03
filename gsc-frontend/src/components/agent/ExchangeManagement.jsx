import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';
import { toast } from '../ui/use-toast';

const ExchangeManagement = () => {
  const { user, api } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [filters, setFilters] = useState({
    status: 'pending',
    dateFrom: '',
    dateTo: ''
  });

  const statusVariant = {
    draft: 'secondary',
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    cancelled: 'destructive',
    rejected: 'destructive'
  };

  useEffect(() => {
    fetchExchanges();
  }, [filters]);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);

      const response = await api.get(`/travel/api/currency-exchanges/?${params.toString()}`);
      setExchanges(response.data);
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes d\'échange',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openDialog = (exchange, actionType) => {
    setSelectedExchange(exchange);
    setAction(actionType);
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedExchange || !action) return;

    try {
      setIsProcessing(true);

      let newStatus = '';
      switch (action) {
        case 'approve':
          newStatus = 'processing';
          break;
        case 'complete':
          newStatus = 'completed';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'cancel':
          newStatus = 'cancelled';
          break;
        case 'view':
          return;
        default:
          return;
      }

      await api.put(`/travel/api/currency-exchanges/${selectedExchange.id}/change_status/`, {
        status: newStatus,
        notes
      });

      toast({
        title: 'Succès',
        description: `La demande a été ${action === 'approve' ? 'approuvée' : action === 'complete' ? 'marquée comme terminée' : action === 'cancel' ? 'annulée' : 'rejetée'} avec succès`,
      });

      setIsDialogOpen(false);
      fetchExchanges();
    } catch (error) {
      console.error('Error updating exchange status:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du statut',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPPp', { locale: fr });
  };

  const getStatusBadge = (status) => {
    return (
      <Badge variant={statusVariant[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getActionButtons = (exchange) => {
    const viewButton = (
      <Button
        size="sm"
        variant="outline"
        onClick={() => openDialog(exchange, 'view')}
        title="Voir les détails"
        className="ml-2"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </Button>
    );

    if (exchange.status === 'pending') {
      return (
        <div className="flex items-center justify-end space-x-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => openDialog(exchange, 'approve')}
          >
            Approuver
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => openDialog(exchange, 'reject')}
          >
            Rejeter
          </Button>
          {viewButton}
        </div>
      );
    } else if (exchange.status === 'processing') {
      return (
        <div className="flex items-center justify-end space-x-2">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => openDialog(exchange, 'complete')}
          >
            Terminer
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            onClick={() => openDialog(exchange, 'cancel')}
          >
            Annuler
          </Button>
          {viewButton}
        </div>
      );
    } else if (exchange.status === 'completed') {
      return (
        <div className="flex items-center justify-end space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
            onClick={() => window.open(`/travel/api/currency-exchanges/${exchange.id}/generate_pdf/`, '_blank')}
          >
            Reçu
          </Button>
          {viewButton}
        </div>
      );
    } else if (exchange.status === 'rejected' || exchange.status === 'cancelled') {
      return (
        <div className="flex items-center justify-end space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            exchange.status === 'rejected'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
          }`}>
            {exchange.status === 'rejected' ? 'Rejetée' : 'Annulée'}
          </span>
          {viewButton}
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-end">
          {viewButton}
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des demandes d'échange</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                placeholder="Date de début"
              />
            </div>
            <div>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                placeholder="Date de fin"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exchanges.map(exchange => (
              <TableRow key={exchange.id}>
                <TableCell>{exchange.id}</TableCell>
                <TableCell>{formatDate(exchange.created_at)}</TableCell>
                <TableCell>{getStatusBadge(exchange.status)}</TableCell>
                <TableCell>{getActionButtons(exchange)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Notes et action</DialogTitle>
            <DialogDescription>
              {action === 'view' ? 'Voir les détails de la demande' : `Confirmer l'action ${action}`}
            </DialogDescription>
          </DialogHeader>
          {action !== 'view' && (
            <div className="mb-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Entrez vos notes"
                rows={3}
                className="w-full"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              disabled={isProcessing}
            >
              {isProcessing ? 'Traitement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExchangeManagement;
