import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../ui/Select';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import axios from '../../lib/axios';

const VisaApplicationStep1 = ({ formData, onChange, visaTypes, countries }) => {
  // Données liées pour pays, villes et nationalités (même structure que l'assistant)
  const countriesData = [
    {
      id: 'france',
      name: 'France',
      cities: [
        { id: 'paris', name: 'Paris' },
        { id: 'lyon', name: 'Lyon' },
        { id: 'marseille', name: 'Marseille' },
        { id: 'toulouse', name: 'Toulouse' },
        { id: 'nice', name: 'Nice' },
        { id: 'nantes', name: 'Nantes' },
        { id: 'strasbourg', name: 'Strasbourg' },
        { id: 'montpellier', name: 'Montpellier' },
        { id: 'bordeaux', name: 'Bordeaux' },
        { id: 'lille', name: 'Lille' }
      ],
      nationalities: [
        { id: 'french', name: 'Française' },
        { id: 'algerian', name: 'Algérienne' },
        { id: 'moroccan', name: 'Marocaine' },
        { id: 'tunisian', name: 'Tunisienne' },
        { id: 'senegalese', name: 'Sénégalaise' },
        { id: 'ivorian', name: 'Ivoirienne' },
        { id: 'malian', name: 'Malienne' },
        { id: 'congolese', name: 'Congolaise' },
        { id: 'cameroonian', name: 'Camerounaise' },
        { id: 'other', name: 'Autre' }
      ]
    },
    {
      id: 'canada',
      name: 'Canada',
      cities: [
        { id: 'toronto', name: 'Toronto' },
        { id: 'montreal', name: 'Montréal' },
        { id: 'vancouver', name: 'Vancouver' },
        { id: 'calgary', name: 'Calgary' },
        { id: 'ottawa', name: 'Ottawa' },
        { id: 'edmonton', name: 'Edmonton' },
        { id: 'winnipeg', name: 'Winnipeg' },
        { id: 'quebec', name: 'Québec' },
        { id: 'hamilton', name: 'Hamilton' },
        { id: 'kitchener', name: 'Kitchener' }
      ],
      nationalities: [
        { id: 'canadian', name: 'Canadienne' },
        { id: 'indian', name: 'Indienne' },
        { id: 'chinese', name: 'Chinoise' },
        { id: 'pakistani', name: 'Pakistanaise' },
        { id: 'philippine', name: 'Philippine' },
        { id: 'iranian', name: 'Iranienne' },
        { id: 'egyptian', name: 'Égyptienne' },
        { id: 'lebanese', name: 'Libanaise' },
        { id: 'syrian', name: 'Syrienne' },
        { id: 'other', name: 'Autre' }
      ]
    },
    {
      id: 'usa',
      name: 'États-Unis',
      cities: [
        { id: 'newyork', name: 'New York' },
        { id: 'losangeles', name: 'Los Angeles' },
        { id: 'chicago', name: 'Chicago' },
        { id: 'houston', name: 'Houston' },
        { id: 'phoenix', name: 'Phoenix' },
        { id: 'philadelphia', name: 'Philadelphie' },
        { id: 'sanantonio', name: 'San Antonio' },
        { id: 'sandiego', name: 'San Diego' },
        { id: 'dallas', name: 'Dallas' },
        { id: 'sanjose', name: 'San José' }
      ],
      nationalities: [
        { id: 'american', name: 'Américaine' },
        { id: 'mexican', name: 'Mexicaine' },
        { id: 'indian', name: 'Indienne' },
        { id: 'chinese', name: 'Chinoise' },
        { id: 'filipino', name: 'Philippine' },
        { id: 'vietnamese', name: 'Vietnamienne' },
        { id: 'cuban', name: 'Cubaine' },
        { id: 'dominican', name: 'Dominicaine' },
        { id: 'puerto_rican', name: 'Portoricaine' },
        { id: 'other', name: 'Autre' }
      ]
    },
    {
      id: 'uk',
      name: 'Royaume-Uni',
      cities: [
        { id: 'london', name: 'Londres' },
        { id: 'birmingham', name: 'Birmingham' },
        { id: 'manchester', name: 'Manchester' },
        { id: 'leeds', name: 'Leeds' },
        { id: 'glasgow', name: 'Glasgow' },
        { id: 'sheffield', name: 'Sheffield' },
        { id: 'bradford', name: 'Bradford' },
        { id: 'liverpool', name: 'Liverpool' },
        { id: 'edinburgh', name: 'Édimbourg' },
        { id: 'bristol', name: 'Bristol' }
      ],
      nationalities: [
        { id: 'british', name: 'Britannique' },
        { id: 'indian', name: 'Indienne' },
        { id: 'pakistani', name: 'Pakistanaise' },
        { id: 'bangladeshi', name: 'Bangladaise' },
        { id: 'nigerian', name: 'Nigériane' },
        { id: 'polish', name: 'Polonaise' },
        { id: 'jamaican', name: 'Jamaïcaine' },
        { id: 'ghanaian', name: 'Ghanéenne' },
        { id: 'kenyan', name: 'Kényane' },
        { id: 'other', name: 'Autre' }
      ]
    },
    {
      id: 'germany',
      name: 'Allemagne',
      cities: [
        { id: 'berlin', name: 'Berlin' },
        { id: 'hamburg', name: 'Hambourg' },
        { id: 'munich', name: 'Munich' },
        { id: 'cologne', name: 'Cologne' },
        { id: 'frankfurt', name: 'Francfort' },
        { id: 'stuttgart', name: 'Stuttgart' },
        { id: 'dusseldorf', name: 'Düsseldorf' },
        { id: 'dortmund', name: 'Dortmund' },
        { id: 'essen', name: 'Essen' },
        { id: 'leipzig', name: 'Leipzig' }
      ],
      nationalities: [
        { id: 'german', name: 'Allemande' },
        { id: 'turkish', name: 'Turque' },
        { id: 'polish', name: 'Polonaise' },
        { id: 'russian', name: 'Russe' },
        { id: 'italian', name: 'Italienne' },
        { id: 'romanian', name: 'Roumanie' },
        { id: 'greek', name: 'Grecque' },
        { id: 'croatian', name: 'Croate' },
        { id: 'serbian', name: 'Serbe' },
        { id: 'other', name: 'Autre' }
      ]
    },
    {
      id: 'australia',
      name: 'Australie',
      cities: [
        { id: 'sydney', name: 'Sydney' },
        { id: 'melbourne', name: 'Melbourne' },
        { id: 'brisbane', name: 'Brisbane' },
        { id: 'perth', name: 'Perth' },
        { id: 'adelaide', name: 'Adélaïde' },
        { id: 'goldcoast', name: 'Gold Coast' },
        { id: 'canberra', name: 'Canberra' },
        { id: 'newcastle', name: 'Newcastle' },
        { id: 'wollongong', name: 'Wollongong' },
        { id: 'logan', name: 'Logan' }
      ],
      nationalities: [
        { id: 'australian', name: 'Australienne' },
        { id: 'english', name: 'Anglaise' },
        { id: 'chinese', name: 'Chinoise' },
        { id: 'indian', name: 'Indienne' },
        { id: 'italian', name: 'Italienne' },
        { id: 'greek', name: 'Grecque' },
        { id: 'vietnamese', name: 'Vietnamienne' },
        { id: 'lebanese', name: 'Libanaise' },
        { id: 'filipino', name: 'Philippine' },
        { id: 'other', name: 'Autre' }
      ]
    }
  ];

  // Fonctions pour obtenir les options filtrées
  const getAvailableCities = (countryId) => {
    const country = countriesData.find(c => c.id === countryId);
    return country ? country.cities : [];
  };

  const getAvailableNationalities = (countryId) => {
    const country = countriesData.find(c => c.id === countryId);
    return country ? country.nationalities : [];
  };

  const [selectedVisaType, setSelectedVisaType] = useState(null);
  const [localVisaTypes, setLocalVisaTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(formData.destination || 'France');
  
  // Keep selectedDestination in sync with formData.destination
  useEffect(() => {
    if (formData.destination && formData.destination !== selectedDestination) {
      setSelectedDestination(formData.destination);
    }
  }, [formData.destination]);

  // Get current country name and filter destinations
  const currentCountryName = countriesData.find(c => c.id === formData.currentCountry)?.name;
  const allDestinations = ['France', 'Canada', 'États-Unis', 'Royaume-Uni', 'Allemagne', 'Australie', 'Espace Schengen'];
  const availableDestinations = useMemo(() =>
    allDestinations.filter(dest => dest !== currentCountryName),
    [currentCountryName]
  );

  // Filter visa types based on selected country
  const filteredVisaTypes = useMemo(() => {
    // Early return if no destination selected or no visa types available
    if (!selectedDestination || !visaTypes || !Array.isArray(visaTypes) || visaTypes.length === 0) {
      console.log('No visa types available or no destination selected');
      return [];
    }
    
    console.log('Filtering visa types. Selected destination:', selectedDestination);
    console.log('Available visa types:', visaTypes);
    
    const destination = String(selectedDestination).toLowerCase();
    
    // Find the country in our countries data that matches the selected destination
    const selectedCountry = countriesData.find(c => 
      c.name.toLowerCase() === destination
    );
    
    const filtered = visaTypes.filter(type => {
      if (!type) return false;
      
      // Get the country from the visa type (could be ID, object, or name)
      const typeCountry = type.country;
      const countryName = type.country_name; // From the serializer
      
      // Check for direct name match (from country_name field)
      if (countryName && countryName.toLowerCase() === destination) {
        console.log(`Matched visa type ${type.name} by country_name`);
        return true;
      }
      
      // Check if type.country is an object with name or id
      if (typeCountry) {
        // If it's an object with name/id
        if (typeof typeCountry === 'object') {
          if (typeCountry.name?.toLowerCase() === destination) {
            console.log(`Matched visa type ${type.name} by country object name`);
            return true;
          }
          if (selectedCountry && typeCountry.id?.toString() === selectedCountry.id) {
            console.log(`Matched visa type ${type.name} by country object ID`);
            return true;
          }
        }
        // If it's a string (country name)
        else if (typeof typeCountry === 'string' && typeCountry.toLowerCase() === destination) {
          console.log(`Matched visa type ${type.name} by country string`);
          return true;
        }
        // If it's a number (country ID)
        else if (selectedCountry && typeCountry.toString() === selectedCountry.id) {
          console.log(`Matched visa type ${type.name} by country ID`);
          return true;
        }
      }
      
      console.log('No match for visa type:', {
        typeId: type.id,
        typeName: type.name,
        typeCountry,
        countryName,
        selectedCountry: selectedCountry?.id,
        destination
      });
      
      return false;
    });
    
    console.log('Filtered visa types:', filtered);
    return filtered;
  }, [selectedDestination, visaTypes]);

  // Adjust selected destination if it matches current country
  useEffect(() => {
    if (selectedDestination === currentCountryName && availableDestinations.length > 0) {
      setSelectedDestination(availableDestinations[0]);
    }
  }, [currentCountryName, selectedDestination, availableDestinations]);

  useEffect(() => {
    if (formData.visa_type) {
      const visa = localVisaTypes.find(v => v.id === parseInt(formData.visa_type));
      setSelectedVisaType(visa);
    }
  }, [formData.visa_type, localVisaTypes]);

  // Pré-remplir les sélecteurs quand les données viennent de l'assistant
  useEffect(() => {
    // Si current_address contient une ville et un pays (format: "Ville, Pays")
    if (formData.current_address && formData.current_address.includes(', ')) {
      const [cityName, countryName] = formData.current_address.split(', ');

      // Trouver le pays par nom
      const country = countriesData.find(c => c.name === countryName);
      if (country) {
        // Mettre à jour currentCountry
        if (!formData.currentCountry) {
          onChange('currentCountry', country.id);
        }

        // Trouver la ville par nom dans ce pays
        const city = country.cities.find(c => c.name === cityName);
        if (city && !formData.currentCity) {
          onChange('currentCity', city.id);
        }
      }
    }
  }, [formData.current_address, formData.currentCountry, formData.currentCity, onChange]);

  const handleVisaTypeChange = (visaTypeId) => {
    console.log('Visa type clicked:', visaTypeId);

    // Handle empty string (no selection)
    if (!visaTypeId || visaTypeId === '') {
      console.log('Clearing visa selection');
      setSelectedVisaType(null);
      onChange('visa_type', '');
      return;
    }

    // Convert both to string for consistent comparison
    const visaId = typeof visaTypeId === 'number' ? visaTypeId.toString() : visaTypeId;
    const visa = localVisaTypes.find(v => v.id.toString() === visaId);
    
    console.log('Found visa:', visa);
    if (visa) {
      setSelectedVisaType(visa);
      onChange('visa_type', visaId);
    } else {
      console.error('Visa not found with ID:', visaId);
      setSelectedVisaType(null);
      onChange('visa_type', '');
    }
  };

  const handleDateChange = (field, value) => {
    onChange(field, value);
  };

  const { isDarkMode } = useTheme();

  // Ajout d'une liste de visas par défaut
  const defaultVisaTypes = [
    // France
    {
      id: 'tourist-france',
      name: 'Visa Touristique',
      category: 'Court séjour',
      country_name: 'France',
      max_duration_days: 90,
      processing_time_days: 15,
      requires_biometrics: true,
      requires_hotel_booking: true,
      requires_flight_itinerary: true
    },
    {
      id: 'business-france',
      name: 'Visa Affaires',
      category: 'Court séjour',
      country_name: 'France',
      max_duration_days: 90,
      processing_time_days: 10,
      requires_biometrics: true,
      requires_employment_letter: true
    },
    {
      id: 'student-france',
      name: 'Visa Étudiant',
      category: 'Long séjour',
      country_name: 'France',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_enrollment_letter: true,
      requires_bank_statements: true
    },
    {
      id: 'work-france',
      name: 'Visa Travail',
      category: 'Long séjour',
      country_name: 'France',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_employment_contract: true
    },
    // Canada
    {
      id: 'tourist-canada',
      name: 'Visa Touristique',
      category: 'Court séjour',
      country_name: 'Canada',
      max_duration_days: 90,
      processing_time_days: 15,
      requires_biometrics: true,
      requires_hotel_booking: true,
      requires_flight_itinerary: true
    },
    {
      id: 'business-canada',
      name: 'Visa Affaires',
      category: 'Court séjour',
      country_name: 'Canada',
      max_duration_days: 90,
      processing_time_days: 10,
      requires_biometrics: true,
      requires_employment_letter: true
    },
    {
      id: 'student-canada',
      name: 'Visa Étudiant',
      category: 'Long séjour',
      country_name: 'Canada',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_enrollment_letter: true,
      requires_bank_statements: true
    },
    {
      id: 'work-canada',
      name: 'Visa Travail',
      category: 'Long séjour',
      country_name: 'Canada',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_employment_contract: true
    },
    // États-Unis
    {
      id: 'tourist-usa',
      name: 'Visa Touristique',
      category: 'Court séjour',
      country_name: 'États-Unis',
      max_duration_days: 90,
      processing_time_days: 15,
      requires_biometrics: true,
      requires_hotel_booking: true,
      requires_flight_itinerary: true
    },
    {
      id: 'business-usa',
      name: 'Visa Affaires',
      category: 'Court séjour',
      country_name: 'États-Unis',
      max_duration_days: 90,
      processing_time_days: 10,
      requires_biometrics: true,
      requires_employment_letter: true
    },
    {
      id: 'student-usa',
      name: 'Visa Étudiant',
      category: 'Long séjour',
      country_name: 'États-Unis',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_enrollment_letter: true,
      requires_bank_statements: true
    },
    {
      id: 'work-usa',
      name: 'Visa Travail',
      category: 'Long séjour',
      country_name: 'États-Unis',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_employment_contract: true
    },
    // Royaume-Uni
    {
      id: 'tourist-uk',
      name: 'Visa Touristique',
      category: 'Court séjour',
      country_name: 'Royaume-Uni',
      max_duration_days: 90,
      processing_time_days: 15,
      requires_biometrics: true,
      requires_hotel_booking: true,
      requires_flight_itinerary: true
    },
    {
      id: 'business-uk',
      name: 'Visa Affaires',
      category: 'Court séjour',
      country_name: 'Royaume-Uni',
      max_duration_days: 90,
      processing_time_days: 10,
      requires_biometrics: true,
      requires_employment_letter: true
    },
    {
      id: 'student-uk',
      name: 'Visa Étudiant',
      category: 'Long séjour',
      country_name: 'Royaume-Uni',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_enrollment_letter: true,
      requires_bank_statements: true
    },
    {
      id: 'work-uk',
      name: 'Visa Travail',
      category: 'Long séjour',
      country_name: 'Royaume-Uni',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_employment_contract: true
    },
    // Allemagne
    {
      id: 'tourist-germany',
      name: 'Visa Touristique',
      category: 'Court séjour',
      country_name: 'Allemagne',
      max_duration_days: 90,
      processing_time_days: 15,
      requires_biometrics: true,
      requires_hotel_booking: true,
      requires_flight_itinerary: true
    },
    {
      id: 'business-germany',
      name: 'Visa Affaires',
      category: 'Court séjour',
      country_name: 'Allemagne',
      max_duration_days: 90,
      processing_time_days: 10,
      requires_biometrics: true,
      requires_employment_letter: true
    },
    {
      id: 'student-germany',
      name: 'Visa Étudiant',
      category: 'Long séjour',
      country_name: 'Allemagne',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_enrollment_letter: true,
      requires_bank_statements: true
    },
    {
      id: 'work-germany',
      name: 'Visa Travail',
      category: 'Long séjour',
      country_name: 'Allemagne',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_employment_contract: true
    },
    // Australie
    {
      id: 'tourist-australia',
      name: 'Visa Touristique',
      category: 'Court séjour',
      country_name: 'Australie',
      max_duration_days: 90,
      processing_time_days: 15,
      requires_biometrics: true,
      requires_hotel_booking: true,
      requires_flight_itinerary: true
    },
    {
      id: 'business-australia',
      name: 'Visa Affaires',
      category: 'Court séjour',
      country_name: 'Australie',
      max_duration_days: 90,
      processing_time_days: 10,
      requires_biometrics: true,
      requires_employment_letter: true
    },
    {
      id: 'student-australia',
      name: 'Visa Étudiant',
      category: 'Long séjour',
      country_name: 'Australie',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_enrollment_letter: true,
      requires_bank_statements: true
    },
    {
      id: 'work-australia',
      name: 'Visa Travail',
      category: 'Long séjour',
      country_name: 'Australie',
      max_duration_days: 365,
      processing_time_days: 30,
      requires_biometrics: true,
      requires_employment_contract: true
    },
    // Espace Schengen
    {
      id: 'schengen',
      name: 'Visa Schengen',
      category: 'Court séjour',
      country_name: 'Espace Schengen',
      max_duration_days: 90,
      processing_time_days: 15,
      requires_biometrics: true,
      requires_travel_insurance: true
    }
  ];

  // Dans le useEffect de chargement des visas
  useEffect(() => {
    const fetchVisaTypes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/travel/api/visa-types/');
        // Utiliser les visas de l'API s'il y en a, sinon utiliser les visas par défaut
        setLocalVisaTypes(response.data.length > 0 ? response.data : defaultVisaTypes);
      } catch (error) {
        console.error('Erreur lors du chargement des types de visa. Utilisation des visas par défaut.', error);
        setLocalVisaTypes(defaultVisaTypes);
      } finally {
        setLoading(false);
      }
    };

    if (visaTypes?.length > 0) {
      setLocalVisaTypes(visaTypes);
      setLoading(false);
    } else {
      fetchVisaTypes();
    }
  }, [visaTypes]);

  // Set default dates
  useEffect(() => {
    if (!formData.intended_date_of_departure) {
      onChange('intended_date_of_departure', '2025-12-23');
    }
    if (!formData.length_of_stay_days) {
      onChange('length_of_stay_days', '60');
    }
  }, []);

  // Group visa types by country name
  const visaTypesByCountry = localVisaTypes.reduce((acc, visa) => {
    const countryName = visa.country_name || visa.country;
    if (!acc[countryName]) {
      acc[countryName] = [];
    }
    acc[countryName].push(visa);
    return acc;
  }, {});

  // Handle null/undefined values for form inputs
  const getSafeValue = (value) => value || '';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Sélection du visa</h2>
        <p className="text-gray-600 dark:text-gray-400">Sélectionnez le type de visa souhaité</p>
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            📋 <strong>Étape requise :</strong> Renseignez votre nationalité, le motif de votre voyage, puis sélectionnez un type de visa pour continuer.
          </p>
          {!formData.visa_type && (
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
              💡 <strong>Conseil :</strong> Pour une expérience optimisée, utilisez notre{' '}
              <a href="/immigration-assistant" className="underline hover:no-underline">
                assistant d'immigration
              </a>{' '}
              qui vous guidera dans le choix du visa adapté à votre situation.
            </p>
          )}
        </div>
      </div>

      {/* Basic Information - Always visible */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
          <CardDescription>Renseignez les informations essentielles de votre voyage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Pays de résidence actuel *
              </label>
              <Select
                value={formData.currentCountry || ''}
                onChange={(value) => {
                  onChange('currentCountry', value);
                  onChange('currentCity', ''); // Reset city when country changes
                  onChange('nationality', ''); // Reset nationality when country changes
                  // Update current_address with just the country name for now
                  onChange('current_address', countriesData.find(c => c.id === value)?.name || '');
                }}
              >
                <SelectTrigger>
                  {formData.currentCountry
                    ? countriesData.find(c => c.id === formData.currentCountry)?.name
                    : 'Sélectionnez un pays'
                  }
                </SelectTrigger>
                <SelectContent>
                  {countriesData.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Ville de résidence actuelle *
              </label>
              <Select
                value={formData.currentCity || ''}
                onChange={(value) => {
                  onChange('currentCity', value);
                  // Update current_address with city and country
                  const countryName = countriesData.find(c => c.id === formData.currentCountry)?.name;
                  const cityName = getAvailableCities(formData.currentCountry).find(c => c.id === value)?.name;
                  onChange('current_address', cityName && countryName ? `${cityName}, ${countryName}` : '');
                }}
                disabled={!formData.currentCountry}
              >
                <SelectTrigger>
                  {formData.currentCity
                    ? getAvailableCities(formData.currentCountry).find(c => c.id === formData.currentCity)?.name
                    : (formData.currentCountry ? 'Sélectionnez une ville' : 'Sélectionnez d\'abord un pays')
                  }
                </SelectTrigger>
                <SelectContent>
                  {formData.currentCountry && getAvailableCities(formData.currentCountry).map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Nationalité *
              </label>
              <Select
                value={getSafeValue(formData.nationality)}
                onChange={(value) => onChange('nationality', value)}
                disabled={!formData.currentCountry}
              >
                <SelectTrigger>
                  {formData.nationality
                    ? getAvailableNationalities(formData.currentCountry).find(n => n.id === formData.nationality)?.name
                    : (formData.currentCountry ? 'Sélectionnez votre nationalité' : 'Sélectionnez d\'abord un pays')
                  }
                </SelectTrigger>
                <SelectContent>
                  {formData.currentCountry && getAvailableNationalities(formData.currentCountry).map((nationality) => (
                    <SelectItem key={nationality.id} value={nationality.id}>
                      {nationality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Motif du voyage *
              </label>
              <textarea
                value={getSafeValue(formData.purpose_of_visit) || ''}
                onChange={(e) => onChange('purpose_of_visit', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Décrivez le but de votre voyage (études, travail, tourisme, visite familiale, etc.)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destination Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Destination</CardTitle>
          <CardDescription>Sélectionnez votre pays de destination</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Pays de destination *
            </label>
            <Select
              value={selectedDestination}
              onChange={setSelectedDestination}
            >
              <SelectTrigger>
                {selectedDestination || 'Sélectionnez une destination'}
              </SelectTrigger>
              <SelectContent>
                {availableDestinations.map(dest => (
                  <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visa Type Selection */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Type de visa souhaité pour {selectedDestination}
          </label>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Affichage des cartes de visa */}
            {filteredVisaTypes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun type de visa disponible pour {selectedDestination}.
                </p>
              </div>
            )}
            {filteredVisaTypes.map((visa) => (
              <div
                key={visa.id}
                role="button"
                tabIndex={0}
                className={`w-full text-left cursor-pointer transition-all hover:shadow-md rounded-lg border p-6 ${
                  formData.visa_type === visa.id.toString()
                    ? 'ring-2 ring-primary dark:ring-primary/80 bg-primary/5 dark:bg-primary/10'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
                onClick={(e) => {
                  console.log('Visa card clicked for visa:', visa.id);
                  e.preventDefault();
                  e.stopPropagation();
                  handleVisaTypeChange(visa.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleVisaTypeChange(visa.id);
                  }
                }}
              >
                <div className="pb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {visa.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {visa.country_name} - {visa.category}
                  </p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Traitement:</span> {visa.processing_time_days} jours
                  </p>
                  {visa.fees && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Frais:</span> {visa.fees} {visa.currency}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Travel Details - Show when visa is selected */}
      {formData.visa_type ? (
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Détails du séjour</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Date de départ prévue *
              </label>
              <Input
                type="date"
                id="intended_date_of_departure"
                value={getSafeValue(formData.intended_date_of_departure) || ''}
                onChange={(e) => handleDateChange('intended_date_of_departure', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Durée du séjour (jours)
              </label>
              <Input
                type="number"
                id="length_of_stay_days"
                value={getSafeValue(formData.length_of_stay_days) || ''}
                onChange={(e) => onChange('length_of_stay_days', e.target.value)}
                placeholder="Durée du séjour"
                min="1"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Sélectionnez un type de visa pour voir les détails du séjour et les conditions requises.
            </p>
          </div>
        </div>
      )}

      {/* Visa Requirements Preview */}
      {selectedVisaType && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Conditions du visa sélectionné
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
                  Documents requis
                </h4>
                <ul className="space-y-2">
                  {selectedVisaType.requires_biometrics && (
                    <li className="flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      <span className="text-blue-700 dark:text-blue-300">Biométrie</span>
                    </li>
                  )}
                  {selectedVisaType.requires_medical_certificate && (
                    <li className="flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      <span className="text-blue-700 dark:text-blue-300">Certificat médical</span>
                    </li>
                  )}
                  {selectedVisaType.requires_police_clearance && (
                    <li className="flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      <span className="text-blue-700 dark:text-blue-300">Casier judiciaire</span>
                    </li>
                  )}
                  {selectedVisaType.requires_bank_statements && (
                    <li className="flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      <span className="text-blue-700 dark:text-blue-300">Relevés bancaires</span>
                    </li>
                  )}
                  {selectedVisaType.requires_employment_letter && (
                    <li className="flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      <span className="text-blue-700 dark:text-blue-300">Lettre d'emploi</span>
                    </li>
                  )}
                  {selectedVisaType.requires_hotel_booking && (
                    <li className="flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      <span className="text-blue-700 dark:text-blue-300">Réservation hôtel</span>
                    </li>
                  )}
                  {selectedVisaType.requires_flight_itinerary && (
                    <li className="flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      <span className="text-blue-700 dark:text-blue-300">Itinéraire de vol</span>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
                  Informations importantes
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-blue-700 dark:text-blue-300">
                      Durée maximale: {selectedVisaType.max_duration_days} jours
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    <span className="text-blue-700 dark:text-blue-300">
                      Délai de traitement: {selectedVisaType.processing_time_days} jours
                    </span>
                  </li>
                  {selectedVisaType.fees && (
                    <li className="flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      <span className="text-blue-700 dark:text-blue-300">
                        Frais: {selectedVisaType.fees} {selectedVisaType.currency}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisaApplicationStep1;