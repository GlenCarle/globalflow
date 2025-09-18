import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import ResetPasswordForm from '../../components/forms/ResetPasswordForm';
import api from '../../lib/axios';
import { PUBLIC_ROUTES } from '../../constants/routes';

/**
 * Reset password page component
 */
const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const location = useLocation();

  // Extract token from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      // Verify token validity
      verifyToken(tokenParam);
    } else {
      setIsTokenValid(false);
      setTokenError('Token de réinitialisation manquant ou invalide');
    }
  }, [location]);

  // Verify token validity
  const verifyToken = async (tokenValue) => {
    try {
      await api.post('/auth/verify-reset-token/', { token: tokenValue });
      setIsTokenValid(true);
    } catch (error) {
      console.error('Token verification error:', error);
      setIsTokenValid(false);
      setTokenError('Le lien de réinitialisation est invalide ou a expiré');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary">GSC</h1>
          <h2 className="mt-1 text-xl font-semibold text-gray-800 dark:text-gray-200">
            Global Service Corporation
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Réinitialisation du mot de passe</CardTitle>
            <CardDescription>
              Créez un nouveau mot de passe pour votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isTokenValid ? (
              <div className="space-y-4">
                <Alert
                  variant="destructive"
                  title="Lien invalide"
                  description={tokenError}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Veuillez demander un nouveau lien de réinitialisation de mot de passe.
                </p>
                <Link to={PUBLIC_ROUTES.FORGOT_PASSWORD}>
                  <Button className="w-full">
                    Demander un nouveau lien
                  </Button>
                </Link>
              </div>
            ) : (
              <ResetPasswordForm token={token} />
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <Link
                to={PUBLIC_ROUTES.LOGIN}
                className="inline-flex items-center font-medium text-primary hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Retour à la page de connexion
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;