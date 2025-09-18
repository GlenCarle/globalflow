import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-gray-900">
      <div className="max-w-md">
        <h1 className="mb-4 text-9xl font-bold text-primary">404</h1>
        <h2 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Page non trouvée
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            <span>Retour à l'accueil</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;