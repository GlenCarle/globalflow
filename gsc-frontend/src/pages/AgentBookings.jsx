import React, { useEffect, useState } from 'react';
import BookingStatusBadge from '../components/BookingStatusBadge';
import PDFDownloadButton from '../components/PDFDownloadButton';
import api from '@/lib/axios';

export default function AgentBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/travel/api/travel-bookings/').then(res => setBookings(res.data));
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Réservations (Agent)</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th>Client</th>
            <th>Destination</th>
            <th>Départ</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.user_name}</td>
              <td>{b.destination}</td>
              <td>{b.date_depart}</td>
              <td><BookingStatusBadge statut={b.statut} /></td>
              <td>
                <a href={`/booking/${b.id}`}>Détail</a>
                <PDFDownloadButton bookingId={b.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
