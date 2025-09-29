import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../ui/Select';

const VisaApplicationStep2 = ({ formData, onChange }) => {
  const maritalStatuses = [
    { value: 'single', label: 'Célibataire' },
    { value: 'married', label: 'Marié(e)' },
    { value: 'divorced', label: 'Divorcé(e)' },
    { value: 'widowed', label: 'Veuf/Veuve' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Informations personnelles</h2>
        <p className="text-gray-600">Renseignez vos informations personnelles et familiales</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
          <CardDescription>Informations requises pour votre demande de visa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Prénom *
              </label>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) => onChange('first_name', e.target.value)}
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Nom de famille *
              </label>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => onChange('last_name', e.target.value)}
                placeholder="Votre nom de famille"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Date de naissance *
              </label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => onChange('date_of_birth', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Lieu de naissance
              </label>
              <Input
                type="text"
                value={formData.place_of_birth}
                onChange={(e) => onChange('place_of_birth', e.target.value)}
                placeholder="Ville, Pays"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Nationalité *
              </label>
              <Input
                type="text"
                value={formData.nationality}
                onChange={(e) => onChange('nationality', e.target.value)}
                placeholder="Ex: Française, Marocaine..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                État civil
              </label>
              <Select
                value={formData.marital_status}
                onValueChange={(value) => onChange('marital_status', value)}
              >
                <SelectTrigger>
                  {formData.marital_status ? maritalStatuses.find(s => s.value === formData.marital_status)?.label : 'Sélectionnez'}
                </SelectTrigger>
                <SelectContent>
                  {maritalStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.marital_status === 'married' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Nom du conjoint
              </label>
              <Input
                type="text"
                value={formData.spouse_name}
                onChange={(e) => onChange('spouse_name', e.target.value)}
                placeholder="Prénom et nom du conjoint"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Nombre d'enfants
            </label>
            <Input
              type="number"
              min="0"
              value={formData.number_of_children}
              onChange={(e) => onChange('number_of_children', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de contact</CardTitle>
          <CardDescription>Comment vous contacter pendant le processus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Adresse actuelle *
            </label>
            <textarea
              value={formData.current_address}
              onChange={(e) => onChange('current_address', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              placeholder="Votre adresse complète"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Numéro de téléphone
              </label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => onChange('phone_number', e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Adresse email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="votre@email.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations professionnelles</CardTitle>
          <CardDescription>Détails sur votre situation professionnelle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Profession actuelle
            </label>
            <Input
              type="text"
              value={formData.occupation}
              onChange={(e) => onChange('occupation', e.target.value)}
              placeholder="Ex: Étudiant, Ingénieur, Commerçant..."
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Nom de l'employeur
              </label>
              <Input
                type="text"
                value={formData.employer_name}
                onChange={(e) => onChange('employer_name', e.target.value)}
                placeholder="Nom de votre entreprise"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Revenus mensuels (€)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_income}
                onChange={(e) => onChange('monthly_income', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Adresse de l'employeur
            </label>
            <textarea
              value={formData.employer_address}
              onChange={(e) => onChange('employer_address', e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              placeholder="Adresse de votre lieu de travail"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaApplicationStep2;