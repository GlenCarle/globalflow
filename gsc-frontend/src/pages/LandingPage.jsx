import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Briefcase, Users, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { PUBLIC_ROUTES } from '../constants/routes';

const LandingPage = () => {
  const services = [
    {
      icon: <Globe className="h-10 w-10 text-primary" />,
      title: 'Immigration',
      description: 'Visa étudiant, visa travail, résidence permanente et plus encore.',
      link: '/services?category=immigration',
    },
    {
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      title: 'Voyages',
      description: 'Réservation de billets, assurance voyage, hébergement et plus encore.',
      link: '/services?category=travel',
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: 'Assistance Administrative',
      description: 'Traduction de documents, légalisation, certification et plus encore.',
      link: '/services?category=administrative',
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: 'Services Financiers',
      description: 'Transfert d\'argent, change de devises, conseils financiers et plus encore.',
      link: '/services?category=financial',
    },
  ];

  const destinations = [
    { name: 'Canada', image: 'https://images.unsplash.com/photo-1569681157442-5eabf7fe850e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { name: 'États-Unis', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80' },
    { name: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1173&q=80' },
    { name: 'Royaume-Uni', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
    { name: 'Australie', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1530&q=80' },
    { name: 'Allemagne', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-20 text-white">
        <div className="absolute inset-0 z-0 opacity-20" style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1174&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        
        <div className="container relative z-10 mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Votre projet de vie à l'étranger commence ici
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100 md:text-xl">
            Nous vous accompagnons dans toutes vos démarches d'immigration, de voyage et de services administratifs à l'international.
          </p>
          
          {/* Search/Filter Bar */}
          <div className="mx-auto mb-8 max-w-3xl rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800 md:p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <select className="w-full rounded-md border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-primary focus:ring-primary dark:border-gray-600 dark:text-gray-200">
                  <option value="">Type de projet</option>
                  <option value="student">Études à l'étranger</option>
                  <option value="work">Travail à l'étranger</option>
                  <option value="permanent">Résidence permanente</option>
                  <option value="tourism">Tourisme</option>
                </select>
              </div>
              <div className="flex-1">
                <select className="w-full rounded-md border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-primary focus:ring-primary dark:border-gray-600 dark:text-gray-200">
                  <option value="">Destination</option>
                  <option value="canada">Canada</option>
                  <option value="usa">États-Unis</option>
                  <option value="france">France</option>
                  <option value="uk">Royaume-Uni</option>
                  <option value="australia">Australie</option>
                  <option value="germany">Allemagne</option>
                </select>
              </div>
              <div>
                <Link to={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT}>
                  <Button className="w-full">Commencer</Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={PUBLIC_ROUTES.SERVICES}>
              <Button variant="secondary" className="gap-2 bg-white text-primary hover:bg-blue-50">
                Découvrir nos services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={PUBLIC_ROUTES.CONTACT}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
              Nos Services
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Découvrez notre gamme complète de services pour vous accompagner dans tous vos projets internationaux.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="mb-2">{service.icon}</div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{service.description}</CardDescription>
                  <Link to={service.link} className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                    En savoir plus
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to={PUBLIC_ROUTES.SERVICES}>
              <Button variant="outline" className="gap-2">
                Voir tous nos services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
              Destinations Populaires
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Explorez les destinations les plus prisées pour l'immigration, les études et le travail à l'étranger.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination, index) => (
              <Link 
                key={index} 
                to={`/destinations/${destination.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-lg"
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
              Témoignages
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Découvrez ce que nos clients disent de nos services et de leur expérience avec Global Service Corporation.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="mb-4 flex">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-current text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    "GSC m'a accompagné tout au long de mon processus d'immigration au Canada. Leur expertise et leur professionnalisme ont fait toute la différence. Je recommande vivement leurs services !"
                  </p>
                  <div className="flex items-center">
                    <div className="mr-4 h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full w-full bg-primary/20" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Client {index + 1}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Étudiant au Canada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-20 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Prêt à concrétiser votre projet international ?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            Nos experts sont à votre disposition pour vous accompagner dans toutes vos démarches.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT}>
              <Button variant="secondary" className="gap-2 bg-white text-primary hover:bg-blue-50">
                Démarrer mon projet
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={PUBLIC_ROUTES.CONTACT}>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Prendre rendez-vous
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;