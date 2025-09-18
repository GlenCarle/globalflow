import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import ForgotPasswordForm from '../../components/forms/ForgotPasswordForm';
import { PUBLIC_ROUTES } from '../../constants/routes';

/**
 * Forgot password page component
 */
const ForgotPassword = () => {
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
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>
              Saisissez votre adresse email pour réinitialiser votre mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
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

export default ForgotPassword;