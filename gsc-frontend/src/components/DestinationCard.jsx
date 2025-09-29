import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DestinationCard({ destination }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col items-center">
      <img src={destination.image} alt={destination.name} className="w-32 h-32 object-cover mb-4 rounded" />
      <h2 className="text-xl font-semibold mb-2">{destination.name}</h2>
      <button
        className="btn btn-primary"
        onClick={() => navigate(`/book?destination=${destination.name}`)}
      >
        Réserver un voyage
      </button>
    </div>
  );
}
