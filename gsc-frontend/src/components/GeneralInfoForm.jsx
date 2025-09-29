import React from 'react';
import { Button } from '../components/ui/Button';
import { Plane, Users, Calendar, ArrowRight } from 'lucide-react';

// Mapping of countries to their major cities
const countryCities = {
  'Canada': 'Toronto',
  'États-Unis': 'New York',
  'France': 'Paris',
  'Royaume-Uni': 'Londres',
  'Australie': 'Sydney',
  'Allemagne': 'Berlin',
  'Maroc': 'Casablanca',
  'Japon': 'Tokyo'
};

export default function GeneralInfoForm({ formData, setFormData, onNext, villesDepart }) {
  // List of available countries for arrival
  const arrivalCountries = Object.keys(countryCities);

  // Get display text for selected country
  const getCountryDisplay = (country) => {
    if (!country) return '';
    const city = countryCities[country];
    return city ? `${country}, ${city}` : country;
  };
  return (
    <form className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in" onSubmit={e => { e.preventDefault(); onNext(); }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
          <Plane className="h-7 w-7 text-primary" />
        </span>
        <h2 className="text-2xl font-bold text-primary">Informations générales du voyage</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Ville de départ</label>
          <select
            value={formData.ville_depart || ''}
            onChange={e => setFormData({ ...formData, ville_depart: e.target.value })}
            required
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-800 transition"
          >
            <option value="">Sélectionnez une ville de départ</option>
            {villesDepart && villesDepart
              .filter(ville => ville !== formData.ville_arrivee) // Exclude arrival city
              .map(ville => (
              <option key={ville} value={ville}>{ville}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Pays d'arrivée</label>
          {formData.destination ? (
            // Pre-filled destination from URL params
            <input
              type="text"
              value={getCountryDisplay(formData.destination)}
              readOnly
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
          ) : (
            // Selector for custom destination
            <select
              value={formData.pays_arrivee || ''}
              onChange={e => {
                const selectedCountry = e.target.value;
                setFormData({
                  ...formData,
                  pays_arrivee: selectedCountry,
                  ville_arrivee: countryCities[selectedCountry] || selectedCountry
                });
              }}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-800 transition"
            >
              <option value="">Sélectionnez un pays d'arrivée</option>
              {arrivalCountries.map(country => (
                <option key={country} value={country}>
                  {getCountryDisplay(country)}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Type de voyage</label>
          <select value={formData.aller_retour ? 'retour' : 'aller'} onChange={e => setFormData({ ...formData, aller_retour: e.target.value === 'retour' })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800">
            <option value="aller">Aller simple</option>
            <option value="retour">Aller-retour</option>
          </select>
          <span className="text-xs text-gray-500 dark:text-gray-400">Choisissez si vous souhaitez un aller simple ou un aller-retour.</span>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Date de départ</label>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <input type="date" value={formData.date_depart || ''} onChange={e => setFormData({ ...formData, date_depart: e.target.value })} required className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
          </div>
        </div>
        {formData.aller_retour && (
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Date de retour</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <input type="date" value={formData.date_retour || ''} onChange={e => setFormData({ ...formData, date_retour: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
            </div>
          </div>
        )}
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Classe</label>
          <select value={formData.travel_class || 'economy'} onChange={e => setFormData({ ...formData, travel_class: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800">
            <option value="economy">Économique</option>
            <option value="business">Business</option>
            <option value="first">Première</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Nombre de passagers</label>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <input type="number" min={1} value={formData.nombre_passagers || 1} onChange={e => setFormData({ ...formData, nombre_passagers: e.target.value })} required className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <Button type="submit" className="w-full md:w-auto flex items-center gap-2 animate-bounce-on-hover">
          Suivant
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
