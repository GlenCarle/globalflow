import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign } from 'lucide-react';
import ExchangeHistory from '../components/currency/ExchangeHistory';
import { CLIENT_ROUTES } from '../constants/routes';

const CurrencyExchangesPage = () => {
  return (
    <div className="space-y-6 p-1 md:p-0">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to={CLIENT_ROUTES.DASHBOARD}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour au tableau de bord
                </Button>
              </Link>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Mes échanges de devise
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Consultez l'historique de vos demandes d'échange de monnaie
                </p>
              </div>
            </div>
            <Link to="/currency-exchange">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvel échange
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Exchange History */}
      <ExchangeHistory />
    </div>
  );
};

export default CurrencyExchangesPage;