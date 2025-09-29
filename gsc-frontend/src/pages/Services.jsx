import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Briefcase, Users, CreditCard, FileText, Plane, Home, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PUBLIC_ROUTES } from '../constants/routes';

const Services = () => {
  const services = [
    {
      id: 'immigration',
      icon: <Globe className="h-12 w-12 text-primary" />,
      title: 'Immigration',
      description: 'Accompagnement complet pour vos démarches d\'immigration : visa étudiant, visa travail, résidence permanente et plus encore.',
      features: ['Conseil personnalisé', 'Préparation des dossiers', 'Suivi des demandes', 'Accompagnement juridique'],
      link: PUBLIC_ROUTES.IMMIGRATION_ASSISTANT,
      popular: true,
    },
    {
      id: 'travel',
      icon: <Plane className="h-12 w-12 text-primary" />,
      title: 'Voyages',
      description: 'Réservation de billets, assurance voyage, hébergement et services connexes pour vos déplacements internationaux.',
      features: ['Réservation de vols', 'Assurance voyage', 'Hébergement', 'Transferts aéroport'],
      link: '/services/travel',
    },
    {
      id: 'administrative',
      icon: <FileText className="h-12 w-12 text-primary" />,
      title: 'Assistance Administrative',
      description: 'Traduction de documents, légalisation, certification et toutes les démarches administratives internationales.',
      features: ['Traduction certifiée', 'Légalisation', 'Apostille', 'Certification'],
      link: '/services/administrative',
    },
    {
      id: 'financial',
      icon: <CreditCard className="h-12 w-12 text-primary" />,
      title: 'Services Financiers',
      description: 'Transfert d\'argent, change de devises, conseils financiers et accompagnement bancaire international.',
      features: ['Transfert d\'argent', 'Change de devises', 'Conseils financiers', 'Ouverture de comptes'],
      link: '/services/financial',
    },
    {
      id: 'housing',
      icon: <Home className="h-12 w-12 text-primary" />,
      title: 'Logement',
      description: 'Recherche et accompagnement pour votre logement à l\'étranger : location, achat, colocation.',
      features: ['Recherche de logement', 'Visites virtuelles', 'Négociation', 'Aide à l\'installation'],
      link: '/services/housing',
    },
    {
      id: 'healthcare',
      icon: <Heart className="h-12 w-12 text-primary" />,
      title: 'Santé',
      description: 'Assurance santé internationale, prise de rendez-vous médical, et accompagnement médical à l\'étranger.',
      features: ['Assurance santé', 'Rendez-vous médicaux', 'Téléconsultation', 'Urgences médicales'],
      link: '/services/healthcare',
    },
  ];

  const testimonials = [
    {
      name: 'Marie Dupont',
      role: 'Étudiante au Canada',
      content: 'GSC m\'a accompagnée dans toutes mes démarches d\'immigration. Leur expertise et leur professionnalisme ont fait toute la différence.',
      rating: 5,
    },
    {
      name: 'Jean Martin',
      role: 'Professionnel en Allemagne',
      content: 'Service impeccable pour mon visa de travail. Tout s\'est déroulé parfaitement grâce à leur suivi personnalisé.',
      rating: 5,
    },
    {
      name: 'Sophie Laurent',
      role: 'Famille expatriée',
      content: 'Nous avons pu compter sur GSC pour notre déménagement familial. Un accompagnement de A à Z.',
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-20 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            Nos Services
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-blue-100">
            Découvrez notre gamme complète de services pour vous accompagner dans tous vos projets internationaux.
            Des experts à votre service pour une expérience sans stress.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
              Services Complets & Personnalisés
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Chaque service est adapté à vos besoins spécifiques et à votre situation personnelle.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className={`relative transition-all hover:shadow-lg ${service.popular ? 'ring-2 ring-primary' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                      Plus populaire
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-center">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-6 space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to={service.link} className="block">
                    <Button className="w-full gap-2">
                      En savoir plus
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
              Pourquoi nous choisir ?
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Experts dédiés</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Une équipe d'experts spécialisés dans l'immigration et les services internationaux.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Accompagnement complet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                De la demande initiale jusqu'à l'obtention de vos documents, nous vous accompagnons.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Réseau international</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Présents dans plus de 50 pays, nous connaissons les spécificités locales.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Service personnalisé</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chaque client est unique. Nous adaptons nos services à vos besoins spécifiques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="mb-4 flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-current text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-4 text-gray-600 dark:text-gray-400 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
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
            Prêt à commencer votre projet ?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            Nos experts sont à votre disposition pour vous accompagner dans toutes vos démarches.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT}>
              <Button variant="secondary" className="gap-2 bg-white text-primary hover:bg-blue-50">
                Démarrer maintenant
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
    </div>
  );
};

export default Services;