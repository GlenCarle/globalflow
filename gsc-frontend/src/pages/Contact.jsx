import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: 'Adresse',
      details: ['123 Avenue des Immigrations', '75001 Paris, France']
    },
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: 'Téléphone',
      details: ['+33 1 23 45 67 89', '+33 6 12 34 56 78']
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: 'Email',
      details: ['contact@gsc-immigration.fr', 'support@gsc-immigration.fr']
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: 'Horaires',
      details: ['Lundi - Vendredi: 9h - 18h', 'Samedi: 9h - 12h']
    }
  ];

  const offices = [
    {
      city: 'Paris',
      address: '123 Avenue des Immigrations, 75001 Paris',
      phone: '+33 1 23 45 67 89',
      email: 'paris@gsc-immigration.fr'
    },
    {
      city: 'Lyon',
      address: '45 Rue de la République, 69001 Lyon',
      phone: '+33 4 56 78 90 12',
      email: 'lyon@gsc-immigration.fr'
    },
    {
      city: 'Marseille',
      address: '78 Boulevard des Docks, 13001 Marseille',
      phone: '+33 4 91 23 45 67',
      email: 'marseille@gsc-immigration.fr'
    },
    {
      city: 'Douala',
      address: '25 Avenue Kennedy, Bonanjo, Douala',
      phone: '+237 233 123 456',
      email: 'douala@gsc-immigration.com'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-20 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            Contactez-nous
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-blue-100">
            Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos démarches.
            N'hésitez pas à nous contacter, nous sommes là pour vous aider.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">
                Nos coordonnées
              </h2>
              <p className="mb-8 text-gray-600 dark:text-gray-400">
                Plusieurs moyens de nous contacter selon vos préférences et votre localisation.
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                {contactInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">{info.icon}</div>
                        <div>
                          <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">{info.title}</h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-sm text-gray-600 dark:text-gray-400">{detail}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="mt-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="aspect-video rounded-lg bg-gray-200 dark:bg-gray-700">
                      <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                        <MapPin className="mr-2 h-6 w-6" />
                        Carte interactive
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">
                Envoyez-nous un message
              </h2>

              {submitted ? (
                <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <div>
                    <h4 className="font-medium">Message envoyé !</h4>
                    <p className="text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                </Alert>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nom complet *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Votre nom"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Téléphone
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+33 6 12 34 56 78"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sujet *
                          </label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            required
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Objet de votre message"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          placeholder="Décrivez votre demande..."
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="bg-slate-50 px-4 py-20 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Nos bureaux
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Présents dans plusieurs villes pour vous accompagner localement
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {offices.map((office, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{office.city}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>{office.address}</p>
                    <p>{office.phone}</p>
                    <p>{office.email}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quels sont vos délais de réponse ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Nous nous engageons à répondre à tous les messages dans un délai maximum de 24 heures ouvrées.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proposez-vous des consultations gratuites ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Oui, nous proposons une première consultation gratuite de 30 minutes pour évaluer votre situation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dans quelles langues pouvons-nous communiquer ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Nous parlons français, anglais, arabe, espagnol et plusieurs autres langues. Un interprète peut être mis à disposition si nécessaire.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;