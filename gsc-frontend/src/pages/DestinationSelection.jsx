import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';

const DestinationSelection = () => {
  const destinations = [
    { name: 'Canada', image: 'https://images.unsplash.com/photo-1569681157442-5eabf7fe850e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { name: 'États-Unis', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80' },
    { name: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80' },
    { name: 'Royaume-Uni', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { name: 'Australie', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1530&q=80' },
    { name: 'Allemagne', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { name: 'Maroc', image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d0b7ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { name: 'Japon', image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { name: 'Autre destination', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1174&q=80', isOther: true },
  ];

  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Exemple de détails pays (à remplacer par API ou données réelles)
  const countryDetails = {
    'Canada': {
      duree: '7-21 jours',
      prerequis: 'Passeport, Visa, Assurance',
      description: 'Voyage au Canada pour études, travail ou tourisme.',
      visa: 'Visa requis pour séjour > 6 mois',
      cout: 'À partir de 800€',
      conseils: 'Prévoir une assurance santé et vérifier les conditions d\'entrée.',
      lien: 'https://www.canada.ca/fr/immigration-refugies-citoyennete/services/visiter-canada.html',
    },
    'États-Unis': {
      duree: '5-14 jours',
      prerequis: 'Passeport, Visa',
      description: 'Voyage aux USA pour études, travail ou tourisme.',
      visa: 'Visa requis (ESTA possible pour courts séjours)',
      cout: 'À partir de 900€',
      conseils: 'Vérifier la validité du passeport et les exigences ESTA.',
      lien: 'https://fr.usembassy.gov/fr/visas-fr/',
    },
    'France': {
      duree: '3-10 jours',
      prerequis: 'Passeport, Visa',
      description: 'Voyage en France pour études, travail ou tourisme.',
      visa: 'Visa requis selon nationalité',
      cout: 'À partir de 700€',
      conseils: 'Prévoir justificatifs d\'hébergement et de ressources.',
      lien: 'https://france-visas.gouv.fr/',
    },
    'Royaume-Uni': {
      duree: '5-15 jours',
      prerequis: 'Passeport, Visa',
      description: 'Voyage au Royaume-Uni pour études, travail ou tourisme.',
      visa: 'Visa requis',
      cout: 'À partir de 850€',
      conseils: 'Vérifier les conditions post-Brexit.',
      lien: 'https://www.gov.uk/browse/visas-immigration',
    },
    'Australie': {
      duree: '10-20 jours',
      prerequis: 'Passeport, Visa, Assurance',
      description: 'Voyage en Australie pour études, travail ou tourisme.',
      visa: 'Visa requis (eVisitor possible)',
      cout: 'À partir de 1200€',
      conseils: 'Prévoir une assurance santé et vérifier les vaccins.',
      lien: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing',
    },
    'Allemagne': {
      duree: '4-12 jours',
      prerequis: 'Passeport, Visa',
      description: 'Voyage en Allemagne pour études, travail ou tourisme.',
      visa: 'Visa requis selon nationalité',
      cout: 'À partir de 650€',
      conseils: 'Prévoir justificatifs d\'hébergement et de ressources.',
      lien: 'https://www.germany-visa.org/fr/',
    },
    'Maroc': {
      duree: '3-10 jours',
      prerequis: 'Passeport, Visa',
      description: 'Voyage au Maroc pour études, travail ou tourisme.',
      visa: 'Visa requis selon nationalité',
      cout: 'À partir de 400€',
      conseils: 'Prévoir une assurance santé et vérifier les conditions d\'entrée.',
      lien: 'https://france-maroc.ma/',
    },
    'Japon': {
      duree: '5-15 jours',
      prerequis: 'Passeport, Visa',
      description: 'Voyage au Japon pour études, travail ou tourisme.',
      visa: 'Visa requis',
      cout: 'À partir de 1000€',
      conseils: 'Prévoir une assurance santé et vérifier les vaccins.',
      lien: 'https://fr.emb-japan.go.jp/',
    },
    'Autre destination': {
      duree: 'Variable',
      prerequis: 'Selon la destination',
      description: 'Choisissez votre destination personnalisée.',
      visa: 'Selon la destination choisie',
      cout: 'Variable',
      conseils: 'Contactez-nous pour plus d\'informations.',
      lien: '#',
    },
  };

  const handleDestinationClick = (destination) => {
    setSelectedDestination(destination);
    setShowModal(true);
  };

  const handleStartProcedure = () => {
    setShowModal(false);
    if (selectedDestination.isOther) {
      navigate('/book');
    } else {
      navigate(`/book?destination=${selectedDestination.name}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choisissez votre destination</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Découvrez nos destinations populaires et commencez votre procédure de réservation
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {destinations.map((destination, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg cursor-pointer"
            onClick={() => handleDestinationClick(destination)}
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={destination.image}
                alt={destination.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <h3 className="text-xl font-bold text-white">{destination.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pays */}
      {showModal && selectedDestination && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 bg-opacity-80' : 'bg-black bg-opacity-50'}`}>
          <div className={`rounded-lg shadow-lg max-w-md w-full p-6 relative ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-2">{selectedDestination.name}</h2>
            <img src={selectedDestination.image} alt={selectedDestination.name} className="w-full h-40 object-cover rounded mb-4" />
            <p className="mb-2"><strong>Description :</strong> {countryDetails[selectedDestination.name]?.description}</p>
            <p className="mb-2"><strong>Durée estimée :</strong> {countryDetails[selectedDestination.name]?.duree}</p>
            <p className="mb-2"><strong>Prérequis :</strong> {countryDetails[selectedDestination.name]?.prerequis}</p>
            <p className="mb-2"><strong>Visa :</strong> {countryDetails[selectedDestination.name]?.visa}</p>
            <p className="mb-2"><strong>Coût estimé :</strong> {countryDetails[selectedDestination.name]?.cout}</p>
            <p className="mb-2"><strong>Conseils :</strong> {countryDetails[selectedDestination.name]?.conseils}</p>
            <a href={countryDetails[selectedDestination.name]?.lien} target="_blank" rel="noopener noreferrer" className="text-primary underline mb-2 block">En savoir plus sur la procédure</a>
            <Button className="w-full mt-4" onClick={handleStartProcedure}>Démarrer la procédure de réservation</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationSelection;