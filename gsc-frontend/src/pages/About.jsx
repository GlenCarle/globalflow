import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, Globe, Heart, Target, Shield, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PUBLIC_ROUTES } from '../constants/routes';

const About = () => {
  const stats = [
    { number: '5000+', label: 'Clients satisfaits' },
    { number: '50+', label: 'Pays desservis' },
    { number: '98%', label: 'Taux de réussite' },
    { number: '15+', label: 'Années d\'expérience' }
  ];

  const values = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Fiabilité',
      description: 'Nous garantissons la sécurité et la confidentialité de vos données personnelles.'
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Empathie',
      description: 'Nous comprenons vos aspirations et vous accompagnons avec bienveillance.'
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans chaque service que nous proposons.'
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: 'International',
      description: 'Notre réseau mondial nous permet de vous accompagner partout dans le monde.'
    }
  ];

  const team = [
    {
      name: 'Marie Dubois',
      role: 'Directrice Générale',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: '15 ans d\'expérience en immigration internationale'
    },
    {
      name: 'Ahmed Bennani',
      role: 'Directeur des Opérations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: 'Spécialiste en visas et démarches administratives'
    },
    {
      name: 'Sophie Martin',
      role: 'Responsable Clientèle',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      bio: 'Experte en accompagnement personnalisé'
    }
  ];

  const certifications = [
    'Certification ISO 9001',
    'Agrément officiel immigration',
    'Partenaire des ambassades',
    'Membre de l\'association internationale'
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-20 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            À propos de Global Service Corporation
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-blue-100">
            Depuis plus de 15 ans, nous accompagnons les personnes et les familles dans leurs projets d'immigration et de mobilité internationale.
            Notre expertise et notre réseau mondial font de nous le partenaire de confiance pour vos démarches.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">
                Notre histoire
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  Fondée en 2008, Global Service Corporation est née de la volonté d'accompagner les personnes dans leurs projets de vie internationale.
                  Notre fondatrice, Marie Dubois, a elle-même vécu l'expérience de l'immigration et a compris les défis que représentent ces démarches.
                </p>
                <p>
                  Aujourd'hui, nous sommes une équipe de plus de 50 professionnels répartis dans 15 pays, tous dédiés à vous offrir un service d'excellence.
                  Notre approche personnalisée et notre expertise technique nous permettent d'accompagner plus de 5000 clients par an vers la réussite de leurs projets.
                </p>
                <p>
                  Nous croyons que chaque personne mérite de pouvoir réaliser ses aspirations, quels que soient les obstacles administratifs ou géographiques.
                  C'est pourquoi nous nous engageons à rendre les démarches d'immigration accessibles et transparentes.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Notre équipe"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Nos valeurs
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Les principes qui guident notre action au quotidien
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {value.icon}
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Notre équipe
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Des experts passionnés à votre service
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="mx-auto mb-4 h-32 w-32 rounded-full object-cover"
                  />
                  <h3 className="mb-1 font-semibold text-gray-800 dark:text-white">{member.name}</h3>
                  <p className="mb-3 text-sm text-primary">{member.role}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Certifications & Partenariats
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Notre engagement qualité reconnu par les autorités internationales
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-medium text-gray-800 dark:text-white">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-20 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Rejoignez nos clients satisfaits
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            Plus de 5000 personnes nous font déjà confiance pour leurs projets internationaux.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={PUBLIC_ROUTES.IMMIGRATION_ASSISTANT}>
              <Button variant="secondary" className="gap-2 bg-white text-primary hover:bg-blue-50">
                Commencer maintenant
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

export default About;