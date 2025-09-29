import React from 'react';
import DestinationCard from '../components/DestinationCard';

const destinations = [
  { name: 'Paris', image: '/paris.jpg' },
  { name: 'Dubaï', image: '/dubai.jpg' },
  { name: 'Istanbul', image: '/istanbul.jpg' },
  { name: 'Montréal', image: '/montreal.jpg' },
  { name: 'Bruxelles', image: '/bruxelles.jpg' },
];

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Destinations populaires</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {destinations.map(dest => (
          <DestinationCard key={dest.name} destination={dest} />
        ))}
      </div>
    </div>
  );
}
