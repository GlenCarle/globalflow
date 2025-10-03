import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Clock, ArrowRight, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';

export default function HistoryList({ onSelectHistory }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les transactions depuis le localStorage
    const loadTransactions = () => {
      try {
        const savedTransactions = JSON.parse(localStorage.getItem('exchangeTransactions') || '[]');
        setTransactions(savedTransactions);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
    
    // Écouter les changements dans le localStorage
    const handleStorageChange = () => loadTransactions();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminé
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Annulé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <ClockIcon className="h-3 w-3 mr-1" />
            En attente
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 dark:text-gray-400">Aucune transaction enregistrée</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
      {transactions.map((transaction) => (
        <Card 
          key={transaction.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectHistory(transaction)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {transaction.amount} {transaction.from_currency}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {transaction.amount_received.toFixed(2)} {transaction.to_currency}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>{formatDate(transaction.created_at)}</span>
                </div>
              </div>
              <div>
                {getStatusBadge(transaction.status || 'pending')}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>Réf: {transaction.id}</p>
              <p>Taux: 1 {transaction.from_currency} = {transaction.exchange_rate} {transaction.to_currency}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
