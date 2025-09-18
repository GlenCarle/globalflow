import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import LoginForm from '../../components/forms/LoginForm';
import { PUBLIC_ROUTES } from '../../constants/routes';

/**
 * Login page component
 */
const Login = () => {
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
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connectez-vous à votre compte pour accéder à votre espace personnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Vous n'avez pas de compte ?{' '}
              </span>
              <Link
                to={PUBLIC_ROUTES.REGISTER}
                className="font-medium text-primary hover:underline"
              >
                Créer un compte
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;