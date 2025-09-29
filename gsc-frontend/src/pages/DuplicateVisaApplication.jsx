import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CLIENT_ROUTES } from '../constants/routes';

/**
 * Page affichée lorsqu'un utilisateur essaie de créer une demande de visa dupliquée
 */
const DuplicateVisaApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMessage = location.state?.errorMessage || 'Vous avez déjà une demande en cours pour ce type de visa. Veuillez attendre la finalisation de votre demande actuelle avant d\'en créer une nouvelle.';

  const handleViewApplications = () => {
    navigate(CLIENT_ROUTES.APPLICATIONS);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-red-100 dark:border-gray-700">
          {/* Header avec icône */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Demande déjà en cours
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Action non autorisée
                </p>
              </div>
            </div>
          </div>

          {/* Message d'erreur */}
          <div className="mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Demande de visa dupliquée
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Que faire maintenant ?
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-3">
                    Vous ne pouvez pas créer une nouvelle demande pour le même type de visa tant que votre demande actuelle n'est pas finalisée.
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Consultez vos demandes existantes pour suivre l'état de votre demande en cours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleViewApplications}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <FileText className="h-4 w-4" />
              Voir mes demandes
            </Button>
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateVisaApplication;