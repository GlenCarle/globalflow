import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="bg-yellow-100 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900">
          Accès non autorisé
        </h1>
        
        <p className="mt-4 text-lg text-gray-600">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
        
        <p className="text-sm text-gray-500">
          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur.
        </p>
        
        <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
            size="lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à la page précédente
          </Button>
          
          <Button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full sm:w-auto"
            size="lg"
          >
            <Home className="h-5 w-5 mr-2" />
            Page d'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
