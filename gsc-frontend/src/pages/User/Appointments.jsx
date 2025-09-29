import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from '@/lib/axios';

// Helper function to get CSRF token
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Helper function to get status badge component based on status
const getStatusBadge = (status) => {
  switch (status) {
    case 'unread':
      return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">Non lu</Badge>;
    case 'read':
      return <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">Lu</Badge>;
    case 'canceled':
      return <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400">Annulé</Badge>;
    case 'postponed':
      return <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">Reporté</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const UserAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/travel/api/appointments/');
      setAppointments(response.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle mark as read
  const handleMarkAsRead = async (appointmentId) => {
    try {
      await axios.post(`/travel/api/appointments/${appointmentId}/mark_as_read/`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        }
      });
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error marking appointment as read:', error);
      setError('Erreur lors de la mise à jour du rendez-vous');
    }
  };

  // Separate upcoming and past appointments
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter(appointment => new Date(appointment.date) > now);
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter(appointment => new Date(appointment.date) <= now);
  }, [appointments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <div className="mt-2">
              <Button variant="outline" onClick={fetchAppointments}>
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes rendez-vous</h1>
          <p className="text-muted-foreground">
            Gérez vos rendez-vous avec nos agents
          </p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rendez-vous à venir ({upcomingAppointments.length})
          </CardTitle>
          <CardDescription>
            Vos prochains rendez-vous programmés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.reason_display}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {appointment.date_formatted}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {appointment.location_display}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Créé le {format(new Date(appointment.created_at), 'PP', { locale: fr })}
                        </div>
                      </div>
                      {appointment.message && (
                        <div className="mt-2 bg-gray-900 p-2 rounded">
                          <p className="font-semibold text-gray-900 dark:text-white">Message de l'agent :</p>
                          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {appointment.message}
                          </p>
                        </div>
                      )}
                      {appointment.new_date && (
                        <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                          Nouvelle date: {format(new Date(appointment.new_date), 'PPPp', { locale: fr })}
                        </p>
                      )}
                      {appointment.required_documents && appointment.required_documents.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Documents à apporter:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {appointment.required_documents.map((doc, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {doc.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === 'unread' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(appointment.id)}
                          className="gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Marquer comme lu
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Aucun rendez-vous à venir
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Rendez-vous passés ({pastAppointments.length})
            </CardTitle>
            <CardDescription>
              Historique de vos rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.reason_display}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {appointment.date_formatted}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {appointment.location_display}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Créé le {format(new Date(appointment.created_at), 'PP', { locale: fr })}
                        </div>
                      </div>
                      {appointment.message && (
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {appointment.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserAppointmentsPage;