import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, MessageCircle, FileText, CheckCircle, ArrowRight, Users, Globe, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { PUBLIC_ROUTES, CLIENT_ROUTES } from '../constants/routes';

const ImmigrationAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    purpose: '',
    timeline: '',
    nationality: '',
    currentLocation: '',
    currentCountry: '',
    currentCity: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Convert IDs to readable names for the visa application form
      const processedData = {
        ...formData,
        // Convert destination ID to country name
        selected_destination: countriesData.find(c => c.id === formData.destination)?.name || formData.destination,
        // Convert nationality ID to nationality name
        nationality: formData.currentCountry ?
          countriesData.find(c => c.id === formData.currentCountry)?.nationalities
            .find(n => n.id === formData.nationality)?.name || formData.nationality
          : formData.nationality,
        // Convert current location to readable format
        currentLocation: formData.currentCountry && formData.currentCity ?
          `${countriesData.find(c => c.id === formData.currentCountry)?.cities
            .find(city => city.id === formData.currentCity)?.name || formData.currentCity}, ${
            countriesData.find(c => c.id === formData.currentCountry)?.name || formData.currentCountry
          }` : formData.currentLocation
      };

      // Save processed form data to localStorage
      localStorage.setItem('immigrationFormData', JSON.stringify(processedData));

      // Redirect to visa application or login
      if (user) {
        navigate(CLIENT_ROUTES.VISA_APPLICATIONS_NEW, { state: { fromQuestionnaire: true } });
      } else {
        // Redirect to login with a flag to create application after login
        navigate(PUBLIC_ROUTES.LOGIN, {
          state: {
            from: CLIENT_ROUTES.VISA_APPLICATIONS_NEW,
            fromQuestionnaire: true
          }
        });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const destinations = [
    { value: 'canada', label: 'Canada' },
    { value: 'usa', label: 'États-Unis' },
    { value: 'france', label: 'France' },
    { value: 'uk', label: 'Royaume-Uni' },
    { value: 'germany', label: 'Allemagne' },
    { value: 'australia', label: 'Australie' },
    { value: 'other', label: 'Autre pays' }
  ];

  const purposes = [
    { value: 'study', label: 'Études' },
    { value: 'work', label: 'Travail' },
    { value: 'family', label: 'Regroupement familial' },
    { value: 'tourism', label: 'Tourisme' },
    { value: 'business', label: 'Affaires' },
    { value: 'other', label: 'Autre' }
  ];

  const timelines = [
    { value: 'asap', label: 'Dès que possible' },
    { value: '1-3months', label: 'Dans 1-3 mois' },
    { value: '3-6months', label: 'Dans 3-6 mois' },
    { value: '6-12months', label: 'Dans 6-12 mois' },
    { value: 'planning', label: 'Je planifie seulement' }
  ];

  // Données liées pour pays, villes et nationalités
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">Où souhaitez-vous immigrer ?</h2>
              <p className="text-gray-600 dark:text-gray-400">Sélectionnez votre destination principale</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((dest) => (
                <Card
                  key={dest.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.destination === dest.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, destination: dest.value }))}
                >
                  <CardContent className="flex items-center justify-center p-6">
                    <span className="font-medium">{dest.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">Quel est le but de votre voyage ?</h2>
              <p className="text-gray-600 dark:text-gray-400">Choisissez le type de visa qui correspond à votre projet</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {purposes.map((purpose) => (
                <Card
                  key={purpose.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.purpose === purpose.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, purpose: purpose.value }))}
                >
                  <CardContent className="p-6">
                    <span className="font-medium">{purpose.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">Quand prévoyez-vous de partir ?</h2>
              <p className="text-gray-600 dark:text-gray-400">Votre échéancier pour le projet</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {timelines.map((timeline) => (
                <Card
                  key={timeline.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.timeline === timeline.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, timeline: timeline.value }))}
                >
                  <CardContent className="p-6">
                    <span className="font-medium">{timeline.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">Informations complémentaires</h2>
              <p className="text-gray-600 dark:text-gray-400">Quelques détails pour mieux vous accompagner</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pays de résidence actuel *
                </label>
                <Select
                  value={formData.currentCountry}
                  onChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      currentCountry: value,
                      currentCity: '', // Reset city when country changes
                      nationality: '' // Reset nationality when country changes
                    }));
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ville de résidence actuelle *
                </label>
                <Select
                  value={formData.currentCity}
                  onChange={(value) => setFormData(prev => ({ ...prev, currentCity: value }))}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nationalité actuelle *
              </label>
              <Select
                value={formData.nationality}
                onChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-20 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-8 w-8" />
            </div>
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            Assistant d'Immigration IA
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            Notre assistant intelligent vous guide à travers votre projet d'immigration.
            Répondez à quelques questions et obtenez une évaluation personnalisée de votre situation.
          </p>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-white px-4 py-6 dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`ml-2 h-1 w-16 ${
                    step > stepNumber ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Étape {step} sur 4
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="flex-1 px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-8">
              {renderStep()}

              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  Précédent
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !formData.destination) ||
                    (step === 2 && !formData.purpose) ||
                    (step === 3 && !formData.timeline) ||
                    (step === 4 && (!formData.currentCountry || !formData.currentCity || !formData.nationality))
                  }
                >
                  {step === 4 ? (user ? 'Commencer ma demande de visa' : 'Commencer') : 'Suivant'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Pourquoi utiliser notre assistant ?
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Accompagnement personnalisé</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Des recommandations adaptées à votre profil et à votre situation spécifique.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Expertise internationale</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Une connaissance approfondie des réglementations de plus de 50 pays.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gain de temps</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Évitez les démarches inutiles et concentrez-vous sur l'essentiel.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-20 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Besoin d'aide supplémentaire ?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            Nos experts sont disponibles pour vous accompagner personnellement dans vos démarches.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={PUBLIC_ROUTES.CONTACT}>
              <Button variant="secondary" className="gap-2 bg-white text-primary hover:bg-blue-50">
                <MessageCircle className="h-4 w-4" />
                Nous contacter
              </Button>
            </Link>
            <Link to={PUBLIC_ROUTES.SERVICES}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <FileText className="h-4 w-4" />
                Découvrir nos services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImmigrationAssistant;