import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import ProfileForm from '../../components/forms/ProfileForm';
import ChangePasswordForm from '../../components/forms/ChangePasswordForm';

/**
 * User profile page component
 */
const Profile = () => {
  return (
    <div className="space-y-6 p-1 md:p-0">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Mon Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Changer de mot de passe</CardTitle>
            <CardDescription>
              Mettez à jour votre mot de passe pour sécuriser votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité du compte</CardTitle>
            <CardDescription>
              Paramètres de sécurité et de confidentialité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4 rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <div className="mt-0.5 rounded-full bg-amber-100 p-1 dark:bg-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  Authentification à deux facteurs
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sécurisez votre compte avec l'authentification à deux facteurs.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Activer
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-4 rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <div className="mt-0.5 rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  Historique des connexions
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Consultez l'historique des connexions à votre compte.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Voir l'historique
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
            <CardDescription>
              Personnalisez votre expérience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  defaultChecked
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recevoir des notifications par email
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                Recevez des mises à jour sur vos demandes et rendez-vous
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  defaultChecked
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recevoir des notifications par SMS
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                Recevez des alertes importantes par SMS
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recevoir la newsletter
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                Restez informé des dernières actualités et offres
              </p>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm">
                Enregistrer les préférences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;