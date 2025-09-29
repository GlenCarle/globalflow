import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Users, Shield, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PUBLIC_ROUTES } from '../constants/routes';

const ServiceDetail = () => {
  const { id } = useParams();

  // Mock service data - in a real app, this would come from an API
  const serviceData = {
    immigration: {
      title: 'Services d\'Immigration',
      subtitle: 'Accompagnement complet pour vos démarches d\'immigration',
      description: 'Notre équipe d\'experts vous accompagne dans toutes vos démarches d\'immigration, de la demande initiale jusqu\'à l\'obtention de vos documents officiels.',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      features: [
        'Conseil personnalisé selon votre profil',
        'Préparation complète des dossiers',
        'Suivi en temps réel de vos demandes',
        'Accompagnement juridique spécialisé',
        'Support multilingue',
        'Garantie de satisfaction'
      ],
      process: [
        { step: 1, title: 'Consultation initiale', description: 'Analyse de votre situation et définition de votre projet' },
        { step: 2, title: 'Préparation du dossier', description: 'Rassemblement et vérification de tous les documents requis' },
        { step: 3, title: 'Soumission de la demande', description: 'Dépôt officiel auprès des autorités compétentes' },
        { step: 4, title: 'Suivi et accompagnement', description: 'Suivi régulier jusqu\'à l\'obtention de votre visa' }
      ],
      testimonials: [
        {
          name: 'Ahmed K.',
          country: 'Maroc',
          content: 'Service exceptionnel ! Mon visa canadien a été obtenu en seulement 3 mois grâce à leur expertise.',
          rating: 5
        },
        {
          name: 'Fatima Z.',
          country: 'Algérie',
          content: 'Très professionnels et à l\'écoute. Ils m\'ont guidée à chaque étape de ma demande de visa.',
          rating: 5
        }
      ],
      pricing: {
        basic: { name: 'Consultation', price: '50€', features: ['Conseil initial', 'Évaluation de dossier', 'Liste des documents'] },
        standard: { name: 'Accompagnement Standard', price: '299€', features: ['Tout du Basic', 'Préparation du dossier', 'Suivi de la demande', 'Support par email'], popular: true },
        premium: { name: 'Accompagnement Premium', price: '499€', features: ['Tout du Standard', 'Accompagnement juridique', 'Support téléphonique', 'Urgences 24/7'] }
      }
    }
  };

  const service = serviceData[id] || serviceData.immigration;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-20 text-white">
        <div className="absolute inset-0 opacity-20">
          <img src={service.image} alt={service.title} className="h-full w-full object-cover" />
        </div>
        <div className="container relative mx-auto max-w-6xl">
          <Link to={PUBLIC_ROUTES.SERVICES} className="mb-6 inline-flex items-center gap-2 text-blue-100 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            {service.title}
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-blue-100">
            {service.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT}>
              <Button size="lg" className="gap-2 bg-white text-primary hover:bg-blue-50">
                Commencer maintenant
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">
                À propos de ce service
              </h2>
              <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                {service.description}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
                Avantages clés
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Sécurité garantie</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Protection de vos données personnelles</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Rapidité d'exécution</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Traitement accéléré de vos demandes</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Support personnalisé</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Accompagnement par des experts dédiés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Notre processus
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Un accompagnement structuré et transparent à chaque étape de votre démarche
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                  {step.step}
                </div>
                <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Nos tarifs
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Des formules adaptées à vos besoins et à votre budget
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {Object.entries(service.pricing).map(([key, plan]) => (
              <Card key={key} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Recommandé</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? '' : 'variant-outline'}`}>
                    Choisir cette formule
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Témoignages clients
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {service.testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800">
                <CardContent className="pt-6">
                  <div className="mb-4 flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current text-yellow-500" />
                    ))}
                  </div>
                  <p className="mb-4 text-gray-600 dark:text-gray-400 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.country}</p>
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
            Prêt à commencer ?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            Contactez-nous dès aujourd'hui pour une consultation gratuite et personnalisée.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT}>
              <Button variant="secondary" className="gap-2 bg-white text-primary hover:bg-blue-50">
                Démarrer mon projet
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

export default ServiceDetail;