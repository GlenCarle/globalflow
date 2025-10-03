import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

const ExchangeHistory = () => {
  const { user, api } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
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
      
      const queryString = params.toString();
      const url = `/travel/api/currency-exchanges/${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      setExchanges(response.data);
    } catch (error) {
      console.error('Error fetching exchange history:', error);
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Historique des échanges</CardTitle>
            <Button onClick={fetchExchanges} disabled={loading}>
              Rafraîchir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Statut</label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Du</label>
              <Input 
                type="date" 
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Au</label>
              <Input 
                type="date" 
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                min={filters.dateFrom}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : exchanges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun échange trouvé
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant reçu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exchanges.map((exchange) => (
                    <TableRow key={exchange.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{exchange.reference}</TableCell>
                      <TableCell>{formatDate(exchange.created_at)}</TableCell>
                      <TableCell>
                        {exchange.amount_sent} {exchange.from_currency}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(exchange.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {exchange.amount_received} {exchange.to_currency}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeHistory;
