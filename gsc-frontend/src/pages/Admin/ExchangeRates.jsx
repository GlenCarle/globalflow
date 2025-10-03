import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/Dialog';
import { Badge } from '../../components/ui/Badge';
import { Plus, Edit, Trash2, Calculator } from 'lucide-react';
import api from '../../lib/axios';

const currencies = [
  { value: 'XAF', label: 'Franc CFA (XAF)' },
  { value: 'USD', label: 'Dollar américain (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'CAD', label: 'Dollar canadien (CAD)' },
  { value: 'GBP', label: 'Livre sterling (GBP)' },
  { value: 'CHF', label: 'Franc suisse (CHF)' },
  { value: 'JPY', label: 'Yen japonais (JPY)' },
  { value: 'CNY', label: 'Yuan chinois (CNY)' },
  { value: 'NGN', label: 'Naira nigérian (NGN)' },
  { value: 'GHS', label: 'Cedi ghanéen (GHS)' },
  { value: 'ZAR', label: 'Rand sud-africain (ZAR)' },
];

const ExchangeRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    from_currency: '',
    to_currency: '',
    rate: '',
    fee_percentage: '2.0',
    fee_fixed: '0.00'
  });

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/travel/exchange-rates/');
      setRates(response.data);
    } catch (error) {
      console.error('Error loading rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        rate: parseFloat(formData.rate),
        fee_percentage: parseFloat(formData.fee_percentage),
        fee_fixed: parseFloat(formData.fee_fixed)
      };

      if (editingRate) {
        await api.put(`/travel/exchange-rates/${editingRate.id}/`, data);
      } else {
        await api.post('/travel/exchange-rates/', data);
      }

      setShowDialog(false);
      setEditingRate(null);
      resetForm();
      loadRates();
    } catch (error) {
      console.error('Error saving rate:', error);
      alert('Erreur lors de la sauvegarde du taux');
    }
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      from_currency: rate.from_currency,
      to_currency: rate.to_currency,
      rate: rate.rate.toString(),
      fee_percentage: rate.fee_percentage.toString(),
      fee_fixed: rate.fee_fixed.toString()
    });
    setShowDialog(true);
  };

  const handleDelete = async (rateId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce taux ?')) {
      try {
        await api.delete(`/travel/exchange-rates/${rateId}/`);
        loadRates();
      } catch (error) {
        console.error('Error deleting rate:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      from_currency: '',
      to_currency: '',
      rate: '',
      fee_percentage: '2.0',
      fee_fixed: '0.00'
    });
  };

  const openAddDialog = () => {
    setEditingRate(null);
    resetForm();
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des taux de change</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configurez les taux de change pour les échanges de devise
          </p>
        </div>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau taux
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Taux actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calculator className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {rates.filter(r => r.is_active).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Paires de devises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold">{rates.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Devises supportées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                {new Set(rates.flatMap(r => [r.from_currency, r.to_currency])).size}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de change</CardTitle>
          <CardDescription>
            Liste de tous les taux de change configurés
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
                  <TableHead>Devises</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Frais (%)</TableHead>
                  <TableHead>Frais fixe</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{rate.from_currency}</Badge>
                        <span>→</span>
                        <Badge variant="outline">{rate.to_currency}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{rate.rate}</TableCell>
                    <TableCell>{rate.fee_percentage}%</TableCell>
                    <TableCell>{rate.fee_fixed} {rate.to_currency}</TableCell>
                    <TableCell>
                      <Badge variant={rate.is_active ? 'success' : 'secondary'}>
                        {rate.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(rate.updated_at || rate.valid_from).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rate.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRate ? 'Modifier le taux' : 'Nouveau taux de change'}
            </DialogTitle>
            <DialogDescription>
              Configurez les paramètres du taux de change
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Devise source</label>
                <Select
                  value={formData.from_currency}
                  onValueChange={(value) => setFormData({...formData, from_currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Devise cible</label>
                <Select
                  value={formData.to_currency}
                  onValueChange={(value) => setFormData({...formData, to_currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Taux de change</label>
              <Input
                type="number"
                step="0.000001"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                placeholder="Ex: 0.0015"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Frais (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.fee_percentage}
                  onChange={(e) => setFormData({...formData, fee_percentage: e.target.value})}
                  placeholder="Ex: 2.0"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Frais fixe</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.fee_fixed}
                  onChange={(e) => setFormData({...formData, fee_fixed: e.target.value})}
                  placeholder="Ex: 0.00"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {editingRate ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExchangeRates;