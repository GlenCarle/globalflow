import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { PUBLIC_ROUTES } from '../constants/routes';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Accès non autorisé
        </h2>
        
        <p className="mt-2 text-sm text-gray-600">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          Veuillez contacter un administrateur si vous pensez qu'il s'agit d'une erreur.
        </p>
        
        <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <Button
            onClick={() => navigate(PUBLIC_ROUTES.HOME)}
            className="w-full sm:w-auto"
          >
            <Home className="h-4 w-4 mr-2" />
            Page d'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
