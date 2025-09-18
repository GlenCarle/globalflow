import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    { name: 'Visa Étudiant', path: '/services/visa-etudiant' },
    { name: 'Visa Travail', path: '/services/visa-travail' },
    { name: 'Visa Tourisme', path: '/services/visa-tourisme' },
    { name: 'Résidence Permanente', path: '/services/residence-permanente' },
    { name: 'Billets d\'avion', path: '/services/billets-avion' },
  ];

  const destinations = [
    { name: 'Canada', path: '/destinations/canada' },
    { name: 'États-Unis', path: '/destinations/etats-unis' },
    { name: 'France', path: '/destinations/france' },
    { name: 'Royaume-Uni', path: '/destinations/royaume-uni' },
    { name: 'Australie', path: '/destinations/australie' },
  ];

  const company = [
    { name: 'À propos', path: '/about' },
    { name: 'Équipe', path: '/team' },
    { name: 'Carrières', path: '/careers' },
    { name: 'Témoignages', path: '/testimonials' },
    { name: 'Blog', path: '/blog' },
  ];

  const legal = [
    { name: 'Conditions d\'utilisation', path: '/terms' },
    { name: 'Politique de confidentialité', path: '/privacy' },
    { name: 'Mentions légales', path: '/legal' },
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter className="h-5 w-5" />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <Linkedin className="h-5 w-5" />, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  const contactInfo = [
    { 
      icon: <Mail className="h-5 w-5" />, 
      text: 'contact@globalservice.com',
      href: 'mailto:contact@globalservice.com'
    },
    { 
      icon: <Phone className="h-5 w-5" />, 
      text: '+237 123 456 789',
      href: 'tel:+237123456789'
    },
    { 
      icon: <MapPin className="h-5 w-5" />, 
      text: 'Douala, Cameroun',
      href: 'https://maps.google.com/?q=Douala,Cameroun'
    },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold text-primary">GSC</span>
              <span className="ml-2 text-lg font-medium text-gray-700 dark:text-gray-300">
                Global Service Corporation
              </span>
            </Link>
            <p className="mt-4 max-w-md text-gray-600 dark:text-gray-400">
              Votre partenaire de confiance pour tous vos projets d'immigration, 
              de voyage et de services administratifs à l'international.
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-primary hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-primary-600"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Services</h3>
            <ul className="mt-4 space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    to={service.path}
                    className="text-gray-600 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Destinations</h3>
            <ul className="mt-4 space-y-3">
              {destinations.map((destination, index) => (
                <li key={index}>
                  <Link
                    to={destination.path}
                    className="text-gray-600 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {destination.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact</h3>
            <ul className="mt-4 space-y-4">
              {contactInfo.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 text-gray-600 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary-400"
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              &copy; {currentYear} Global Service Corporation. Tous droits réservés.
            </p>
            <ul className="flex flex-wrap gap-6">
              {legal.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-sm text-gray-600 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;