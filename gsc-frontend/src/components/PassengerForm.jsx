import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { UserPlus, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../lib/axios';

export default function PassengerForm({ bookingId, passengers, setPassengers, onNext, onPrev }) {
  const [newPassenger, setNewPassenger] = useState({
    nom: '', prenom: '', date_naissance: '', sexe: '', nationalite: '', numero_passeport: '', expiration_passeport: ''
  });

  // Load existing passengers from booking draft data when component mounts
  useEffect(() => {
    const loadPassengers = async () => {
      if (bookingId && passengers.length === 0) {
        try {
          const res = await api.get(`/travel/api/travel-bookings/${bookingId}/`);
          if (res.data.draft_passengers) {
            setPassengers(res.data.draft_passengers);
          }
        } catch (error) {
          console.error('Error loading booking data:', error);
        }
      }
    };
    loadPassengers();
  }, [bookingId, passengers.length, setPassengers]);

  const handleAdd = () => {
    // Add passenger to local state only - will be saved when booking is submitted
    setPassengers([...passengers, { ...newPassenger, id: Date.now() }]); // Temporary ID
    setNewPassenger({ nom: '', prenom: '', date_naissance: '', sexe: '', nationalite: '', numero_passeport: '', expiration_passeport: '' });
  };

  const handleRemove = (index) => {
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  return (
    <form className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-800 animate-fade-in" onSubmit={e => e.preventDefault()}>
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
          <UserPlus className="h-7 w-7 text-primary" />
        </span>
        <h2 className="text-2xl font-bold text-primary">Informations des passagers</h2>
      </div>
      <div className="mb-4">
        {passengers.length > 0 && (
          <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Passagers ajoutés :</div>
        )}
        {passengers.map((p, idx) => (
          <div key={p.id || idx} className="mb-2 px-3 py-2 rounded bg-blue-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow flex justify-between items-center">
            <span>{p.nom} {p.prenom} - {p.numero_passeport}</span>
            <button
              onClick={() => handleRemove(idx)}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Nom</label>
          <input type="text" value={newPassenger.nom} onChange={e => setNewPassenger({ ...newPassenger, nom: e.target.value })} required placeholder="Nom" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Prénom</label>
          <input type="text" value={newPassenger.prenom} onChange={e => setNewPassenger({ ...newPassenger, prenom: e.target.value })} required placeholder="Prénom" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Date de naissance</label>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <input type="date" value={newPassenger.date_naissance} onChange={e => setNewPassenger({ ...newPassenger, date_naissance: e.target.value })} required className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Sexe</label>
          <select value={newPassenger.sexe} onChange={e => setNewPassenger({ ...newPassenger, sexe: e.target.value })} required className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800">
            <option value="">Sélectionner</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Nationalité</label>
          <input type="text" value={newPassenger.nationalite} onChange={e => setNewPassenger({ ...newPassenger, nationalite: e.target.value })} required placeholder="Nationalité" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Numéro de passeport</label>
          <input type="text" value={newPassenger.numero_passeport} onChange={e => setNewPassenger({ ...newPassenger, numero_passeport: e.target.value })} required placeholder="Numéro de passeport" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Expiration passeport</label>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <input type="date" value={newPassenger.expiration_passeport} onChange={e => setNewPassenger({ ...newPassenger, expiration_passeport: e.target.value })} required className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-8">
        {onPrev && (
          <Button type="button" onClick={onPrev} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
        )}
        <Button type="button" onClick={handleAdd} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Ajouter le passager
        </Button>
        <Button type="button" onClick={onNext} className="flex items-center gap-2">
          Suivant <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
